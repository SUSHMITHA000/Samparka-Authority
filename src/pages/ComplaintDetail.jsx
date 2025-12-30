import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

export default function ComplaintDetail({
  complaint,
  onBack,
  onSave,
  authorities = []
}) {
  const [draft, setDraft] = useState(complaint);
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState(null);

  useEffect(() => {
    setDraft(complaint);
  }, [complaint]);

  if (!draft) return <div>No complaint selected</div>;

  const handleChange = (k, v) => setDraft({ ...draft, [k]: v });

  const handleUpdateStatus = async () => {
    if (onSave) onSave({ ...draft });
  };

  const handleAssign = (name) => {
    const next = { ...draft, authority: name };
    setDraft(next);
    if (onSave) onSave(next);
  };

  /* =====================================================
     🔔 CREATE OR UPDATE FIRESTORE NOTIFICATION
     ===================================================== */
  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert("Message cannot be empty");
      return;
    }

    if (!draft?.userId) {
      alert("userId missing in complaint");
      return;
    }

    try {
      let notificationId = draft.notificationId;

      // 🔹 CREATE (random ID)
      if (!notificationId) {
        const notifRef = await addDoc(
          collection(db, "users", draft.userId, "notifications"),
          {
            title: "Complaint Update",
            message: message,
            complaintId: draft.id,
            read: false,
            createdAt: serverTimestamp()
          }
        );

        notificationId = notifRef.id;

        // 🔹 SAVE notificationId in issue
        await updateDoc(doc(db, "issues", draft.id), {
          notificationId: notificationId
        });

        setDraft(prev => ({ ...prev, notificationId }));
      }
      // 🔹 UPDATE EXISTING
      else {
        await updateDoc(
          doc(
            db,
            "users",
            draft.userId,
            "notifications",
            notificationId
          ),
          {
            message: message,
            read: false,
            updatedAt: serverTimestamp()
          }
        );
      }

      setMessage("");
      alert("Notification sent successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to send notification");
    }
  };

  const handleFile = (files) => {
    if (files && files.length) setProof(files[0]);
  };

  const handleMarkResolved = () => {
    const next = { ...draft, status: "Completed" };
    if (onSave) onSave(next);
    alert("Marked as resolved");
  };

  return (
    <div className="complaint-detail">
      <button className="btn" onClick={onBack}>
        ← Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* LEFT */}
        <div className="panel">
          <img
            src={draft.img}
            alt=""
            style={{ width: "100%", maxHeight: 300, objectFit: "contain" }}
          />

          <h3>{draft.title}</h3>
          <p>{draft.desc}</p>

          <p><strong>Location:</strong> {draft.location}</p>
          <p><strong>Date:</strong> {draft.date}</p>

          {draft.status !== "Completed" && (
            <>
              <input
                type="file"
                onChange={(e) => handleFile(e.target.files)}
              />
              {proof && <p>{proof.name}</p>}
              <button
                className="btn"
                style={{ background: "#16a34a", color: "#fff" }}
                onClick={handleMarkResolved}
              >
                Mark as Resolved
              </button>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <div className="panel">
            <div className="panel-title">Update Status</div>
            <select
              value={draft.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <button
              className="btn"
              style={{ background: "#16a34a", color: "#fff", width: "100%" }}
              onClick={handleUpdateStatus}
            >
              Update Status
            </button>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Assign Authority</div>
            <select
              value={draft.authority || ""}
              onChange={(e) => handleAssign(e.target.value)}
            >
              <option value="">Unassigned</option>
              {authorities.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Send Update to Citizen</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              style={{ width: "100%", minHeight: 100 }}
            />
            <button
              className="btn"
              style={{ marginTop: 12, width: "100%" }}
              onClick={handleSendMessage}
            >
              Send Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
