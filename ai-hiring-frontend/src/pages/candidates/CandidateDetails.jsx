import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCandidateById, deleteCandidate } from "../../services/CandidateService";
import { getJobs } from "../../services/jobService";
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
const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
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

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [jobTitle, setJobTitle]   = useState("Loading...");

  useEffect(() => {
    const loadData = async () => {
      try {
        const cData = await getCandidateById(id);
        setCandidate(cData);
        
        // Try to fetch job title
        if (cData.jobId) {
            const jobs = await getJobs();
            const job = jobs.find(j => (j._id ?? j.id) === cData.jobId);
            setJobTitle(job?.title ?? "Unknown Position");
        } else {
            setJobTitle("No Position Specified");
        }
      } catch (err) {
        console.error(err);
        setJobTitle("Error loading position");
      }
    };
    loadData();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this candidate?",
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
      try {
        await deleteCandidate(id);
        await Swal.fire({
          title: "Deleted!",
          text: "The candidate has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "swal-popup-custom" },
        });
        navigate("/candidates");
      } catch (err) {
        Swal.fire("Error", "Could not delete candidate", "error");
      }
    }
  };

  if (!candidate) return (
    <div style={{ maxWidth: 700, margin: "3rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#94a3b8" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #CA1D24", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>Loading candidate details…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>

      <Link
        to="/candidates"
        id="btn-back-to-candidates"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#64748b", fontWeight: 600, fontSize: "0.85rem",
          marginBottom: "1.5rem", textDecoration: "none", transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#CA1D24"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <IconArrowLeft />
        Back to Candidates
      </Link>

      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #CA1D24 0%, #7E1519 100%)", padding: "2rem 2rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "100%", padding: "0.8rem", display: "flex", color: "#fff" }}>
                <IconUser />
              </div>
              <div>
                <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem", margin: 0, letterSpacing: "-0.02em" }}>
                  {candidate.name}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", marginTop: 3 }}>
                  {candidate.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

          <Section icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          } title="Applied For">
            <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
              {jobTitle}
            </p>
          </Section>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              id="btn-edit-candidate"
              onClick={() => navigate(`/candidates/edit/${id}`)}
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
              <IconEdit /> Edit Candidate
            </button>

            <button
              id="btn-delete-candidate"
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
              <IconTrash /> Delete Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
