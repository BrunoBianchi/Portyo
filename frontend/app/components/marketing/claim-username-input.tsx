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

      <div className="relative flex items-center bg-white rounded-full p-2.5 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 transition-shadow duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.12)]">
        <div className="flex-1 flex items-center justify-end relative h-14">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(normalizeUsername(e.target.value))}
            placeholder="yourname"
            className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-bold text-text-main placeholder:text-gray-300 h-full text-right pr-0.5 tracking-tight"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center h-14 pr-4 md:pr-6">
          <span className="text-2xl md:text-3xl font-bold text-gray-500 select-none tracking-tight">.portyo.me</span>
        </div>
        <button
          disabled={!isValid}
          onClick={handleClaim}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-lg md:text-xl py-3 px-8 md:px-10 rounded-full transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          Claim Now
        </button>
      </div>
    </div>
  )
}
