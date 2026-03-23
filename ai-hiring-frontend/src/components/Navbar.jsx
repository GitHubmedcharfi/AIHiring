import React from "react";
import zetaLogo from "../assets/logo.png";

export default function Navbar({ toggleSidebar, isOpen }) {
  return (
    <nav className="flex items-center justify-between bg-brand-red text-white px-6 h-16 shadow-nav sticky top-0 z-30">

      {/* Left: toggle + brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          id="sidebar-toggle"
          className="p-2 rounded-lg hover:bg-brand-red-mid transition-colors duration-150"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center overflow-hidden">
            <img src={zetaLogo} alt="SmartHire Logo" className="w-7 h-7 object-contain" />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-bold tracking-tight">SmartHire</span>
            <span className="text-[10px] font-medium bg-white/20 rounded px-1.5 py-0.5 ml-2 uppercase tracking-widest">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-3">


        {/* Avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/20">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <div className="hidden sm:block leading-tight text-right">
            <p className="text-sm font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </nav>
  );
}