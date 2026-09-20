import { stripe } from "../config/stripe.js";
import { Usermodel } from "../models/Usermodel.js";


export const createConnectAccount = async (req, res) => {
  try {
    const user = await Usermodel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let accountId = user.stripeAccountId;

   
    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        display_name: user.name || user.email,
        identity: {
          country: "us",
          entity_type: "individual", // use "company" for businesses
        },
        configuration: {
          merchant: {
            capabilities: {
              card_payments: { requested: true },
            },
          },
        
        },
        defaults: {
          responsibilities: {
            fees_collector: "application",     // "stripe" | "application"
            losses_collector: "application",   // must be "application" if fees are application
            // requirements_collector: "stripe",  // Stripe collects KYC by default
          },
        },
        dashboard: "express", // "express" | "full" | "none"
        include: [
          "configuration.merchant",
          "identity",
          "defaults",
          "requirements",
        ],
      });

      accountId = account.id;
      user.stripeAccountId = accountId;
      await user.save();
    }

    // Create the v2 account link for onboarding
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant"], // must match configs on the account
          refresh_url: `${process.env.CLIENT_URL}/connect-stripe?refresh=true`,
          return_url: `${process.env.CLIENT_URL}/dashboard?onboarded=true`,
        },
      },
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    console.error("Stripe v2 Error Details:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


export const verifyStripeAccount = async (req, res) => {
  try {
    const user = await Usermodel.findById(req.user._id);

    if (!user || !user.stripeAccountId) {
      return res.status(400).json({
        success: false,
        message: "No Stripe account connected",
      });
    }

    const account = await stripe.v2.core.accounts.retrieve(user.stripeAccountId, {
      include: [
        "configuration.merchant",
        "configuration.recipient",
        "requirements",
        "future_requirements",
      ],
    });


    const merchantCaps = account.configuration?.merchant?.capabilities ?? {};
    const recipientCaps = account.configuration?.recipient?.capabilities ?? {};

    const cardPaymentsActive = merchantCaps.card_payments?.status === "active";
    const transfersActive =
      recipientCaps.stripe_balance?.stripe_transfers?.status === "active";

    
    const isComplete = cardPaymentsActive;

    user.stripeConnected = isComplete;
    await user.save();

    // Detect outstanding requirements (if collector = "stripe", show status only)
    const currentlyDue = account.requirements?.currently_due ?? [];
    const pastDue = account.requirements?.past_due ?? [];

    return res.status(200).json({
      success: true,
      connected: isComplete,
      cardPaymentsStatus: merchantCaps.card_payments?.status ?? "unknown",
      transfersStatus:
        recipientCaps.stripe_balance?.stripe_transfers?.status ?? "unknown",
      currentlyDue,
      pastDue,
      dashboard: account.dashboard,
    });
  } catch (error) {
    console.error("verifyStripeAccount error:", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};


export const disconnectStripe = async (req, res) => {
  try {
    const user = await Usermodel.findById(req.user._id);

    if (!user || !user.stripeAccountId) {
      return res.status(400).json({
        success: false,
        message: "No Stripe account connected",
      });
    }

   
    try {
      const account = await stripe.v2.core.accounts.retrieve(user.stripeAccountId, {
        include: ["configuration.merchant", "configuration.recipient"],
      });

      const applied = account.applied_configurations ?? [];

      await stripe.v2.core.accounts.close(user.stripeAccountId, {
        applied_configurations: applied,
      });
    } catch (err) {
      console.warn("Could not close Stripe v2 account:", err.message);
    }

    user.stripeAccountId = null;
    user.stripeConnected = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Stripe account disconnected",
    });
  } catch (error) {
    console.error("disconnectStripe error:", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};

/**
 * OPTIONAL — Dashboard login link so the user can manage their Stripe account.
 */
export const createDashboardLink = async (req, res) => {
  try {
    const user = await Usermodel.findById(req.user._id);

    if (!user || !user.stripeAccountId || !user.stripeConnected) {
      return res.status(400).json({
        success: false,
        message: "Stripe account not connected",
      });
    }

    // Fixed: use standard stripe.accounts.createLoginLink instead of v2
    const loginLink = await stripe.v2.core.accounts.createLoginLink(
      user.stripeAccountId
    );

    return res.status(200).json({ success: true, url: loginLink.url });
  } catch (error) {
    console.error("createDashboardLink error:", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};