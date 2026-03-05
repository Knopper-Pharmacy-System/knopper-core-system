import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronDown, LoaderCircle, LogIn } from "lucide-react";
import bannerLogo from "../../assets/banner_logo.png";
import logoOutline from "../../assets/logo_outline.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [branch, setBranch] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const branches = [
    {
      value: "BMC MAIN",
      label: "BMC MAIN",
      address: "#6A J. Miranda Ave., Concepcion Pequeña, Naga City",
    },
    {
      value: "DIVERSION BRANCH",
      label: "DIVERSION BRANCH",
      address: "Roxas Avenue, Diversion Road, Triangulo, Naga City",
    },
    {
      value: "PANGANIBAN BRANCH",
      label: "PANGANIBAN BRANCH",
      address:
        "Door 11 & 12, Pavilion 7, Panganiban Drive Concepcion Pequeha, Naga City",
    },
  ];

  const selectedBranch = branches.find((b) => b.value === branch);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (credentials.username && credentials.password) {
        const mockRole = credentials.username.toLowerCase().includes("admin")
          ? "admin"
          : "cashier";
        navigate("/auth/pos");
      } else {
        setError("Please enter both username and password.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div
      className="bg-linear-to-b from-[#062d8c] from-59% to-[#3266e6] min-h-screen w-full flex flex-col overflow-x-hidden"
      data-name="newest login"
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-50 sm:px-6 lg:px-50 pt-14 pb-4 shrink-0">
        {/* Logo */}
        <div className="h-12 sm:h-14 lg:h-18 w-auto">
          <img
            alt="Banner Logo"
            className="h-full w-auto object-contain pointer-events-none"
            src={bannerLogo}
          />
        </div>

        {/* Terminal ID */}
        <p className="hidden sm:block font-semibold text-base sm:text-lg lg:text-2xl text-[rgba(228,226,226,0.44)] whitespace-nowrap">
          TERMINAL ID: 000
        </p>

        {/* Status */}
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
              className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-[#acf9be]" : "bg-white"}`}
            />
            <p className="font-semibold text-[#acf9be] text-base sm:text-lg whitespace-nowrap">
              {isOnline ? "ONLINE" : "OFFLINE"}
            </p>
          </div>
        </div>
      </header>

      {/* Header divider */}
      <div className="mx-4 sm:mx-6 lg:mx-50 h-px bg-[#7C7C7C] opacity-90 shrink-0" />

      <div className="flex-1 flex flex-col px-50 min-h-0">
        {/* ── Main Content ── */}
        <main className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 py-4 lg:py-6 min-h-0">
          {/* Left – Large logo (hidden on small screens, shown md+) */}
          <div className="hidden lg:flex lg:w-2/5 items-center justify-center shrink-0">
            <img
              alt="Logo Outline"
              className="w-full max-w-150 h-auto object-contain pointer-events-none"
              src={logoOutline}
            />
          </div>

          {/* Right – Branch info + Date/Time */}
          <div className="flex flex-col gap-4 lg:gap-5 flex-1 justify-center">
            {/* Mobile logo (shown only on small screens) */}
            <div className="flex lg:hidden justify-center">
              <img
                alt="Logo Outline"
                className="h-74 sm:h-82 w-auto object-contain pointer-events-none opacity-80"
                src={logoOutline}
              />
            </div>

            {/* Branch selector row */}
            <div className="grid grid-cols-3 items-center gap-6 sm:gap-8">
              {/* Left: label + dropdown stacked */}
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-lg sm:text-xl lg:text-2xl text-white whitespace-nowrap">
                  BRANCH:
                </p>
                {/* Dropdown */}
                <div className="relative bg-[#f4f4f4] flex items-center gap-2 h-12 sm:h-14 px-4 rounded-2xl shadow-[0px_0px_40px_0px_rgba(3,31,99,0.25)] cursor-pointer w-70">
                  <p
                    className={`font-semibold text-base sm:text-lg lg:text-xl truncate flex-1 text-center ${branch ? "text-[#103182]" : "text-[#9ca3af]"}`}
                  >
                    {selectedBranch?.label ?? "Select Branch"}
                  </p>
                  <ChevronDown className="text-[#103182] w-5 h-5 shrink-0" />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Branch
                    </option>
                    {branches.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right: branch name & address stacked */}
              <div className="col-span-2 flex flex-col gap-1 items-center text-center justify-self-center">
                <p className="font-semibold text-[#b9e0ff] text-5xl sm:text-xl lg:text-5xl leading-tight">
                  {selectedBranch?.label}
                </p>
                <p className="font-normal text-[#b9e0ff] text-xs sm:text-sm lg:text-base opacity-80">
                  {selectedBranch?.address}
                </p>
              </div>
            </div>

            {/* Date / Time card */}
            <div className="relative bg-[#001445]/50 rounded-3xl border border-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,20,69,0.6)] ring-1 ring-white/10 p-8 sm:p-10 lg:p-12 flex flex-col sm:flex-row gap-6 sm:gap-0 overflow-hidden">
              {/* Glass highlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
              {/* Date */}
              <div className="flex-1 flex flex-col gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-[2px] text-[rgba(190,140,0,0.85)]">
                  CURRENT DATE:
                </span>
                <span className="font-semibold text-[#c9d9ff] text-2xl sm:text-3xl lg:text-4xl">
                  {currentDate}
                </span>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px bg-gray-500/50 mx-6 lg:mx-10 self-stretch" />
              <div className="block sm:hidden h-px bg-gray-500/50" />

              {/* Time */}
              <div className="flex-1 flex flex-col gap-2">
                <span className="font-bold text-sm sm:text-base tracking-[2px] text-[rgba(190,140,0,0.85)]">
                  LOCAL TIME:
                </span>
                <span className="font-semibold text-[#c9d9ff] text-3xl sm:text-4xl lg:text-5xl tabular-nums">
                  {currentTime}
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* ── Login Bar ── */}
        <div className="shrink-0 pb-15 sm:pb-19 lg:pb-25">
          {/* Error */}
          {error && (
            <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="relative bg-[rgba(6,45,140,0.58)] rounded-3xl sm:rounded-4xl shadow-[0px_0px_30px_20px_rgba(6,45,140,0.71)] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-3 items-stretch sm:items-center"
          >
            {/* User ID */}
            <div className="flex items-center bg-[#edeaea] border border-black rounded-[16px] sm:rounded-[20px] shadow-[0px_0px_20px_2px_rgba(0,0,0,0.25)] h-21 sm:h-25 px-4 sm:px-6 gap-3 sm:gap-4 flex-1">
              <span className="font-semibold text-[#001d63] text-base sm:text-lg whitespace-nowrap shrink-0">
                USER ID:
              </span>
              <div className="w-px h-8 bg-[#606060]/60 shrink-0" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="flex-1 min-w-0 font-normal text-[#101010] text-lg sm:text-xl lg:text-2xl bg-transparent border-none outline-none"
                placeholder="USER ID"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="flex items-center bg-[#edeaea] border border-black rounded-[16px] sm:rounded-[20px] shadow-[0px_0px_20px_2px_rgba(0,0,0,0.25)] h-21 sm:h-25 px-4 sm:px-6 gap-3 sm:gap-4 flex-1">
              <span className="font-semibold text-[#001d63] text-base sm:text-lg whitespace-nowrap shrink-0">
                PASSWORD:
              </span>
              <div className="w-px h-8 bg-[#606060]/60 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="flex-1 min-w-0 font-normal text-[#101010] text-lg sm:text-xl lg:text-2xl bg-transparent border-none outline-none"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative bg-[#041848] flex items-center justify-center gap-2 h-21 sm:h-25 px-5 sm:px-6 rounded-[14px] sm:rounded-[18px] cursor-pointer hover:bg-[#052060] transition-colors w-full sm:w-60 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute border border-[rgba(195,195,195,0.26)] border-solid inset-0 pointer-events-none rounded-[14px] sm:rounded-[18px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.44)]"
              />
              <span className="relative font-semibold text-[#cad6f2] text-base sm:text-lg lg:text-xl whitespace-nowrap flex items-center gap-2">
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin w-5 h-5" />
                    AUTHENTICATING
                  </>
                ) : (
                  <>
                    LOGIN <LogIn className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="shrink-0 pb-3 px-4 sm:px-6 lg:px-10 flex items-center justify-center gap-3">
        <p className="font-semibold text-xs sm:text-sm lg:text-base text-[rgba(228,226,226,0.44)] text-center">
          Core Node v2.4.0
        </p>
        <div className="w-1.5 h-1.5 bg-[#E4E2E2] opacity-40 rounded-full" />
        <p className="font-semibold text-xs sm:text-sm lg:text-base text-[rgba(228,226,226,0.44)] text-center">
          AES-256 Encrypted
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
