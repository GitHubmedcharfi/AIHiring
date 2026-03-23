import { useEffect, useState, useRef } from "react";
import { getInterviews, deleteInterview } from "../../services/InterviewService";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/* ── Icons ──────────────────────────────────────────────────────── */
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function InterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [search, setSearch]             = useState("");
  const [acOpen, setAcOpen]             = useState(false);
  const [acHighlight, setAcHl]          = useState(-1);
  const searchRef                       = useRef(null);
  const navigate = useNavigate();

  const loadInterviews = async () => {
    try {
      const data = await getInterviews();
      setInterviews(data);
    } catch (err) {
      console.error("Failed to load interviews", err);
    }
  };

  useEffect(() => { loadInterviews(); }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Cancel this interview?",
      text: "This will permanently remove the record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      borderRadius: "1rem",
      customClass: { popup: "swal-popup-custom" },
    });

    if (result.isConfirmed) {
      try {
        await deleteInterview(id);
        loadInterviews();
        Swal.fire({
          title: "Deleted!",
          text: "Interview has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "swal-popup-custom" },
        });
      } catch (err) {
        Swal.fire("Error", "Could not delete interview", "error");
      }
    }
  };

  /* ── Autocomplete suggestions ───────────────────────────────────── */
  const suggestions = search.trim()
    ? interviews
      .flatMap(i => [i.candidateName, i.interviewerName])
      .filter((n, i, arr) => n?.toLowerCase().includes(search.toLowerCase()) && arr.indexOf(n) === i)
      .slice(0, 8)
    : [];

  const handleSuggestionClick = (val) => {
    setSearch(val);
    setAcOpen(false);
    setAcHl(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!acOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcHl(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcHl(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && acHighlight >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[acHighlight]);
    } else if (e.key === "Escape") {
      setAcOpen(false);
    }
  };

  const filteredInterviews = interviews.filter((i) => 
    i.candidateName?.toLowerCase().includes(search.toLowerCase()) || 
    i.interviewerName?.toLowerCase().includes(search.toLowerCase()) ||
    i.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" }}>
            Interviews
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 2 }}>
            Schedule and manage candidate assessments
          </p>
        </div>

        <Link
          to="/interviews/new"
          id="btn-schedule-interview"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#CA1D24",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.9rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.65rem",
            boxShadow: "0 2px 8px rgba(202,29,36,0.35)",
            textDecoration: "none",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#A81920"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(202,29,36,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#CA1D24"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(202,29,36,0.35)"; }}
        >
          <IconPlus />
          Schedule Interview
        </Link>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }} ref={searchRef}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 1 }}>
            <IconSearch />
          </span>
          <input
            id="interview-search"
            type="text"
            placeholder="Search by candidate, interviewer, or topic…"
            value={search}
            autoComplete="off"
            onChange={(e) => { setSearch(e.target.value); setAcOpen(true); setAcHl(-1); }}
            onFocus={() => setAcOpen(true)}
            onBlur={() => setTimeout(() => setAcOpen(false), 150)}
            onKeyDown={handleSearchKeyDown}
            style={{
              width: "100%",
              paddingLeft: "2.25rem",
              paddingRight: search ? "2rem" : "0.75rem",
              paddingTop: "0.55rem",
              paddingBottom: "0.55rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: acOpen && suggestions.length > 0 ? "0.6rem 0.6rem 0 0" : "0.6rem",
              fontSize: "0.875rem",
              background: "#fff",
              color: "#1e293b",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setAcOpen(false); }}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                display: "flex", alignItems: "center", padding: 2,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {acOpen && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "#fff", border: "1.5px solid #CA1D24",
                borderTop: "none", borderRadius: "0 0 0.6rem 0.6rem",
                zIndex: 999, margin: 0, padding: "0.25rem 0",
                listStyle: "none",
                boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
                maxHeight: 240, overflowY: "auto",
              }}
            >
              {suggestions.map((val, idx) => (
                <li
                  key={val}
                  onMouseDown={() => handleSuggestionClick(val)}
                  onMouseEnter={() => setAcHl(idx)}
                  style={{
                    padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: acHighlight === idx ? "#CA1D24" : "#1e293b",
                    background: acHighlight === idx ? "#fff5f5" : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  {val}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      {filteredInterviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8", background: "#fff", borderRadius: "1rem", border: "1.5px dashed #e2e8f0" }}>
          <IconCalendar />
          <p style={{ fontWeight: 600, fontSize: "1rem", marginTop: 12 }}>No interviews found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredInterviews.map((i) => (
            <InterviewCard key={i._id ?? i.id} interview={i} onDelete={handleDelete} navigate={navigate} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}

function InterviewCard({ interview, onDelete, navigate, formatDate }) {
  const id = interview._id ?? interview.id;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "1rem",
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e293b", margin: 0 }}>{interview.candidateName}</h2>
          <p style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>Interviewer: {interview.interviewerName}</p>
        </div>
        <span style={{ background: "#fef2f2", color: "#CA1D24", px: "0.5rem", py: "0.2rem", borderRadius: "0.4rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>
          {interview.topic}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: "0.85rem", fontWeight: 600, background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "0.75rem" }}>
        <IconCalendar />
        {formatDate(interview.interviewDate)}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <ActionBtn icon={<IconEye />} label="View"   color="#3b82f6" onClick={() => navigate(`/interviews/${id}`)} />
        <ActionBtn icon={<IconEdit />} label="Edit"   color="#CA1D24" onClick={() => navigate(`/interviews/edit/${id}`)} />
        <ActionBtn icon={<IconTrash />} label="Delete" color="#ef4444" onClick={() => onDelete(id)} danger />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, color, onClick, danger = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "0.45rem 0.75rem",
        borderRadius: "0.5rem",
        fontWeight: 600,
        fontSize: "0.75rem",
        border: `1.5px solid ${hovered ? color : "#e2e8f0"}`,
        background: hovered ? (danger ? "#fef2f2" : `${color}12`) : "#fff",
        color: hovered ? color : "#64748b",
        cursor: "pointer",
        transition: "all 0.15s",
        flex: 1,
      }}
    >
      {icon} {label}
    </button>
  );
}
