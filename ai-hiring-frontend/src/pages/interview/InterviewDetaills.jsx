import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInterviewById, deleteInterview } from "../../services/InterviewService";
import Swal from "sweetalert2";

/* ── Icons ──────────────────────────────────────────────────────── */
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconCalendar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

export default function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const data = await getInterviewById(id);
        setInterview(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadInterview();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Cancel this interview?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      customClass: { popup: "swal-popup-custom" },
    });
    if (result.isConfirmed) {
      try {
        await deleteInterview(id);
        await Swal.fire({
          title: "Cancelled!",
          text: "The interview has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "swal-popup-custom" },
        });
        navigate("/interviews");
      } catch (err) {
        Swal.fire("Error", "Could not delete interview", "error");
      }
    }
  };

  if (!interview) return (
    <div style={{ maxWidth: 700, margin: "3rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#94a3b8" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #CA1D24", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>Loading interview details…</p>
      </div>
    </div>
  );

  const formattedDate = new Date(interview.interviewDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>

      <Link
        to="/interviews"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#64748b", fontWeight: 600, fontSize: "0.85rem",
          marginBottom: "1.5rem", textDecoration: "none", transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#CA1D24"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <IconArrowLeft />
        Back to Interviews
      </Link>

      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #CA1D24 0%, #7E1519 100%)", padding: "2rem 2rem 1.5rem" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "1rem", padding: "0.75rem", color: "#fff" }}>
                    <IconCalendar />
                </div>
                <div>
                   <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>Assessment</h1>
                   <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", marginTop: 2 }}>{interview.topic.toUpperCase()}</p>
                </div>
             </div>
           </div>
        </div>

        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          
          <Section icon={<IconArrowLeft style={{ transform: 'rotate(180deg)' }} />} title="Candidate">
             <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>{interview.candidateName}</p>
          </Section>

          <Section icon={<IconArrowLeft style={{ transform: 'rotate(180deg)' }} />} title="Interviewer">
             <p style={{ fontSize: "1rem", fontWeight: 600, color: "#475569", margin: 0 }}>{interview.interviewerName}</p>
          </Section>

          <Section icon={<IconCalendar />} title="Schedule">
             <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.75rem", border: "1.5px solid #e2e8f0" }}>
                <p style={{ fontSize: "0.95rem", color: "#1e293b", fontWeight: 700, margin: 0 }}>{formattedDate}</p>
             </div>
          </Section>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              onClick={() => navigate(`/interviews/edit/${id}`)}
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
              <IconEdit /> Edit Interview
            </button>

            <button
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
              <IconTrash /> Cancel Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
