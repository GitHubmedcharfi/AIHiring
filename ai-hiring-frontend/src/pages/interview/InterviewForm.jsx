import { useEffect, useState } from "react";
import { createInterview, updateInterview, getInterviewById } from "../../services/InterviewService";
import { getCandidates } from "../../services/CandidateService";
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

export default function InterviewForm() {
  const [interview, setInterview] = useState({
    candidateName: "",
    interviewerName: "",
    interviewDate: "",
    topic: "technical",
  });
  const [candidates, setCandidates] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const cData = await getCandidates();
        setCandidates(cData);
      } catch (err) {
        console.error("Failed to load candidates", err);
      }
    };
    loadData();

    if (id) {
      const loadInterview = async () => {
        try {
          const data = await getInterviewById(id);
          // Format date for datetime-local input (YYYY-MM-DDTHH:mm) using local timezone correctly
          const date = new Date(data.interviewDate);
          const tzOffset = date.getTimezoneOffset() * 60000;
          const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
          
          setInterview({
            candidateName: data.candidateName ?? "",
            interviewerName: data.interviewerName ?? "",
            interviewDate: localISOTime,
            topic: data.topic ?? "technical",
          });
        } catch (err) {
          console.error("Failed to load interview", err);
        }
      };
      loadInterview();
    }
  }, [id]);

  const handleChange = (e) => {
    setInterview({ ...interview, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateInterview(id, interview);
      } else {
        await createInterview(interview);
      }

      Swal.fire({
        title: "Success!",
        text: `Interview ${id ? "updated" : "scheduled"} successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "swal-popup-custom" },
      });

      navigate("/interviews");
    } catch (err) {
      Swal.fire("Error", "Failed to save interview", "error");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem" }}>

      <Link
        to="/interviews"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "#64748b",
          fontWeight: 600,
          fontSize: "0.85rem",
          marginBottom: "1.5rem",
          textDecoration: "none",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#CA1D24"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <IconArrowLeft />
        Back to Interviews
      </Link>

      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #CA1D24 0%, #7E1519 100%)", padding: "1.5rem 2rem" }}>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>
            {id ? "✏️ Edit Interview" : "➕ Schedule Interview"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

          {/* Candidate Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Candidate <span style={{ color: "#CA1D24" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <select
                name="candidateName"
                value={interview.candidateName}
                onChange={handleChange}
                required
                style={{ ...inputStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
                onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              >
                <option value="">Select a candidate</option>
                {candidates.map(c => (
                  <option key={c._id ?? c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            {candidates.length === 0 && (
              <p style={{ fontSize: "0.75rem", color: "#f59e0b", marginTop: 4 }}>⚠️ No candidates available. Please add a candidate first.</p>
            )}
          </div>

          {/* Interviewer Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Interviewer Name <span style={{ color: "#CA1D24" }}>*</span></label>
            <input
              name="interviewerName"
              placeholder="e.g. Jane Doe"
              value={interview.interviewerName}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Schedule Date & Time <span style={{ color: "#CA1D24" }}>*</span></label>
            <input
              name="interviewDate"
              type="datetime-local"
              value={interview.interviewDate}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Topic */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Topic <span style={{ color: "#CA1D24" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <select
                name="topic"
                value={interview.topic}
                onChange={handleChange}
                required
                style={{ ...inputStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
                onFocus={e => { e.target.style.borderColor = "#CA1D24"; e.target.style.boxShadow = "0 0 0 3px rgba(202,29,36,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              >
                <option value="technical">Software Engineer</option>
                <option value="hr">HR & Marketing</option>
                <option value="culture">Data Engineer</option>
                <option value="devops">DevOps & Cloud Engineer</option>
                <option value="management">AI Engineer</option>
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => navigate("/interviews")}
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
              {id ? "Save Changes" : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
