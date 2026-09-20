import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/authcontext.js";



const ConnectStripe = () => {
 const {refreshUser}=useAuth()
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // If user returned from Stripe with ?refresh=true, re-verify
  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get("/api/v1/stripe/verify");
        await refreshUser();
        toast.success("Stripe account verified!");
        navigate("/dashboard");
      } catch {
        // user hasn't finished onboarding
      }
    };

    if (params.get("refresh") === "true") {
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/stripe/connect");
      // Redirect user to Stripe-hosted onboarding
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect Stripe");
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.badge}>STRIPE</div>
        <h2 style={styles.title}>Connect your Stripe account</h2>
        <p style={styles.sub}>
          Connect your Stripe account to receive payments directly. You'll be
          redirected to Stripe to complete a quick onboarding.
        </p>

        <button onClick={handleConnect} disabled={loading} style={styles.btn}>
          {loading ? "Redirecting..." : "Connect with Stripe"}
        </button>

        <p style={styles.note}>
          🔒 We never see or store your card details. All data is handled by Stripe.
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrap: { minHeight: "80vh", display: "grid", placeItems: "center", background: "#f4f5f7" },
  card: { background: "#fff", padding: 40, borderRadius: 16, maxWidth: 460,
          textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,.08)" },
  badge: { display: "inline-block", background: "#635bff", color: "#fff",
           padding: "4px 12px", borderRadius: 999, fontSize: 12, letterSpacing: 1, fontWeight: 700 },
  title: { marginTop: 16, marginBottom: 8 },
  sub: { color: "#555", lineHeight: 1.5 },
  btn: { marginTop: 24, padding: "12px 24px", background: "#635bff", color: "#fff",
         border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 16 },
  note: { marginTop: 16, fontSize: 12, color: "#888" },
};

export default ConnectStripe;