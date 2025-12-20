import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "authorities", user.uid));

      if (snap.exists()) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Checking access...</div>;

  if (!authorized) return <Navigate to="/login" replace />;

  return children;
}
