import { useEffect, useState } from "react";
import { createCandidate, updateCandidate, getCandidateById } from "../../services/CandidateService";
import { getJobs } from "../../services/jobService";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

/* ── Icons ──────────────────────────────────────────────────────── */
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

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
  boxSizing: "border-box",
};

export default function CandidateForm() {
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    jobId: "",
  });
  const [jobs, setJobs] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Load jobs for the dropdown
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data.filter(j => j.status?.toLowerCase() === "active"));
      } catch (err) {
        console.error("Failed to load jobs", err);
      }
    };
    loadJobs();

    if (id) {
      const loadCandidate = async () => {
        try {
          const data = await getCandidateById(id);
          setCandidate({
            name: data.name ?? "",
            email: data.email ?? "",
            jobId: data.jobId ?? "",
          });
        } catch (err) {
          console.error("Failed to load candidate", err);
        }
      };
      loadCandidate();
    }
  }, [id]);

  const handleChange = (e) => {
    setCandidate({ ...candidate, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateCandidate(id, candidate);
      } else {
        await createCandidate(candidate);
      }
      
      Swal.fire({
        title: "Success!",
        text: `Candidate ${id ? "updated" : "added"} successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "swal-popup-custom" },
      });
      
      navigate("/candidates");
    } catch (err) {
      Swal.fire("Error", "Failed to save candidate", "error");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem" }}>

      <Link
        to="/candidates"
        id="btn-back-to-candidates"
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
        Back to Candidates
      </Link>

      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #CA1D24 0%, #7E1519 100%)", padding: "1.5rem 2rem" }}>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>
            {id ? "✏️ Edit Candidate" : "➕ Add New Candidate"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="name" style={labelStyle}>Full Name <span style={{ color: "#CA1D24" }}>*</span></label>
            <input
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              value={candidate.name}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="email" style={labelStyle}>Email Address <span style={{ color: "#CA1D24" }}>*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. john.doe@example.com"
              value={candidate.email}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Applied Job */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="jobId" style={labelStyle}>Applied Position <span style={{ color: "#CA1D24" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <select
                id="jobId"
                name="jobId"
                value={candidate.jobId}
                onChange={handleChange}
                required
                style={{ ...inputStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
                onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              >
                <option value="">Select a job position</option>
                {jobs.map(job => (
                  <option key={job._id ?? job.id} value={job._id ?? job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            {jobs.length === 0 && (
              <p style={{ fontSize: "0.75rem", color: "#f59e0b", marginTop: 4, fontWeight: 500 }}>
                ⚠️ No active job positions available. Please activate a job first.
              </p>
            )}
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>
              Only jobs with "Active" status are listed here.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => navigate("/candidates")}
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
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                flex: 2,
                padding: "0.7rem",
                borderRadius: "0.65rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                background: "#CA1D24",
                color: "#000",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(202,29,36,0.3)",
              }}
            >
              {id ? "Save Changes" : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
