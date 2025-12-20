import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function AuthoritySignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔒 Allow signup only once
  useEffect(() => {
    const checkAuthorityExists = async () => {
      const snapshot = await getDocs(collection(db, "authorities"));
      if (!snapshot.empty) {
        navigate("/login");
      }
    };
    checkAuthorityExists();
  }, [navigate]);

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
        createdAt: serverTimestamp(),
      });

      // 🔐 Force login flow
      await auth.signOut();

      alert(
        `Signup successful!\n\nYour Authority ID:\n${authorityId}\n\nPlease login to continue.`
      );

      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Authority Signup</h2>
      <p>One-time setup for Panchayat Authority</p>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Official Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 16 }}
        />

        <button type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Creating account..." : "Create Authority Account"}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#2563eb" }}>
          Login
        </Link>
      </p>
    </div>
  );
}
