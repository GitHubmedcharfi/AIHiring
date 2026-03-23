import { useEffect, useState, useRef } from "react";
import { getCandidates, deleteCandidate } from "../../services/CandidateService";
import { getJobs } from "../../services/jobService";
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
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [search, setSearch]           = useState("");
  const [acOpen, setAcOpen]           = useState(false);
  const [acHighlight, setAcHl]        = useState(-1);
  const searchRef                     = useRef(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [cData, jData] = await Promise.all([getCandidates(), getJobs()]);
      setCandidates(cData);
      setJobs(jData);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this candidate?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      borderRadius: "1rem",
      customClass: {
        popup: "swal-popup-custom",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteCandidate(id);
        loadData();
        Swal.fire({
          title: "Deleted!",
          text: "Candidate has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "swal-popup-custom" },
        });
      } catch (err) {
        Swal.fire("Error", "Could not delete candidate", "error");
      }
    }
  };

  /* ── Autocomplete suggestions ───────────────────────────────────── */
  const suggestions = search.trim()
    ? candidates
      .map(c => c.name)
      .filter((n, i, arr) => n?.toLowerCase().includes(search.toLowerCase()) && arr.indexOf(n) === i)
      .slice(0, 8)
    : [];

  const handleSuggestionClick = (name) => {
    setSearch(name);
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

  const filteredCandidates = candidates.filter((c) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" }}>
            Candidates
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 2 }}>
            Manage and track applicants for all positions
          </p>
        </div>

        <Link
          to="/candidates/new"
          id="btn-create-candidate"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#CA1D24",
            color: "#000000",
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
          Add Candidate
        </Link>
      </div>

      {/* ── Search ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }} ref={searchRef}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 1 }}>
            <IconSearch />
          </span>
          <input
            id="candidate-search"
            type="text"
            placeholder="Search candidates by name or email…"
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
            onFocusCapture={e => e.target.style.borderColor = "#CA1D24"}
            onBlurCapture={e => e.target.style.borderColor = "#e2e8f0"}
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setAcOpen(false); }}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                display: "flex", alignItems: "center", padding: 2,
              }}
              title="Clear"
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
              {suggestions.map((name, idx) => (
                <li
                  key={name}
                  onMouseDown={() => handleSuggestionClick(name)}
                  onMouseEnter={() => setAcHl(idx)}
                  style={{
                    padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: acHighlight === idx ? "#CA1D24" : "#1e293b",
                    background: acHighlight === idx ? "#fff5f5" : "transparent",
                    fontWeight: acHighlight === idx ? 600 : 400,
                    transition: "background 0.1s",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <IconSearch />
                  {(() => {
                    const lo = name.toLowerCase();
                    const idx2 = lo.indexOf(search.toLowerCase());
                    if (idx2 === -1) return name;
                    return (
                      <>
                        {name.slice(0, idx2)}
                        <mark style={{ background: "#ffd7d8", color: "#CA1D24", borderRadius: 2, padding: "0 1px" }}>
                          {name.slice(idx2, idx2 + search.length)}
                        </mark>
                        {name.slice(idx2 + search.length)}
                      </>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Cards Grid ────────────────────────────────────────────── */}
      {filteredCandidates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8", background: "#fff", borderRadius: "1rem", border: "1.5px dashed #e2e8f0" }}>
          <IconUser />
          <p style={{ fontWeight: 600, fontSize: "1rem", marginTop: 12 }}>No candidates found</p>
          <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Try adjusting your search or add a new candidate</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {filteredCandidates.map((c) => {
            const job = jobs.find(j => (j._id ?? j.id) === c.jobId);
            return (
              <CandidateCard 
                key={c._id ?? c.id} 
                candidate={c} 
                jobTitle={job?.title ?? "Unknown Position"}
                onDelete={handleDelete} 
                navigate={navigate} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate, jobTitle, onDelete, navigate }) {
  const id = candidate._id ?? candidate.id;

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
        gap: "1rem",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: "#f1f5f9", borderRadius: "50%", p: 8, color: "#64748b" }}>
          <IconUser />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", margin: 0 }}>
            {candidate.name}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{candidate.email}</p>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
         <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Applied Position</p>
         <p style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500 }}>
           {jobTitle}
         </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
        <ActionBtn icon={<IconEye />} label="View"   color="#3b82f6" onClick={() => navigate(`/candidates/${id}`)} />
        <ActionBtn icon={<IconEdit />} label="Edit"   color="#CA1D24" onClick={() => navigate(`/candidates/edit/${id}`)} />
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
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "0.42rem 0.75rem",
        borderRadius: "0.5rem",
        fontWeight: 600,
        fontSize: "0.78rem",
        border: `1.5px solid ${hovered ? color : "#e2e8f0"}`,
        background: hovered ? (danger ? "#fef2f2" : `${color}12`) : "#f8fafc",
        color: hovered ? color : "#64748b",
        cursor: "pointer",
        transition: "all 0.15s",
        flex: 1,
        justifyContent: "center",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
