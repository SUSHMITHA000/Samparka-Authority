import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc as fsDoc,
  getDoc,
  doc
} from "firebase/firestore";

import { auth, db } from "../firebase";
import ComplaintDetail from "../pages/ComplaintDetail";

/* ---------------- SIDEBAR ---------------- */
function Sidebar({ onLogout, active, setActive, authority }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">NG</div>
        <div>
          <div className="brand-title">Samparka</div>
          <div className="brand-sub">Admin Portal</div>

          {authority && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              <div><strong>ID:</strong> {authority.authorityId}</div>
              <div>{authority.email}</div>
            </div>
          )}
        </div>
      </div>

      <nav className="nav">
        <button
          className={`nav-item ${active === "dashboard" ? "active" : ""}`}
          onClick={() => setActive("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`nav-item ${active === "complaints" ? "active" : ""}`}
          onClick={() => setActive("complaints")}
        >
          Complaints
        </button>

        <button
          className={`nav-item ${active === "authorities" ? "active" : ""}`}
          onClick={() => setActive("authorities")}
        >
          Authorities
        </button>

        <button
          className={`nav-item ${active === "reports" ? "active" : ""}`}
          onClick={() => setActive("reports")}
        >
          Reports
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="btn logout" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}

/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}

/* ---------------- CATEGORY BAR ---------------- */
function CategoryBar({ label, value, percent }) {
  return (
    <div className="cat-row">
      <div className="cat-label">{label}</div>
      <div className="cat-bar">
        <div className="cat-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="cat-value">
        {value} ({percent}%)
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
export default function Dashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [authority, setAuthority] = useState(null);

  /* ---------- LOAD AUTHORITY ---------- */
  useEffect(() => {
    const loadAuthority = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const snap = await getDoc(doc(db, "authorities", user.uid));
      if (snap.exists()) setAuthority(snap.data());
    };

    loadAuthority();
  }, [navigate]);

  /* ---------- REAL-TIME FIRESTORE ISSUES ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "issues"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.type,
          desc: data.description,
          location: data.address,
          category: data.type,
          status: data.status,
          date: data.timestamp
            ? new Date(data.timestamp).toISOString().split("T")[0]
            : "",
          img: data.imageUrl,
          priority: data.priority || "Medium",
          authority: data.assignedTo || ""
        };
      });

      setComplaints(list);
    });

    return () => unsub();
  }, []);

  /* ---------- UPDATE STATUS ---------- */
  const handleSave = async (updated) => {
    try {
      await updateDoc(
        fsDoc(db, "issues", updated.id),
        {
          status: updated.status,
          priority: updated.priority || "Medium",
          assignedTo: updated.authority || null
        }
      );
    } catch {
      alert("Failed to update complaint");
    }
  };

  /* ---------- FILTERED LIST ---------- */
  const filtered = complaints.filter(c => {
    if (filter === "pending" && c.status !== "Pending") return false;
    if (filter === "inprogress" && c.status !== "In Progress") return false;
    if (filter === "completed" && c.status !== "Completed") return false;
    if (
      search &&
      !`${c.title} ${c.location}`.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  /* ---------- COUNTS ---------- */
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const completed = complaints.filter(c => c.status === "Completed").length;

  /* ---------- CATEGORY ANALYTICS ---------- */
  const complaintsByCategory = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return map;
  }, [complaints]);

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="dashboard-root">
      <Sidebar
        onLogout={handleLogout}
        active={active}
        setActive={setActive}
        authority={authority}
      />

      <div className="dashboard-main">

        {/* ================= DASHBOARD HOME ================= */}
        {active === "dashboard" && (
          <>
            <header className="dash-header">
              <h2>Dashboard</h2>
            </header>

            <section className="stats-grid">
              <StatCard title="Total Complaints" value={total} subtitle="All time" />
              <StatCard title="Pending" value={pending} subtitle="Awaiting assignment" />
              <StatCard title="In Progress" value={inProgress} subtitle="Being resolved" />
              <StatCard title="Completed" value={completed} subtitle="Successfully resolved" />
            </section>

            <section className="panels">
              {/* Notifications */}
              <div className="panel notifications-panel">
                <div className="panel-title">Notifications</div>

                {complaints.slice(0, 5).map(c => (
                  <div
                    key={c.id}
                    className="notif-item"
                    onClick={() => {
                      setSelected(c);
                      setActive("complaintDetail");
                    }}
                  >
                    {c.status === "Pending" && <span className="notif-badge">NEW</span>}
                    <div className="notif-title">{c.title}</div>
                    <div className="notif-sub">{c.location} • {c.date}</div>
                  </div>
                ))}
              </div>

              {/* Category Analytics */}
              <div className="panel categories">
                <div className="panel-title">Issues by Category</div>

                {Object.keys(complaintsByCategory).map(cat => {
                  const value = complaintsByCategory[cat];
                  const percent = Math.round((value / total) * 100);
                  return (
                    <CategoryBar
                      key={cat}
                      label={cat}
                      value={value}
                      percent={percent}
                    />
                  );
                })}
              </div>

              {/* Pending Panel */}
              <div className="panel pending-panel">
                <div className="panel-title">
                  Pending Complaints - Needs Immediate Action
                </div>

                {complaints
                  .filter(c => c.status === "Pending")
                  .slice(0, 3)
                  .map(c => (
                    <div key={c.id} className="pending-item">
                      <img src={c.img} alt="" className="thumb" />
                      <div className="pending-body">
                        <div className="pending-title">{c.title}</div>
                        <div className="pending-sub">{c.location}</div>
                      </div>
                      <div className="pending-meta">
                        <div className="priority">Priority: {c.priority}</div>
                        <div className="date">{c.date}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}

        {/* ================= COMPLAINTS LIST ================= */}
        {active === "complaints" && (
          <div className="complaints-page">
            <input
              className="search"
              placeholder="Search complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="panel complaints-table">
              {filtered.map(c => (
                <div key={c.id} className="table-row">
                  <img src={c.img} alt="" className="thumb small" />
                  <div>{c.title}</div>
                  <div>{c.location}</div>
                  <div>{c.status}</div>
                  <button
                    className="btn"
                    onClick={() => {
                      setSelected(c);
                      setActive("complaintDetail");
                    }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= COMPLAINT DETAIL ================= */}
        {active === "complaintDetail" && selected && (
          <ComplaintDetail
            complaint={selected}
            onBack={() => {
              setSelected(null);
              setActive("complaints");
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
