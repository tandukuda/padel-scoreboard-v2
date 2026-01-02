"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Settings2, Play, Pause, RotateCcw } from "lucide-react";

// --- PADEL SCORING LOGIC ---
const POINTS = ["0", "15", "30", "40", "AD"];

const initialScore = {
  p1: 0,
  p2: 0,
  winner: null,
};

// --- COMPONENT: LED BOARD (1800x100) ---
const LEDBoard = ({ data }) => {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setMounted(true);

    // Auto-scale logic
    const handleResize = () => {
      // 1840 includes a small buffer for padding
      setScale(Math.min(window.innerWidth / 1840, 1));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!mounted) return null;

  // --- LOGIC TO MAKE TEXT LOOP FILL THE SCREEN ---
  // We repeat the text enough times to fill the 1800px width
  // This prevents big black gaps between loops
  const baseText = data.runningText || "WELCOME TO PADEL CHAMPIONS •";
  // If text is short, repeat it more. If long, repeat less.
  const repeatCount = baseText.length < 20 ? 8 : baseText.length < 50 ? 4 : 2;
  const loopedText = Array(repeatCount).fill(baseText).join(" • ");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {scale < 0.9 && (
        <div className="absolute top-4 text-gray-500 text-xs font-mono">
          PREVIEW MODE (Scaled {(scale * 100).toFixed(0)}%) - OBS WILL SEE FULL
          1800px
        </div>
      )}

      {/* SCALE WRAPPER */}
      <div style={{ transform: `scale(${scale})` }}>
        {/* THE MAIN BOARD CONTAINER */}
        <div
          className="relative bg-[#E38035] rounded-[30px] shadow-2xl overflow-hidden"
          style={{ width: "1800px", height: "100px" }}
        >
          {/* MODE 1: SCOREBOARD */}
          {data.mode === "score" && (
            <>
              {/* --- LEFT COURT --- */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-[84px] min-w-[320px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-6 shadow-lg">
                {data.left.winner ? (
                  <span className="text-4xl font-bold tracking-wider text-[#E38035] font-mono animate-pulse">
                    WINNER
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-right">
                      {POINTS[data.left.p1]}
                    </span>
                    <span className="text-5xl text-gray-500 font-light pt-2">
                      /
                    </span>
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-left">
                      {POINTS[data.left.p2]}
                    </span>
                  </div>
                )}
              </div>

              {/* --- CENTER CLOCK --- */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-10 shadow-xl">
                <span className="text-6xl font-bold text-[#FFF6E5] font-mono tracking-widest mt-1">
                  {time}
                </span>
              </div>

              {/* --- RIGHT COURT --- */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-[84px] min-w-[320px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-6 shadow-lg">
                {data.right.winner ? (
                  <span className="text-4xl font-bold tracking-wider text-[#E38035] font-mono animate-pulse">
                    WINNER
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-right">
                      {POINTS[data.right.p1]}
                    </span>
                    <span className="text-5xl text-gray-500 font-light pt-2">
                      /
                    </span>
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-left">
                      {POINTS[data.right.p2]}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODE 2: RUNNING TEXT */}
          {data.mode === "text" && (
            <>
              {/* Scrolling Text Layer */}
              <div className="absolute inset-0 flex items-center overflow-hidden">
                <div
                  // We use 'loopedText' here instead of single text
                  // Defaulting to always animate if in text mode (no need to click start)
                  className={`whitespace-nowrap text-[70px] font-bold text-black uppercase ${data.isAnimating ? "animate-marquee" : ""}`}
                  style={{
                    transform: data.isAnimating
                      ? undefined
                      : "translateX(1800px)",
                  }}
                >
                  {loopedText}
                </div>
              </div>

              {/* Clock Overlay */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-[#0C0C0C] text-[#FFF6E5] rounded-xl px-8 py-2 shadow-2xl border-2 border-[#E38035]">
                  <span className="text-5xl font-bold font-mono tracking-widest">
                    {time}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: CONTROLLER (Admin Panel) ---
const ControlPanel = ({ broadcastScore }) => {
  const [mode, setMode] = useState("score");
  const [runningText, setRunningText] = useState("CHAMPIONS DE PADEL");
  // Set isAnimating to TRUE by default so it starts immediately
  const [isAnimating, setIsAnimating] = useState(true);

  const [left, setLeft] = useState({ ...initialScore });
  const [right, setRight] = useState({ ...initialScore });

  useEffect(() => {
    broadcastScore({ mode, runningText, left, right, isAnimating });
  }, [mode, runningText, left, right, isAnimating]);

  const handlePoint = (court, player) => {
    const setCourt = court === "left" ? setLeft : setRight;

    setCourt((prev) => {
      if (prev.winner) return prev;
      let p1 = prev.p1;
      let p2 = prev.p2;

      if (player === 1) p1++;
      else p2++;

      if (p1 > 3 && p2 > 3) {
        if (p1 === p2) {
          p1 = 3;
          p2 = 3;
        } else if (p1 - p2 > 1) {
          return { ...prev, winner: 1 };
        } else if (p2 - p1 > 1) {
          return { ...prev, winner: 2 };
        }
      } else if (p1 > 3) {
        return { ...prev, winner: 1 };
      } else if (p2 > 3) {
        return { ...prev, winner: 2 };
      }

      return { ...prev, p1, p2 };
    });
  };

  const resetGame = (court) => {
    if (court === "left") setLeft({ ...initialScore });
    else setRight({ ...initialScore });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#E38035] tracking-wider">
          PADEL CONTROL
        </h1>
        <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setMode("score")}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${mode === "score" ? "bg-[#E38035] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            SCOREBOARD
          </button>
          <button
            onClick={() => setMode("text")}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${mode === "text" ? "bg-[#E38035] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            RUNNING TEXT
          </button>
        </div>
      </div>

      {/* TEXT MODE CONTROLS */}
      {mode === "text" && (
        <div className="bg-gray-900 p-6 rounded-2xl mb-6 border border-gray-800 animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <label className="block mb-3 text-sm font-bold text-[#E38035] uppercase tracking-wider">
            Running Text Message
          </label>
          <div className="flex gap-4 mb-4">
            <input
              value={runningText}
              onChange={(e) => setRunningText(e.target.value)}
              className="flex-1 bg-black border border-gray-700 p-4 text-lg rounded-xl text-white font-mono focus:border-[#E38035] outline-none transition-colors"
              placeholder="Type message here..."
            />
          </div>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${isAnimating ? "bg-red-600 hover:bg-red-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"}`}
          >
            {isAnimating ? (
              <>
                <Pause size={20} /> PAUSE ANIMATION
              </>
            ) : (
              <>
                <Play size={20} /> START ANIMATION
              </>
            )}
          </button>
        </div>
      )}

      {/* SCOREBOARD CONTROLS */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${mode === "text" ? "opacity-40 pointer-events-none grayscale" : ""}`}
      >
        {/* LEFT COURT - BLUE */}
        <CourtController
          name="Left Court"
          color="blue"
          scoreData={left}
          onPoint={(p) => handlePoint("left", p)}
          onReset={() => resetGame("left")}
        />

        {/* RIGHT COURT - GREEN */}
        <CourtController
          name="Right Court"
          color="green"
          scoreData={right}
          onPoint={(p) => handlePoint("right", p)}
          onReset={() => resetGame("right")}
        />
      </div>
    </div>
  );
};

// Sub-component for Court Card
const CourtController = ({ name, color, scoreData, onPoint, onReset }) => {
  const isBlue = color === "blue";
  const cardStyle = isBlue
    ? "bg-gray-900 border-t-4 border-blue-600"
    : "bg-gray-900 border-t-4 border-green-600";

  const buttonStyle = isBlue
    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
    : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/20";

  return (
    <div
      className={`${cardStyle} p-6 rounded-2xl shadow-xl border border-gray-800`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{name}</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[10px] bg-red-950/50 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-md font-bold uppercase transition-colors tracking-wide border border-red-900/50"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Score Display Box */}
      <div className="text-center bg-black rounded-xl py-8 mb-6 border border-gray-800 relative overflow-hidden">
        {scoreData.winner && (
          <div
            className={`absolute inset-0 opacity-20 ${isBlue ? "bg-blue-600" : "bg-green-600"}`}
          ></div>
        )}
        <span className="text-7xl font-mono text-white relative z-10 font-bold tracking-tight">
          {scoreData.winner
            ? `WIN`
            : `${POINTS[scoreData.p1]} - ${POINTS[scoreData.p2]}`}
        </span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onPoint(1)}
          disabled={scoreData.winner}
          className={`${buttonStyle} py-4 rounded-xl font-bold text-lg active:scale-95 shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none`}
        >
          Player A +
        </button>
        <button
          onClick={() => onPoint(2)}
          disabled={scoreData.winner}
          className={`${buttonStyle} py-4 rounded-xl font-bold text-lg active:scale-95 shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none`}
        >
          Player B +
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE ROOT ---
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState("landing");
  const [channel, setChannel] = useState(null);
  const [boardData, setBoardData] = useState({
    mode: "score",
    left: initialScore,
    right: initialScore,
    isAnimating: true,
  });

  useEffect(() => {
    setIsClient(true);
    const bc = new BroadcastChannel("padel_channel");
    setChannel(bc);
    bc.onmessage = (event) => setBoardData(event.data);
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "board") setView("board");
    if (params.get("view") === "control") setView("control");
    return () => bc.close();
  }, []);

  const sendUpdate = (newData) => {
    if (channel) {
      channel.postMessage(newData);
      setBoardData(newData);
    }
  };

  if (!isClient) return null;
  if (view === "board") return <LEDBoard data={boardData} />;
  if (view === "control") return <ControlPanel broadcastScore={sendUpdate} />;

  // LANDING PAGE UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 gap-10 font-sans text-white p-4">
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl font-extrabold text-[#E38035] mb-2 tracking-tight">
          PADEL SYSTEM
        </h1>
        <p className="text-gray-400 text-lg">LED Scoreboard & Controller</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-6 max-w-4xl w-full">
        <button
          onClick={() => {
            window.open("?view=board", "padel_board", "width=1800,height=100");
          }}
          className="group flex-1 flex flex-col items-center gap-4 bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-[#E38035] hover:bg-gray-800 transition-all duration-300 shadow-2xl hover:shadow-[#E38035]/10"
        >
          <div className="bg-[#E38035]/10 p-6 rounded-full group-hover:scale-110 transition-transform duration-300">
            <Monitor size={48} className="text-[#E38035]" />
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold mb-2 text-white">
              Launch LED Board
            </span>
            <span className="block text-sm text-gray-400">
              Opens the 1800x100 Display
            </span>
          </div>
        </button>

        <button
          onClick={() => setView("control")}
          className="group flex-1 flex flex-col items-center gap-4 bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-blue-500 hover:bg-gray-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/10"
        >
          <div className="bg-blue-500/10 p-6 rounded-full group-hover:scale-110 transition-transform duration-300">
            <Settings2 size={48} className="text-blue-500" />
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold mb-2 text-white">
              Open Controller
            </span>
            <span className="block text-sm text-gray-400">
              Manage Scores & Text
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
