import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";


import axios from "axios"
import { useAuth } from "../../context/authcontext.js";

export const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // If returning from Stripe onboarding with ?onboarded=true, verify once
  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get("/api/v1/stripe/verify");
        await refreshUser();
        toast.success("Stripe account connected 🎉");
      } catch {}
    };
    if (params.get("onboarded") === "true") verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openStripeDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/stripe/dashboard-link");
      window.open(data.url, "_blank");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to open dashboard");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    // if (!confirm("Disconnect Stripe account?")) return;
    try {
      await axios.post("/api/v1/stripe/disconnect");
      await refreshUser();
      toast.success("Stripe disconnected");
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  return (
    <div style={styles.wrap}>
      <h1>Dashboard</h1>
      <p>Welcome, <b>{user?.name}</b> ({user?.email})</p>

      <div style={styles.card}>
        <h3>Stripe Connection</h3>
        {user?.stripeConnected ? (
          <>
            <p style={{ color: "green", fontWeight: 600 }}>✅ Connected</p>
            <p style={{ fontSize: 13, color: "#666" }}>
              Account ID: {user.stripeAccountId}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={openStripeDashboard} disabled={loading} style={styles.btn}>
                Open Stripe Dashboard
              </button>
              <button onClick={disconnect} style={styles.danger}>Disconnect</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: "#b45309", fontWeight: 600 }}>⚠️ Not connected</p>
            <a href="/connect-stripe" style={styles.link}>Connect Stripe →</a>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrap: { padding: 40, maxWidth: 720, margin: "0 auto" },
  card: { marginTop: 24, background: "#fff", padding:"2px" }
}