import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Jobs pages
import JobsPage from "./pages/jobs/JobsPage";
import JobForm from "./pages/jobs/JobForm";
import JobDetails from "./pages/jobs/JobDetails";

// Candidates pages
import CandidatesPage from "./pages/candidates/CandidatesPage";
import CandidateForm from "./pages/candidates/CandidateForm";
import CandidateDetails from "./pages/candidates/CandidateDetails";

// Interview pages
import InterviewPage from "./pages/interview/InterviewPage";
import InterviewForm from "./pages/interview/InterviewForm";
import InterviewDetails from "./pages/interview/InterviewDetaills";

// AI pages
import AIInterview from "./pages/AI/AIInterview";
import AIInterviewActive from "./pages/AI/AIInterviewActive";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<h1>Dashboard</h1>} />

          {/* Jobs module */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/new" element={<JobForm />} />
          <Route path="/jobs/edit/:id" element={<JobForm />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Other modules */}
          {/* Candidates module */}
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/new" element={<CandidateForm />} />
          <Route path="/candidates/edit/:id" element={<CandidateForm />} />
          <Route path="/candidates/:id" element={<CandidateDetails />} />

          {/* Interviews module */}
          <Route path="/interviews" element={<InterviewPage />} />
          <Route path="/interviews/new" element={<InterviewForm />} />
          <Route path="/interviews/edit/:id" element={<InterviewForm />} />
          <Route path="/interviews/:id" element={<InterviewDetails />} />

          <Route path="/ai" element={<AIInterview />} />
          <Route path="/ai/interview/:jobId/:candidateId" element={<AIInterviewActive />} />
        </Routes>
      </Layout>
    </Router>
  );
}