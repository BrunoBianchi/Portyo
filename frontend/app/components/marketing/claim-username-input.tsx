import { useState } from "react";
import { useNavigate } from "react-router";

export default function ClaimUsernameInput() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  function handleClaim() {
    navigate('/sign-up?step=1&sufix=' + username);
  }

  function normalizeUsername(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+/, "")
      .replace(/-+/g, "-");
  }

  const isValid = username.length >= 5 && !username.endsWith("-");

  return (
    <div className="w-full max-w-[580px] relative group mx-auto">
      {/* Soft glow effect behind */}
      <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition duration-700"></div>

      <div className="relative flex flex-col sm:flex-row items-center bg-white rounded-[2rem] sm:rounded-full p-2 sm:p-2.5 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 transition-shadow duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.12)] gap-2 sm:gap-0">
        <div className="flex items-center w-full sm:w-auto h-12 sm:h-14 pl-2 sm:pl-6 justify-center sm:justify-start">
          <span className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-500 select-none tracking-tight">portyo.me/p/</span>
          <div className="flex-1 sm:flex-none flex items-center justify-start relative h-full sm:min-w-[10px]">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(normalizeUsername(e.target.value))}
              placeholder="yourname"
              className="w-full bg-transparent border-none outline-none text-lg sm:text-2xl md:text-3xl font-bold text-text-main placeholder:text-gray-300 h-full text-left pl-0.5 tracking-tight min-w-0"
              spellCheck={false}
            />
          </div>
        </div>

        <button
          disabled={!isValid}
          onClick={handleClaim}
          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base sm:text-lg md:text-xl py-3 sm:py-3 px-6 md:px-10 rounded-xl sm:rounded-full transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          Claim Now
        </button>
      </div>
    </div>
  )
}
