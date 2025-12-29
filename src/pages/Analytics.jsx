import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analytics({ complaints = [] }) {

  const total = complaints.length;

  const resolvedCount = complaints.filter(
    c => c.status === "Completed"
  ).length;

  const completionRate = total
    ? Math.round((resolvedCount / total) * 100)
    : 0;

  /* ---------------- CATEGORY DISTRIBUTION ---------------- */
  const categoryData = useMemo(() => {
    const map = {};

    complaints.forEach(c => {
      const key = c.category || "Other";
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [complaints]);

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#14b8a6",
    "#84cc16",
  ];

  return (
    <div className="reports-page">

      <header className="dash-header">
        <h2>Reports & Analytics</h2>
        <p style={{ color: "#6b7280" }}>
          Performance insights from citizen complaints
        </p>
      </header>

      <section className="stats-grid">
        <StatCard title="Total Complaints" value={total} subtitle="All time" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} subtitle="Resolved cases" />
        <StatCard title="Avg Response Time" value="N/A" subtitle="Not tracked" />
        <StatCard title="User Satisfaction" value="N/A" subtitle="Not tracked" />
      </section>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-title">Category Distribution</div>

        {categoryData.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}
