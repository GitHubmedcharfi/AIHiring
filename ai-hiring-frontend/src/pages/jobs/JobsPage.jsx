import { useEffect, useState, useRef } from "react";
import { getJobs, deleteJob } from "../../services/jobService";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/* ── tiny SVG icons ─────────────────────────────────────────────── */
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

/* ── helpers ────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    active: { bg: "#dcfce7", color: "#15803d", label: "Active" },
    draft: { bg: "#f1f5f9", color: "#ccea08ef", label: "Draft" },
  };
  const s = map[status?.toLowerCase()] ?? map.draft;
  return (
    <span style={{ background: s.bg, color: s.color }} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full">
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const Tag = ({ label, color = "#CA1D24" }) => (
  <span
    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
    className="inline-block text-xs font-medium px-2 py-0.5 rounded-md"
  >
    {label}
  </span>
);

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [acOpen, setAcOpen] = useState(false);
  const [acHighlight, setAcHl] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const loadJobs = async () => {
    const data = await getJobs();
    setJobs(data);
  };

  useEffect(() => { loadJobs(); }, []);

  /* ── SweetAlert2 delete confirmation ───────────────────────────── */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this job?",
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
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
    });
    if (result.isConfirmed) {
      await deleteJob(id);
      loadJobs();
      Swal.fire({
        title: "Deleted!",
        text: "The job has been removed.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: "swal-popup-custom" },
      });
    }
  };

  /* ── Autocomplete suggestions ───────────────────────────────────── */
  const suggestions = search.trim()
    ? jobs
      .map(j => j.title)
      .filter((t, i, arr) => t?.toLowerCase().includes(search.toLowerCase()) && arr.indexOf(t) === i)
      .slice(0, 8)
    : [];

  const handleSuggestionClick = (title) => {
    setSearch(title);
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || job.status?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" }}>
            Job Listings
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 2 }}>
            Manage and track all open positions
          </p>
        </div>

        <Link
          to="/jobs/new"
          id="btn-create-job"
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
          Create Job
        </Link>
      </div>

      {/* ── Filters + Search ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search with Autocomplete */}
        <div style={{ position: "relative", flex: "1 1 260px" }} ref={searchRef}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 1 }}>
            <IconSearch />
          </span>
          <input
            id="job-search"
            type="text"
            placeholder="Search jobs…"
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
          {/* Clear button */}
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
          {/* Autocomplete dropdown */}
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
              {suggestions.map((title, idx) => (
                <li
                  key={title}
                  onMouseDown={() => handleSuggestionClick(title)}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ opacity: 0.4, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {/* Highlight matching part */}
                  {(() => {
                    const lo = title.toLowerCase();
                    const idx2 = lo.indexOf(search.toLowerCase());
                    if (idx2 === -1) return title;
                    return (
                      <>
                        {title.slice(0, idx2)}
                        <mark style={{ background: "#ffd7d8", color: "#CA1D24", borderRadius: 2, padding: "0 1px" }}>
                          {title.slice(idx2, idx2 + search.length)}
                        </mark>
                        {title.slice(idx2 + search.length)}
                      </>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Status filter */}
        {["all", "active", "draft"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.6rem",
              fontWeight: 600,
              fontSize: "0.8rem",
              border: "1.5px solid",
              cursor: "pointer",
              transition: "all 0.15s",
              borderColor: filter === f ? "#CA1D24" : "#e2e8f0",
              background: filter === f ? "#CA1D24" : "#fff",
              color: filter === f ? "#000" : "#64748b",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Cards Grid ────────────────────────────────────────────── */}
      {filteredJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8", background: "#fff", borderRadius: "1rem", border: "1.5px dashed #e2e8f0" }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 48, margin: "0 auto 1rem", opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p style={{ fontWeight: 600, fontSize: "1rem" }}>No jobs found</p>
          <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredJobs.map((job) => (
            <JobCard key={job._id ?? job.id} job={job} onDelete={handleDelete} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Job Card ─────────────────────────────────────────────────────── */
function JobCard({ job, onDelete, navigate }) {
  const id = job._id ?? job.id;

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
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", lineHeight: 1.3 }}>
          {job.title}
        </h2>
        <StatusBadge status={job.status} />
      </div>

      {/* Description */}
      {job.description && (
        <p style={{
          fontSize: "0.83rem", color: "#64748b", lineHeight: 1.55,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
        }}>
          {job.description}
        </p>
      )}

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Skills</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {job.skills.map(s => <Tag key={s} label={s} color="#CA1D24" />)}
          </div>
        </div>
      )}

      {/* Topics */}
      {job.topics?.length > 0 && (
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Topics</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {job.topics.map(t => <Tag key={t} label={`#${t}`} color="#7E1519" />)}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "0.25rem" }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <ActionBtn icon={<IconEye />} label="View" color="#3b82f6" onClick={() => navigate(`/jobs/${id}`)} />
        <ActionBtn icon={<IconEdit />} label="Edit" color="#CA1D24" onClick={() => navigate(`/jobs/edit/${id}`)} />
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
        flex: label === "Delete" ? "0 0 auto" : 1,
        justifyContent: "center",
      }}
    >
      {icon}
      {label}
    </button>
  );
}