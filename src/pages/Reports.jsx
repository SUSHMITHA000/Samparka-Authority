import React, { useMemo } from "react";

/**
 * Props:
 * complaints → array coming from Firestore (same as Dashboard)
 */
export default function Reports({ complaints = [] }) {

  const total = complaints.length;

  const statusReport = {
    Pending: complaints.filter(c => c.status === "Pending").length,
    "In Progress": complaints.filter(c => c.status === "In Progress").length,
    Completed: complaints.filter(c => c.status === "Completed").length,
  };

  const categoryReport = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return map;
  }, [complaints]);

  return (
    <div className="reports-page">

      <header className="dash-header">
        <h2>Reports & Analytics</h2>
        <p style={{ color: "#6b7280" }}>
          Real-time analytics from citizen complaints
        </p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="stats-grid">
        <StatCard title="Total Complaints" value={total} subtitle="All time" />
        <StatCard title="Pending" value={statusReport.Pending} subtitle="Awaiting action" />
        <StatCard title="In Progress" value={statusReport["In Progress"]} subtitle="Being resolved" />
        <StatCard title="Completed" value={statusReport.Completed} subtitle="Resolved" />
      </section>

      {/* STATUS REPORT */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-title">Complaints by Status</div>

        {Object.entries(statusReport).map(([status, value]) => {
          const percent = total ? Math.round((value / total) * 100) : 0;

          return (
            <div key={status} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{status}</span>
                <span>{value} ({percent}%)</span>
              </div>

              <div style={{ height: 8, background: "#e5e7eb", borderRadius: 8 }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "#16a34a",
                    borderRadius: 8
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CATEGORY REPORT */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-title">Complaints by Category</div>

        {Object.entries(categoryReport).length === 0 && (
          <div style={{ color: "#6b7280" }}>No data available</div>
        )}

        {Object.entries(categoryReport).map(([category, value]) => {
          const percent = total ? Math.round((value / total) * 100) : 0;

          return (
            <div key={category} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{category}</span>
                <span>{value} ({percent}%)</span>
              </div>

              <div style={{ height: 8, background: "#e5e7eb", borderRadius: 8 }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "#2563eb",
                    borderRadius: 8
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Reuse your existing StatCard style */
function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}
