"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Settings2, Play, Pause, RotateCcw } from "lucide-react";

const POINTS = ["0", "15", "30", "40", "AD"];

const initialScore = {
  p1: 0,
  p2: 0,
  winner: null,
};

// --- COMPONENT: LED BOARD ---
const LEDBoard = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setMounted(true);

    // 1. POLLING: Fetch data from server every 500ms
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/score");
        const newData = await res.json();
        if (newData) setData(newData);
      } catch (e) {
        console.error("Connection lost", e);
      }
    }, 500); // 0.5 seconds delay

    // 2. Scaling Logic
    const handleResize = () => {
      setScale(Math.min(window.innerWidth / 1840, 1));
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // 3. Clock
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!mounted) return null;

  // Repeat text logic
  const baseText = data.runningText || "WELCOME TO PADEL CHAMPIONS •";
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
      <div style={{ transform: `scale(${scale})` }}>
        <div
          className="relative bg-[#E38035] rounded-[30px] shadow-2xl overflow-hidden"
          style={{ width: "1800px", height: "100px" }}
        >
          {data.mode === "score" && (
            <>
              {/* LEFT COURT */}
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
              {/* CLOCK */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-10 shadow-xl">
                <span className="text-6xl font-bold text-[#FFF6E5] font-mono tracking-widest mt-1">
                  {time}
                </span>
              </div>
              {/* RIGHT COURT */}
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

          {data.mode === "text" && (
            <>
              <div className="absolute inset-0 flex items-center overflow-hidden">
                <div
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

// --- COMPONENT: CONTROLLER ---
const ControlPanel = () => {
  const [state, setState] = useState({
    mode: "score",
    runningText: "CHAMPIONS DE PADEL",
    isAnimating: true,
    left: { p1: 0, p2: 0, winner: null },
    right: { p1: 0, p2: 0, winner: null },
  });

  // Sync to server whenever state changes
  const updateServer = async (newState) => {
    setState(newState);
    try {
      await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      });
    } catch (e) {
      console.error("Failed to update server", e);
    }
  };

  const handlePoint = (court, player) => {
    const newState = { ...state };
    const currentCourt = court === "left" ? newState.left : newState.right;

    if (currentCourt.winner) return;

    if (player === 1) currentCourt.p1++;
    else currentCourt.p2++;

    // Deuce & Win Logic
    if (currentCourt.p1 > 3 && currentCourt.p2 > 3) {
      if (currentCourt.p1 === currentCourt.p2) {
        currentCourt.p1 = 3;
        currentCourt.p2 = 3;
      } else if (currentCourt.p1 - currentCourt.p2 > 1) {
        currentCourt.winner = 1;
      } else if (currentCourt.p2 - currentCourt.p1 > 1) {
        currentCourt.winner = 2;
      }
    } else if (currentCourt.p1 > 3) {
      currentCourt.winner = 1;
    } else if (currentCourt.p2 > 3) {
      currentCourt.winner = 2;
    }

    updateServer(newState);
  };

  const resetGame = (court) => {
    const newState = { ...state };
    if (court === "left") newState.left = { ...initialScore };
    else newState.right = { ...initialScore };
    updateServer(newState);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#E38035] tracking-wider">
          PADEL CONTROL
        </h1>
        <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => updateServer({ ...state, mode: "score" })}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${state.mode === "score" ? "bg-[#E38035] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            SCOREBOARD
          </button>
          <button
            onClick={() => updateServer({ ...state, mode: "text" })}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${state.mode === "text" ? "bg-[#E38035] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            RUNNING TEXT
          </button>
        </div>
      </div>

      {state.mode === "text" && (
        <div className="bg-gray-900 p-6 rounded-2xl mb-6 border border-gray-800 animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <label className="block mb-3 text-sm font-bold text-[#E38035] uppercase tracking-wider">
            Running Text Message
          </label>
          <div className="flex gap-4 mb-4">
            <input
              value={state.runningText}
              onChange={(e) =>
                updateServer({ ...state, runningText: e.target.value })
              }
              className="flex-1 bg-black border border-gray-700 p-4 text-lg rounded-xl text-white font-mono focus:border-[#E38035] outline-none transition-colors"
              placeholder="Type message here..."
            />
          </div>
          <button
            onClick={() =>
              updateServer({ ...state, isAnimating: !state.isAnimating })
            }
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${state.isAnimating ? "bg-red-600 hover:bg-red-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"}`}
          >
            {state.isAnimating ? (
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

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${state.mode === "text" ? "opacity-40 pointer-events-none grayscale" : ""}`}
      >
        <CourtController
          name="Left Court"
          color="blue"
          scoreData={state.left}
          onPoint={(p) => handlePoint("left", p)}
          onReset={() => resetGame("left")}
        />
        <CourtController
          name="Right Court"
          color="green"
          scoreData={state.right}
          onPoint={(p) => handlePoint("right", p)}
          onReset={() => resetGame("right")}
        />
      </div>
    </div>
  );
};

const CourtController = ({ name, color, scoreData, onPoint, onReset }) => {
  const isBlue = color === "blue";
  const cardStyle = isBlue
    ? "bg-gray-900 border-t-4 border-blue-600"
    : "bg-gray-900 border-t-4 border-green-600";
  const buttonStyle = isBlue
    ? "bg-blue-600 hover:bg-blue-500 text-white"
    : "bg-green-600 hover:bg-green-500 text-white";

  return (
    <div
      className={`${cardStyle} p-6 rounded-2xl shadow-xl border border-gray-800`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{name}</h2>
        <button
          onClick={onReset}
          className="text-[10px] bg-red-950/50 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-md font-bold uppercase border border-red-900/50 flex items-center gap-1"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
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
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onPoint(1)}
          disabled={scoreData.winner}
          className={`${buttonStyle} py-4 rounded-xl font-bold text-lg active:scale-95 shadow-lg transition-all`}
        >
          Player A +
        </button>
        <button
          onClick={() => onPoint(2)}
          disabled={scoreData.winner}
          className={`${buttonStyle} py-4 rounded-xl font-bold text-lg active:scale-95 shadow-lg transition-all`}
        >
          Player B +
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState("landing");
  // Default State for Landing Page to prevent crashes
  const defaultData = {
    mode: "score",
    runningText: "",
    isAnimating: true,
    left: { p1: 0, p2: 0 },
    right: { p1: 0, p2: 0 },
  };

  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "board") setView("board");
    if (params.get("view") === "control") setView("control");
  }, []);

  if (!isClient) return null;
  if (view === "board") return <LEDBoard initialData={defaultData} />;
  if (view === "control") return <ControlPanel />;

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
          onClick={() =>
            window.open("?view=board", "padel_board", "width=1800,height=100")
          }
          className="flex-1 bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-[#E38035] hover:bg-gray-800 transition-all shadow-2xl text-center"
        >
          <span className="block text-2xl font-bold mb-2 text-white">
            <Monitor className="inline mr-2" /> Launch Board
          </span>
          <span className="block text-sm text-gray-400">
            For the Screen (OBS)
          </span>
        </button>
        <button
          onClick={() => setView("control")}
          className="flex-1 bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-blue-500 hover:bg-gray-800 transition-all shadow-2xl text-center"
        >
          <span className="block text-2xl font-bold mb-2 text-white">
            <Settings2 className="inline mr-2" /> Open Controller
          </span>
          <span className="block text-sm text-gray-400">
            For the Laptop/iPad
          </span>
        </button>
      </div>
    </div>
  );
}
