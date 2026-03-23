import { useEffect, useState } from "react";
import { createJob, updateJob, getJobById } from "../../services/jobService";
import { useNavigate, useParams, Link } from "react-router-dom";

/* ── Icons ──────────────────────────────────────────────────────── */
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ── Tag input component ─────────────────────────────────────────── */
function TagInput({ label, values, onChange, placeholder, color = "#CA1D24" }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => onChange(values.filter(v => v !== tag));

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && values.length > 0) {
      removeTag(values[values.length - 1]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: "0.55rem 0.75rem",
          border: "1.5px solid #e2e8f0",
          borderRadius: "0.6rem",
          background: "#fff",
          minHeight: "2.6rem",
          cursor: "text",
          transition: "border-color 0.15s",
        }}
        onClick={() => document.getElementById(`tag-input-${label}`)?.focus()}
      >
        {values.map(v => (
          <span
            key={v}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: `${color}15`,
              color,
              border: `1px solid ${color}30`,
              borderRadius: "0.4rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
            }}
          >
            {v}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(v); }}
              style={{ background: "none", border: "none", cursor: "pointer", color, lineHeight: 1, padding: 0, display: "flex" }}
            >
              <IconX />
            </button>
          </span>
        ))}
        <input
          id={`tag-input-${label}`}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addTag}
          placeholder={values.length === 0 ? placeholder : ""}
          style={{
            border: "none",
            outline: "none",
            fontSize: "0.875rem",
            color: "#1e293b",
            flexGrow: 1,
            minWidth: 100,
            background: "transparent",
            padding: "0.1rem 0",
          }}
        />
      </div>
      <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>
        Press <kbd style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 3, padding: "0 4px", fontFamily: "monospace" }}>Enter</kbd> or <kbd style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 3, padding: "0 4px", fontFamily: "monospace" }}>,</kbd> to add
      </p>
    </div>
  );
}

/* ── Shared styles ───────────────────────────────────────────────── */
const labelStyle = { fontSize: "0.8rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: "0.6rem",
  fontSize: "0.9rem",
  color: "#1e293b",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

/* ── Main component ──────────────────────────────────────────────── */
export default function JobForm() {
  const [job, setJob] = useState({
    title: "",
    description: "",
    status: "draft",
    skills: [],
    topics: [],
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const loadJob = async () => {
        const data = await getJobById(id);
        setJob({
          title: data.title ?? "",
          description: data.description ?? "",
          status: data.status ?? "draft",
          skills: Array.isArray(data.skills) ? data.skills : [],
          topics: Array.isArray(data.topics) ? data.topics : [],
        });
      };
      loadJob();
    }
  }, [id]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await updateJob(id, job);
    } else {
      await createJob(job);
    }
    navigate("/jobs");
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* ── Back button ─────────────────────────────────────────── */}
      <Link
        to="/jobs"
        id="btn-back-to-jobs"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "#64748b",
          fontWeight: 600,
          fontSize: "0.85rem",
          marginBottom: "1.5rem",
          textDecoration: "none",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#CA1D24"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <IconArrowLeft />
        Back to Jobs
      </Link>

      {/* ── Card ─────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* Header stripe */}
        <div style={{ background: "linear-gradient(135deg, #CA1D24 0%, #7E1519 100%)", padding: "1.5rem 2rem" }}>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0, letterSpacing: "-0.01em" }}>
            {id ? "✏️ Edit Job" : "➕ Create New Job"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", marginTop: 4 }}>
            {id ? "Update the job posting details below" : "Fill in the details to create a new job posting"}
          </p>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="job-title" style={labelStyle}>Job Title <span style={{ color: "#CA1D24" }}>*</span></label>
            <input
              id="job-title"
              name="title"
              placeholder="e.g. DevOps Engineer"
              value={job.title}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="job-status" style={labelStyle}>Status <span style={{ color: "#CA1D24" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <select
                id="job-status"
                name="status"
                value={job.status}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
                onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            {/* Status preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: job.status === "active" ? "#22c55e" : "#94a3b8",
                display: "inline-block",
                transition: "background 0.2s"
              }} />
              <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                This job will be {job.status === "active" ? "publicly visible" : "saved as a draft"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="job-description" style={labelStyle}>Description <span style={{ color: "#CA1D24" }}>*</span></label>
            <textarea
              id="job-description"
              name="description"
              placeholder="Describe the role, responsibilities, and expectations…"
              value={job.description}
              onChange={handleChange}
              rows={4}
              required
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Skills */}
          <TagInput
            label="Skills Required"
            values={job.skills}
            onChange={(skills) => setJob({ ...job, skills })}
            placeholder="e.g. AWS, Docker, Kubernetes"
            color="#CA1D24"
          />

          {/* Topics */}
          <TagInput
            label="Topics / Tags"
            values={job.topics}
            onChange={(topics) => setJob({ ...job, topics })}
            placeholder="e.g. devops, cloud, kubernetes"
            color="#7E1519"
          />

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              style={{
                flex: 1,
                padding: "0.7rem",
                borderRadius: "0.65rem",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1.5px solid #e2e8f0",
                background: "#f8fafc",
                color: "#64748b",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-save-job"
              style={{
                flex: 2,
                padding: "0.7rem",
                borderRadius: "0.65rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                background: "#CA1D24",
                color: "#000000",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(202,29,36,0.3)",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#A81920"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(202,29,36,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#CA1D24"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(202,29,36,0.3)"; }}
            >
              {id ? " Save Changes" : " Create Job"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}