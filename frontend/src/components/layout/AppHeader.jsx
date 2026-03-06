import React, { useState, useEffect } from "react";
import bannerLogo from "../../assets/banner_logo.png";

/**
 * Reusable top-level application header.
 *
 * Props:
 *  - branch      {string}  Selected branch name (e.g. "PANGANIBAN BRANCH")
 *  - terminalId  {string}  Terminal identifier (defaults to "000")
 */
const AppHeader = ({ branch = "", terminalId = "000" }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-6 pb-4 bg-linear-to-b from-[#062d8c] to-[#062d8c] shrink-0">
      {/* ── Left: Logo + Branch ── */}
      <div className="flex flex-col gap-1">
        <div className="h-10 sm:h-12 lg:h-14 w-auto">
          <img
            alt="Banner Logo"
            src={bannerLogo}
            className="h-full w-auto object-contain pointer-events-none"
          />
        </div>
        {branch && (
          <p className="font-semibold text-xs sm:text-sm text-[rgba(185,224,255,0.85)] tracking-wide truncate max-w-55">
            {branch}
          </p>
        )}
      </div>

      {/* ── Center: Terminal ID ── */}
      <p className="font-semibold text-base sm:text-lg lg:text-2xl text-[rgba(228,226,226,0.44)] whitespace-nowrap">
        TERMINAL ID: {terminalId}
      </p>

      {/* ── Right: Online Status ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        <p className="hidden sm:block font-semibold text-sm sm:text-base text-[rgba(255,255,255,0.6)] whitespace-nowrap">
          STATUS:
        </p>
        <div
          className={`relative flex gap-2 h-10 sm:h-11 items-center justify-center px-4 rounded-[18px] ${
            isOnline ? "bg-[#0c8628]" : "bg-[#cc5500]"
          }`}
        >
          <div
            aria-hidden="true"
            className="absolute border border-[#062d8c] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_0px_40px_0px_rgba(3,31,99,0.1)]"
          />
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-[#acf9be]" : "bg-white"
            }`}
          />
          <p className="font-semibold text-[#acf9be] text-base sm:text-lg whitespace-nowrap">
            {isOnline ? "ONLINE" : "OFFLINE"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
