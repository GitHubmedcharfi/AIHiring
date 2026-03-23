import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobById, deleteJob } from "../../services/jobService";
import Swal from "sweetalert2";

/* ── Icons ──────────────────────────────────────────────────────── */
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const isActive = status?.toLowerCase() === "active";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: isActive ? "#dcfce7" : "#f1f5f9",
      color: isActive ? "#15803d" : "#64748b",
      fontWeight: 700, fontSize: "0.8rem",
      padding: "0.3rem 0.85rem", borderRadius: "2rem",
      border: `1px solid ${isActive ? "#bbf7d0" : "#e2e8f0"}`,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? "#22c55e" : "#94a3b8", display: "inline-block" }} />
      {isActive ? "Active" : "Draft"}
    </span>
  );
};

const Tag = ({ label, color }) => (
  <span style={{
    background: `${color}15`, color, border: `1px solid ${color}30`,
    fontSize: "0.82rem", fontWeight: 600,
    padding: "0.25rem 0.65rem", borderRadius: "0.45rem",
    display: "inline-block",
  }}>
    {label}
  </span>
);

const Section = ({ icon, title, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#CA1D24" }}>{icon}</span>
      <h3 style={{ fontWeight: 700, fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

/* ── Main component ──────────────────────────────────────────────── */
export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      const data = await getJobById(id);
      setJob(data);
    };
    loadJob();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this job?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: { popup: "swal-popup-custom" },
    });
    if (result.isConfirmed) {
      await deleteJob(id);
      await Swal.fire({
        title: "Deleted!",
        text: "The job has been removed.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: "swal-popup-custom" },
      });
      navigate("/jobs");
    }
  };

  /* Loading skeleton */
  if (!job) return (
    <div style={{ maxWidth: 700, margin: "3rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#94a3b8" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #CA1D24", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>Loading job details…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* ── Back ─────────────────────────────────────────────────── */}
      <Link
        to="/jobs"
        id="btn-back-to-jobs"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#64748b", fontWeight: 600, fontSize: "0.85rem",
          marginBottom: "1.5rem", textDecoration: "none", transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#CA1D24"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <IconArrowLeft />
        Back to Jobs
      </Link>

      {/* ── Main Card ─────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* Hero strip */}
        <div style={{ background: "linear-gradient(135deg, #CA1D24 0%, #7E1519 100%)", padding: "2rem 2rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "0.75rem", padding: "0.6rem", display: "flex" }}>
                <IconBriefcase />
              </div>
              <div>
                <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem", margin: 0, letterSpacing: "-0.02em" }}>
                  {job.title}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", marginTop: 3 }}>
                  Job ID: {job._id ?? job.id ?? "—"}
                </p>
              </div>
            </div>
            <StatusBadge status={job.status} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

          {/* Description */}
          <Section icon={
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h12" />
            </svg>
          } title="Description">
            <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>
              {job.description || <span style={{ color: "#94a3b8" }}>No description provided.</span>}
            </p>
          </Section>

          {/* Skills */}
          <Section icon={
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          } title="Required Skills">
            {job.skills?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {job.skills.map(s => <Tag key={s} label={s} color="#CA1D24" />)}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No skills listed.</p>
            )}
          </Section>

          {/* Topics */}
          <Section icon={
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          } title="Topics / Tags">
            {job.topics?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {job.topics.map(t => <Tag key={t} label={`#${t}`} color="#7E1519" />)}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No topics listed.</p>
            )}
          </Section>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              id="btn-edit-job"
              onClick={() => navigate(`/jobs/edit/${id}`)}
              style={{
                flex: 1,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0.65rem 1rem",
                borderRadius: "0.65rem",
                fontWeight: 700, fontSize: "0.88rem",
                border: "1.5px solid #CA1D24",
                background: "#fff", color: "#CA1D24",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#CA1D24"; e.currentTarget.style.color = "#000"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#CA1D24"; }}
            >
              <IconEdit /> Edit Job
            </button>

            <button
              id="btn-delete-job"
              onClick={handleDelete}
              style={{
                flex: 1,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0.65rem 1rem",
                borderRadius: "0.65rem",
                fontWeight: 700, fontSize: "0.88rem",
                border: "1.5px solid #fecaca",
                background: "#fef2f2", color: "#ef4444",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
            >
              <IconTrash /> Delete Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}