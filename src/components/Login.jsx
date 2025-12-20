import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // 2️⃣ CHECK authority existence
      const authorityDoc = await getDoc(doc(db, "authorities", uid));

      if (!authorityDoc.exists()) {
        // ❌ NOT an authority
        await signOut(auth);
        alert("Access denied. You are not an authorized authority.");
        return;
      }

      // ✅ AUTHORIZED
      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Authority Login</h2>
      <p>Login using official credentials</p>

      <form onSubmit={handleLogin}>
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        New authority? <Link to="/signup">Create Authority Account</Link>
      </p>
    </div>
  );
}
