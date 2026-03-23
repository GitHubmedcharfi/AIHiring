import { useState, useEffect } from "react";
import { getJobs } from "../../services/JobService";
import { getCandidates } from "../../services/CandidateService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function AIInterview() {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [selectedCandidateId, setSelectedCandidateId] = useState("");
    const [candidateSearch, setCandidateSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [jobsData, candidatesData] = await Promise.all([
                    getJobs(),
                    getCandidates()
                ]);
                setJobs(jobsData);
                setCandidates(candidatesData);
            } catch (err) {
                console.error("Failed to load data", err);
                Swal.fire("Error", "Could not load data. Please check your connection.", "error");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredCandidates = candidates.filter(c => 
        c.name?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(candidateSearch.toLowerCase())
    );

    const handleStartInterview = () => {
        if (!selectedJobId || !selectedCandidateId) {
            Swal.fire("Incomplete", "Please select both a job and a candidate.", "warning");
            return;
        }
        navigate(`/ai/interview/${selectedJobId}/${selectedCandidateId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 lg:p-12 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-black tracking-tight">
                        AI Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Simulator</span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto">
                        Empowering candidates with AI-driven technical challenges and real-time evaluation.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Job Cards */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">1. Select Target Job</h2>
                            <span className="text-sm font-medium text-gray-500">{jobs.length} Positions Available</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.map(job => (
                                <div 
                                    key={job.id || job._id}
                                    onClick={() => setSelectedJobId(job.id || job._id)}
                                    className={`group relative overflow-hidden p-6 rounded-3xl border-2 transition-all cursor-pointer shadow-sm
                                        ${selectedJobId === (job.id || job._id) 
                                            ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-500/10' 
                                            : 'border-white bg-white hover:border-indigo-200 hover:shadow-md'}
                                    `}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            </div>
                                            {selectedJobId === (job.id || job._id) && (
                                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{job.company || "Your Company"}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {(job.skills || []).slice(0, 3).map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Candidate & Setup */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">2. Assign Candidate</h2>
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Search candidate..."
                                        value={candidateSearch}
                                        onChange={(e) => setCandidateSearch(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                    <div className="absolute right-4 top-3 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {filteredCandidates.map(c => (
                                        <div 
                                            key={c.id || c._id}
                                            onClick={() => setSelectedCandidateId(c.id || c._id)}
                                            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all
                                                ${selectedCandidateId === (c.id || c._id)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white hover:bg-indigo-50 text-gray-700'}
                                            `}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                                ${selectedCandidateId === (c.id || c._id) ? 'bg-indigo-500' : 'bg-gray-100'}
                                            `}>
                                                {c.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{c.name}</p>
                                                <p className={`text-xs truncate ${selectedCandidateId === (c.id || c._id) ? 'text-indigo-100' : 'text-gray-400'}`}>
                                                    {c.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredCandidates.length === 0 && (
                                        <p className="text-xs text-center text-gray-400 py-4">No candidates found.</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handleStartInterview}
                            disabled={!selectedJobId || !selectedCandidateId}
                            className="w-full py-5 rounded-3xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-extrabold text-lg shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] transform"
                        >
                            Start AI Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}