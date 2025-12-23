import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function AuthoritySignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateAuthorityId = (uid) => {
    const shortUid = uid.slice(-4).toUpperCase();
    const year = new Date().getFullYear();
    return `AUTH-${year}-${shortUid}`;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const authorityId = generateAuthorityId(user.uid);

      await setDoc(doc(db, "authorities", user.uid), {
        authorityId,
        email: user.email,
        role: "Panchayat Authority",
        createdAt: serverTimestamp(),
      });

      await auth.signOut();

      alert(
        `Signup Successful!\n\nAuthority ID: ${authorityId}\n\nPlease login to continue.`
      );

      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.icon}>🛡️</div>
        <h1 style={styles.headerTitle}>AUTHORITY</h1>
        <p style={styles.headerSubtitle}>SAMPARKA</p>
      </div>

      {/* Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Authority Registration</h2>
        <p style={styles.cardSubtitle}>
          One-time setup for Panchayat administrators
        </p>

        <form onSubmit={handleSignup}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Official Email Address</label>
            <input
              type="email"
              placeholder="authority@panchayat.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Create Password</label>
            <input
              type="password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating Account..." : "Register Authority"}
          </button>
        </form>

        <div style={styles.footer}>
          Already registered?{" "}
          <Link to="/login" style={styles.link}>
            Login to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Segoe UI, Tahoma, sans-serif",
  },

  header: {
    textAlign: "center",
    marginTop: "60px",
    marginBottom: "30px",
  },

  icon: {
    width: "70px",
    height: "70px",
    margin: "auto",
    borderRadius: "50%",
    background: "#e7f5ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  headerTitle: {
    margin: "15px 0 5px",
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },

  headerSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },

  card: {
    width: "420px",
    background: "#ffffff",
    padding: "28px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "4px",
  },

  cardSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },

  formGroup: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#261c5cff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "10px",
    opacity: 1,
  },

  footer: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "14px",
    color: "#253b60ff",
  },

  link: {
    color: "#253b60ff",
    fontWeight: "500",
    textDecoration: "none",
  },
};
