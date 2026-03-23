import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main area: shifted right when sidebar open */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}