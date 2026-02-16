"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Monitor,
  Settings2,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Trophy,
  Undo2,
  LayoutGrid,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Upload,
  Film,
  Image as ImageIcon,
} from "lucide-react";

// --- GLOBAL CONSTANTS ---
const TENNIS_POINTS = ["0", "15", "30", "40", "AD"];

// --- HELPER FUNCTIONS ---
const getSeconds = (stored: any, start: any) => {
  if (!start) return stored;
  const now = Date.now();
  const diff = Math.floor((now - start) / 1000);
  return stored + diff;
};

const formatTimer = (seconds: any) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// --- COMPONENT 1: LED BOARD (OBS/TV DISPLAY) ---
const LEDBoard = ({ initialData }: { initialData: any }) => {
  const [data, setData] = useState(initialData);
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [displayTimers, setDisplayTimers] = useState({ left: 0, right: 0 });

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/score");
        const newData = await res.json();
        if (newData) setData(newData);
      } catch (e) {
        console.error(e);
      }
    }, 500);

    const timerInterval = setInterval(() => {
      setDisplayTimers({
        left: getSeconds(data.left?.timerStored || 0, data.left?.timerStart),
        right: getSeconds(data.right?.timerStored || 0, data.right?.timerStart),
      });
    }, 100);

    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    const handleResize = () => setScale(Math.min(window.innerWidth / 1840, 1));
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
      clearInterval(clockInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  if (!mounted) return null;

  const loopedText = (data.runningText || "PADEL CHAMPIONS").repeat(20);

  // --- SUB-COMPONENT: COURT DISPLAY ---
  const CourtDisplay = ({ side, courtData, currentTimer }: any) => {
    const isLeft = side === "left";

    // Position: Edge positioning
    const posClass = isLeft ? "left-8" : "right-8";

    const template = courtData.template || "americano";

    // Common Translucent Style WITH Rounded Corners
    const boxStyle =
      "bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl";

    // Width
    const widthClass = "w-[340px]";

    // Height: Matches Clock (84px)
    const heightClass = "h-[84px]";

    if (!courtData) return null;

    // 1. TIMER MODE
    if (template === "timer") {
      return (
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-4 ${posClass} ${!isLeft ? "flex-row-reverse" : ""}`}
        >
          <div
            className={`${heightClass} min-w-[160px] flex items-center justify-center px-4 border-l-4 border-[#E38035] ${boxStyle}`}
          >
            <span className="text-5xl text-[#FFF6E5] tracking-widest font-mono">
              {formatTimer(currentTimer)}
            </span>
          </div>

          {/* Logo Slot */}
          <div className="h-[80px] w-[80px] bg-white/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#E38035] backdrop-blur-sm">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-full w-full object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      );
    }

    // 2. TENNIS FORMAT (Layout Flipped for Right Court)
    if (template === "tennis") {
      const TennisRow = ({ name, sets, points, isBottom = false }: any) => {
        return (
          <div
            className={`flex-1 flex items-center px-4 ${!isBottom ? "border-b border-white/10" : ""}`}
          >
            {/* LEFT COURT: [NAME] [SETS] [POINTS] */}
            {isLeft ? (
              <>
                <span className="flex-1 text-white font-bold text-lg uppercase truncate font-mono text-left pt-1">
                  {name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#E38035] font-bold text-lg font-mono">
                    {sets}
                  </span>
                  <span className="text-2xl text-[#FFF6E5] font-mono font-bold w-[40px] text-right">
                    {TENNIS_POINTS[points] || "0"}
                  </span>
                </div>
              </>
            ) : (
              /* RIGHT COURT: [POINTS] [SETS] [NAME] */
              <>
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[#FFF6E5] font-mono font-bold w-[40px] text-left">
                    {TENNIS_POINTS[points] || "0"}
                  </span>
                  <span className="text-[#E38035] font-bold text-lg font-mono">
                    {sets}
                  </span>
                </div>
                <span className="flex-1 text-white font-bold text-lg uppercase truncate font-mono text-right pt-1">
                  {name}
                </span>
              </>
            )}
          </div>
        );
      };

      return (
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${heightClass} ${widthClass} ${boxStyle} flex flex-col overflow-hidden border-b-4 border-[#E38035] ${posClass}`}
        >
          <TennisRow
            name={courtData.p1Name}
            sets={courtData.p1Sets}
            points={courtData.p1}
          />
          <TennisRow
            name={courtData.p2Name}
            sets={courtData.p2Sets}
            points={courtData.p2}
            isBottom
          />
        </div>
      );
    }

    // 3. AMERICANO (With Slash)
    // 3. AMERICANO (Two-Row Layout - Tennis Style, No Sets)
    const AmericanoRow = ({ name, points, isBottom = false }: any) => {
      return (
        <div
          className={`flex-1 flex items-center px-4 ${!isBottom ? "border-b border-white/10" : ""}`}
        >
          {/* LEFT COURT: [NAME] [POINTS] */}
          {isLeft ? (
            <>
              <span className="flex-1 text-white font-bold text-lg uppercase truncate font-mono text-left pt-1">
                {name}
              </span>
              <span className="text-2xl text-[#FFF6E5] font-mono font-bold w-[40px] text-right">
                {points}
              </span>
            </>
          ) : (
            /* RIGHT COURT: [POINTS] [NAME] */
            <>
              <span className="text-2xl text-[#FFF6E5] font-mono font-bold w-[40px] text-left">
                {points}
              </span>
              <span className="flex-1 text-white font-bold text-lg uppercase truncate font-mono text-right pt-1">
                {name}
              </span>
            </>
          )}
        </div>
      );
    };

    return (
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${heightClass} ${widthClass} ${boxStyle} flex flex-col overflow-hidden border-b-4 border-[#E38035] ${posClass}`}
      >
        <AmericanoRow name={courtData.p1Name} points={courtData.p1} />
        <AmericanoRow name={courtData.p2Name} points={courtData.p2} isBottom />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent overflow-hidden font-mono">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 45s linear infinite; }
      `}</style>

      <div style={{ transform: `scale(${scale})` }}>
        {/* Main Board Container: Sharp Corners (Square) */}
        <div
          className="relative overflow-hidden"
          style={{ width: "1800px", height: "100px" }}
        >
          {/* BACKGROUND LAYER (Static Orange or Video BG) */}
          {(!data.motion?.active || !data.motion?.asBackground) && (
            <div className="absolute inset-0 bg-[#E38035]" />
          )}

          {/* MOTION LAYER */}
          {data.motion?.active && data.motion?.src && (
            <div
              className={`absolute inset-0 bg-black flex items-center justify-center overflow-hidden ${data.motion.asBackground ? "z-0" : "z-[60]"}`}
            >
              <video
                key={data.motion.src}
                src={data.motion.src}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
              {/* VIDEO OVERLAY CLOCK: Rounded Corners Restored */}
              {!data.motion.asBackground && data.showClock && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-black/60 backdrop-blur-md flex items-center justify-center px-10 border border-white/20 rounded-2xl">
                  <span className="text-6xl text-white tracking-widest font-mono">
                    {time}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* DATA LAYER (Scores) */}
          {(!data.motion?.active || data.motion?.asBackground) && (
            <div className="relative z-10 w-full h-full">
              {data.viewMode === "text" ? (
                <div className="absolute inset-0 flex items-center overflow-hidden bg-[#E38035] z-50">
                  <div
                    className={`whitespace-nowrap text-[70px] text-black uppercase font-bold font-mono ${data.isAnimating ? "animate-marquee" : ""}`}
                  >
                    {loopedText}
                  </div>
                </div>
              ) : (
                <>
                  <CourtDisplay
                    side="left"
                    courtData={data.left}
                    currentTimer={displayTimers.left}
                  />
                  <CourtDisplay
                    side="right"
                    courtData={data.right}
                    currentTimer={displayTimers.right}
                  />
                </>
              )}

              {/* MAIN CLOCK LAYER: Rounded Corners Restored */}
              {data.showClock && (
                <div className="absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-black/40 backdrop-blur-md flex items-center justify-center px-10 shadow-xl border border-white/10 rounded-2xl">
                  <span className="text-6xl text-[#FFF6E5] tracking-widest mt-1 font-mono">
                    {time}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: CONTROLLER ---
const ControlPanel = () => {
  const [state, setState] = useState({
    viewMode: "score",
    runningText: "PADEL TOURNAMENT 2026",
    isAnimating: true,
    showClock: true, // GLOBAL CLOCK TOGGLE
    motion: {
      src: "/intro.mp4",
      active: true,
      asBackground: false,
      showClock: true,
    },
    left: {
      template: "americano",
      p1Name: "TEAM A",
      p2Name: "TEAM B",
      p1Sets: 0,
      p2Sets: 0,
      p1: 0,
      p2: 0,
      timerStart: null,
      timerStored: 0,
    },
    right: {
      template: "tennis",
      p1Name: "TEAM C",
      p2Name: "TEAM D",
      p1Sets: 0,
      p2Sets: 0,
      p1: 0,
      p2: 0,
      timerStart: null,
      timerStored: 0,
    },
  });

  const [filterCourt, setFilterCourt] = useState<string | null>(null);
  const [localTimers, setLocalTimers] = useState({ left: 0, right: 0 });
  const historyRef = useRef<any[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courtParam = params.get("court");
    if (courtParam === "left" || courtParam === "right")
      setFilterCourt(courtParam);

    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/score");
        const data = await res.json();
        setState((prev) => ({ ...prev, ...data }));
      } catch (e) {}
    }, 1000);

    const timer = setInterval(() => {
      setLocalTimers({
        left: getSeconds(state.left.timerStored, state.left.timerStart),
        right: getSeconds(state.right.timerStored, state.right.timerStart),
      });
    }, 500);

    return () => {
      clearInterval(poll);
      clearInterval(timer);
    };
  }, [state.left.timerStart, state.right.timerStart]);

  const pushToServer = async (payload: any) => {
    try {
      await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateState = (
    updater: any,
    scope: string | null = null,
    saveToHistory = false,
  ) => {
    setState((prev) => {
      if (saveToHistory) {
        historyRef.current.push(JSON.parse(JSON.stringify(prev)));
        if (historyRef.current.length > 10) historyRef.current.shift();
      }
      const next = updater(prev);
      let payload = next;
      if (scope === "left") payload = { left: next.left };
      if (scope === "right") payload = { right: next.right };
      if (scope === "motion") payload = { motion: next.motion };
      pushToServer(payload);
      return next;
    });
  };

  // --- VIDEO HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateState(
      (s: any) => ({ ...s, motion: { ...s.motion, src: url, active: true } }),
      "motion",
    );
  };

  const playVideo = (src: string) => {
    updateState(
      (s: any) => ({ ...s, motion: { ...s.motion, src: src, active: true } }),
      "motion",
    );
  };

  const handleUndo = () => {
    if (historyRef.current.length === 0) return;
    const previousState = historyRef.current.pop();
    setState(previousState);
    pushToServer(previousState);
  };

  const handlePoint = (courtSide: "left" | "right", player: 1 | 2) => {
    if (state.viewMode === "text") return;

    updateState(
      (prev: any) => {
        const n = JSON.parse(JSON.stringify(prev));
        const c = n[courtSide];
        const isP1 = player === 1;

        if (c.template === "americano") {
          if (isP1) c.p1++;
          else c.p2++;
          return n;
        }

        const myScore = isP1 ? c.p1 : c.p2;
        const oppScore = isP1 ? c.p2 : c.p1;
        let wonGame = false;

        if (myScore === 3 && oppScore < 3) wonGame = true;
        else if (myScore === 4) wonGame = true;
        else if (myScore === 3 && oppScore === 3) {
          if (isP1) c.p1 = 4;
          else c.p2 = 4;
        } else if (myScore === 3 && oppScore === 4) {
          if (isP1) c.p2 = 3;
          else c.p1 = 3;
        } else {
          if (isP1) c.p1++;
          else c.p2++;
        }

        if (wonGame) {
          if (isP1) c.p1Sets++;
          else c.p2Sets++;
          c.p1 = 0;
          c.p2 = 0;
        }
        return n;
      },
      courtSide,
      true,
    );
  };

  const toggleTimer = (courtSide: "left" | "right") => {
    updateState((prev: any) => {
      const n = JSON.parse(JSON.stringify(prev));
      const c = n[courtSide];
      if (c.timerStart) {
        c.timerStored += Math.floor((Date.now() - c.timerStart) / 1000);
        c.timerStart = null;
      } else {
        c.timerStart = Date.now();
      }
      return n;
    }, courtSide);
  };

  const resetTimer = (courtSide: "left" | "right") => {
    updateState((prev: any) => {
      const n = JSON.parse(JSON.stringify(prev));
      n[courtSide].timerStart = null;
      n[courtSide].timerStored = 0;
      return n;
    }, courtSide);
  };

  const resetGame = (courtSide: "left" | "right") => {
    updateState(
      (prev: any) => {
        const n = JSON.parse(JSON.stringify(prev));
        n[courtSide] = {
          ...n[courtSide],
          p1Sets: 0,
          p2Sets: 0,
          p1: 0,
          p2: 0,
          winner: null,
          timerStart: null,
          timerStored: 0,
        };
        return n;
      },
      courtSide,
      true,
    );
    setShowResetConfirm(false);
  };

  // --- RENDER: REMOTE CONTROL (Phone) ---
  if (filterCourt) {
    const side = filterCourt as "left" | "right";
    const court = state[side];
    const localTime = localTimers[side];
    const isTextMode = state.viewMode === "text";

    return (
      <div className="flex flex-col h-screen bg-black font-sans text-white overflow-hidden">
        <div className="bg-[#1a1a1a] p-4 text-center border-b border-gray-800">
          <div className="inline-block bg-[#E38035] text-black px-3 py-1 rounded font-bold text-xs uppercase tracking-wider mb-1">
            {side} COURT
          </div>
          <h2 className="text-gray-400 text-sm uppercase font-bold tracking-widest">
            {isTextMode
              ? "TEXT DISPLAY ACTIVE"
              : court.template === "americano"
                ? "AMERICANO MODE"
                : court.template === "tennis"
                  ? "TENNIS MODE"
                  : "TIMER MODE"}
          </h2>
        </div>

        <div className="flex justify-between px-4 py-4 bg-[#111]">
          <div className="w-[48%] bg-[#222] rounded-lg p-2 border border-gray-700">
            <input
              value={court.p1Name}
              onChange={(e) =>
                updateState((s: any) => {
                  const n = JSON.parse(JSON.stringify(s));
                  n[side].p1Name = e.target.value;
                  return n;
                }, side)
              }
              className="w-full bg-transparent text-center text-white font-bold outline-none uppercase"
            />
          </div>
          <div className="w-[48%] bg-[#222] rounded-lg p-2 border border-gray-700">
            <input
              value={court.p2Name}
              onChange={(e) =>
                updateState((s: any) => {
                  const n = JSON.parse(JSON.stringify(s));
                  n[side].p2Name = e.target.value;
                  return n;
                }, side)
              }
              className="w-full bg-transparent text-center text-white font-bold outline-none uppercase"
            />
          </div>
        </div>

        <div className="flex-none py-4 flex flex-col items-center justify-center bg-black relative border-b border-gray-800">
          {court.template === "timer" ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-[5rem] font-mono leading-none">
                {formatTimer(localTime)}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleTimer(side)}
                  className="w-20 h-20 rounded-full bg-[#E38035] flex items-center justify-center text-black"
                >
                  {court.timerStart ? <Pause size={32} /> : <Play size={32} />}
                </button>
                <button
                  onClick={() => resetTimer(side)}
                  className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-white"
                >
                  <RotateCcw size={32} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 w-full px-4">
              <div className="flex-1 text-center">
                <span className="text-[5rem] font-bold leading-none font-mono">
                  {court.template === "tennis"
                    ? TENNIS_POINTS[court.p1]
                    : court.p1}
                </span>
                {court.template === "tennis" && (
                  <div className="text-[#E38035] text-xl font-bold">
                    SETS: {court.p1Sets}
                  </div>
                )}
              </div>
              <div className="text-gray-600 text-3xl">-</div>
              <div className="flex-1 text-center">
                <span className="text-[5rem] font-bold leading-none font-mono">
                  {court.template === "tennis"
                    ? TENNIS_POINTS[court.p2]
                    : court.p2}
                </span>
                {court.template === "tennis" && (
                  <div className="text-[#E38035] text-xl font-bold">
                    SETS: {court.p2Sets}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {court.template !== "timer" && (
          <div className="flex-1 p-4 bg-[#111] pb-24 flex flex-col gap-4">
            {isTextMode ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl">
                <Lock size={48} className="text-gray-600 mb-2" />
                <p className="text-gray-500 font-bold uppercase">
                  Scoring Locked
                </p>
                <p className="text-gray-600 text-xs">Running Text is Active</p>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePoint(side, 1)}
                  className="bg-blue-600 active:bg-blue-500 h-full rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  <span className="text-xl font-bold uppercase mb-1 px-2 truncate w-full text-center opacity-80">
                    {court.p1Name}
                  </span>
                  <span className="text-6xl font-extrabold">+</span>
                </button>
                <button
                  onClick={() => handlePoint(side, 2)}
                  className="bg-blue-600 active:bg-blue-500 h-full rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  <span className="text-xl font-bold uppercase mb-1 px-2 truncate w-full text-center opacity-80">
                    {court.p2Name}
                  </span>
                  <span className="text-6xl font-extrabold">+</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 flex-none h-64">
              <button
                onClick={handleUndo}
                disabled={isTextMode}
                className="flex-1 bg-gray-800 disabled:opacity-30 text-white h-full rounded-xl font-bold flex items-center justify-center gap-2 active:bg-gray-700"
              >
                <Undo2 /> UNDO
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isTextMode}
                className="flex-1 bg-red-900/50 disabled:opacity-30 text-red-200 border border-red-900 h-full rounded-xl font-bold flex items-center justify-center gap-2 active:bg-red-900"
              >
                FULL RESET
              </button>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-2 flex justify-around items-center z-50 pb-6">
          <button
            onClick={() =>
              updateState((s: any) => {
                const n = JSON.parse(JSON.stringify(s));
                n[side].template = "americano";
                n.motion.active = false;
                n.viewMode = "score";
                return n;
              })
            }
            className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 ${court.template === "americano" ? "text-[#E38035]" : "text-gray-500"}`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold">SCORE</span>
          </button>
          <button
            onClick={() =>
              updateState((s: any) => {
                const n = JSON.parse(JSON.stringify(s));
                n[side].template = "timer";
                n.motion.active = false;
                n.viewMode = "score";
                return n;
              })
            }
            className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 ${court.template === "timer" ? "text-[#E38035]" : "text-gray-500"}`}
          >
            <Clock size={24} />
            <span className="text-[10px] font-bold">TIMER</span>
          </button>
          <button
            onClick={() =>
              updateState((s: any) => {
                const n = JSON.parse(JSON.stringify(s));
                n[side].template = "tennis";
                n.motion.active = false;
                n.viewMode = "score";
                return n;
              })
            }
            className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 ${court.template === "tennis" ? "text-[#E38035]" : "text-gray-500"}`}
          >
            <Trophy size={24} />
            <span className="text-[10px] font-bold">TENNIS</span>
          </button>
        </div>

        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#222] p-6 rounded-2xl w-full max-w-sm text-center border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">
                Confirm Reset?
              </h3>
              <p className="text-gray-400 mb-6">Scores will be set to 0-0.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-white"
                >
                  NO
                </button>
                <button
                  onClick={() => resetGame(side)}
                  className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white"
                >
                  YES
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: DESKTOP MASTER CONTROL ---
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans min-h-screen pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#E38035]">MASTER CONTROL</h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateState((s: any) => ({
                ...s,
                showClock: !s.showClock,
                motion: { ...s.motion, showClock: !s.motion.showClock },
              }))
            }
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${state.showClock ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            {state.showClock ? <Eye size={20} /> : <EyeOff size={20} />} CLOCK
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* LEFT PANEL: GLOBAL OVERLAYS */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-gray-400 font-bold mb-4">GLOBAL OVERLAYS</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() =>
                updateState((s: any) => ({
                  ...s,
                  viewMode: s.viewMode === "text" ? "score" : "text",
                  motion: { ...s.motion, active: false },
                }))
              }
              className={`flex-1 py-3 rounded-lg font-bold text-sm ${state.viewMode === "text" ? "bg-[#E38035] text-black" : "bg-gray-800 text-gray-500"}`}
            >
              {state.viewMode === "text" ? "HIDE TEXT" : "SHOW RUNNING TEXT"}
            </button>
          </div>
          {state.viewMode === "text" && (
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase">
                Running Text Content
              </label>
              <input
                value={state.runningText}
                onChange={(e) =>
                  updateState((s: any) => ({
                    ...s,
                    runningText: e.target.value,
                  }))
                }
                className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white mt-1"
              />
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MEDIA */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-gray-400 font-bold mb-4">MEDIA PLAYBACK</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() =>
                updateState(
                  (s: any) => ({
                    ...s,
                    motion: { ...s.motion, active: !s.motion.active },
                  }),
                  "motion",
                )
              }
              className={`py-3 rounded-lg font-bold text-sm ${state.motion.active ? "bg-green-600 text-white" : "bg-gray-800 text-gray-500"}`}
            >
              {state.motion.active ? "VIDEO ACTIVE" : "VIDEO OFF"}
            </button>
            <button
              onClick={() =>
                updateState(
                  (s: any) => ({
                    ...s,
                    motion: {
                      ...s.motion,
                      asBackground: !s.motion.asBackground,
                    },
                  }),
                  "motion",
                )
              }
              className={`py-3 rounded-lg font-bold text-sm ${state.motion.asBackground ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-500"}`}
            >
              {state.motion.asBackground
                ? "BACKGROUND MODE"
                : "FOREGROUND MODE"}
            </button>
          </div>

          {/* SPECIFIC FILE BUTTONS */}
          {/* SPECIFIC FILE BUTTONS */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => playVideo("/intro.mp4")}
              className="bg-[#222] hover:bg-[#333] border border-gray-700 py-3 rounded flex items-center justify-center gap-2 text-white text-sm"
            >
              <Film size={16} /> INTRO
            </button>
            <button
              onClick={() => playVideo("/advert.mp4")}
              className="bg-[#222] hover:bg-[#333] border border-gray-700 py-3 rounded flex items-center justify-center gap-2 text-white text-sm"
            >
              <Film size={16} /> ADVERT
            </button>
            <button
              onClick={() => playVideo("/video3.mp4")}
              className="bg-[#222] hover:bg-[#333] border border-gray-700 py-3 rounded flex items-center justify-center gap-2 text-white text-sm"
            >
              <Film size={16} /> VIDEO 3
            </button>
            <button
              onClick={() => playVideo("/video4.mp4")}
              className="bg-[#222] hover:bg-[#333] border border-gray-700 py-3 rounded flex items-center justify-center gap-2 text-white text-sm"
            >
              <Film size={16} /> VIDEO 4
            </button>
            <button
              onClick={() => playVideo("/video5.mp4")}
              className="bg-[#222] hover:bg-[#333] border border-gray-700 py-3 rounded flex items-center justify-center gap-2 text-white text-sm"
            >
              <Film size={16} /> VIDEO 5
            </button>
          </div>

          <div className="flex gap-2 items-center bg-black/50 p-2 rounded-lg">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
            >
              <Upload size={16} /> UPLOAD VIDEO
            </button>
            <div className="text-xs text-gray-500 truncate flex-1">
              {state.motion.src || "No video selected"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COURT MASTER VIEW */}
        <div
          className={`bg-gray-900 p-6 rounded-2xl border-t-4 border-blue-600 ${state.viewMode === "text" ? "opacity-50 pointer-events-none grayscale" : ""}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">LEFT COURT</h2>
            <div className="flex gap-1 bg-black rounded p-1">
              {["americano", "timer", "tennis"].map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    updateState((s: any) => {
                      const n = JSON.parse(JSON.stringify(s));
                      n.left.template = m;
                      return n;
                    })
                  }
                  className={`px-3 py-1 rounded text-xs font-bold uppercase ${state.left.template === m ? "bg-blue-600 text-white" : "text-gray-500"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={state.left.p1Name}
              onChange={(e) =>
                updateState((s: any) => {
                  const n = JSON.parse(JSON.stringify(s));
                  n.left.p1Name = e.target.value;
                  return n;
                }, "left")
              }
              className="bg-black border border-gray-700 p-2 w-1/2 text-center"
            />
            <input
              value={state.left.p2Name}
              onChange={(e) =>
                updateState((s: any) => {
                  const n = JSON.parse(JSON.stringify(s));
                  n.left.p2Name = e.target.value;
                  return n;
                }, "left")
              }
              className="bg-black border border-gray-700 p-2 w-1/2 text-center"
            />
          </div>

          {/* MASTER RENDER LOGIC FOR LEFT COURT */}
          {state.left.template === "timer" ? (
            <div className="flex flex-col items-center gap-4 py-8 bg-black/30 rounded-xl border border-gray-800">
              <span className="text-6xl font-mono font-bold text-[#E38035]">
                {formatTimer(localTimers.left)}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleTimer("left")}
                  className="w-16 h-16 rounded-full bg-[#E38035] flex items-center justify-center text-black hover:bg-[#d6722a]"
                >
                  {state.left.timerStart ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </button>
                <button
                  onClick={() => resetTimer("left")}
                  className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-6xl text-center font-mono font-bold mb-4 text-[#E38035]">
                {state.left.template === "tennis"
                  ? `${TENNIS_POINTS[state.left.p1]} - ${TENNIS_POINTS[state.left.p2]}`
                  : `${state.left.p1} / ${state.left.p2}`}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePoint("left", 1)}
                  className="bg-blue-600 py-4 rounded font-bold hover:bg-blue-500"
                >
                  + P1
                </button>
                <button
                  onClick={() => handlePoint("left", 2)}
                  className="bg-blue-600 py-4 rounded font-bold hover:bg-blue-500"
                >
                  + P2
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleUndo}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <Undo2 size={16} /> UNDO
                </button>
                <button
                  onClick={() => resetGame("left")}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  RESET
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COURT MASTER VIEW */}
        <div
          className={`bg-gray-900 p-6 rounded-2xl border-t-4 border-green-600 ${state.viewMode === "text" ? "opacity-50 pointer-events-none grayscale" : ""}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">RIGHT COURT</h2>
            <div className="flex gap-1 bg-black rounded p-1">
              {["americano", "timer", "tennis"].map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    updateState((s: any) => {
                      const n = JSON.parse(JSON.stringify(s));
                      n.right.template = m;
                      return n;
                    })
                  }
                  className={`px-3 py-1 rounded text-xs font-bold uppercase ${state.right.template === m ? "bg-green-600 text-white" : "text-gray-500"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={state.right.p1Name}
              onChange={(e) =>
                updateState((s: any) => {
                  const n = JSON.parse(JSON.stringify(s));
                  n.right.p1Name = e.target.value;
                  return n;
                }, "right")
              }
              className="bg-black border border-gray-700 p-2 w-1/2 text-center"
            />
            <input
              value={state.right.p2Name}
              onChange={(e) =>
                updateState((s: any) => {
                  const n = JSON.parse(JSON.stringify(s));
                  n.right.p2Name = e.target.value;
                  return n;
                }, "right")
              }
              className="bg-black border border-gray-700 p-2 w-1/2 text-center"
            />
          </div>

          {/* MASTER RENDER LOGIC FOR RIGHT COURT */}
          {state.right.template === "timer" ? (
            <div className="flex flex-col items-center gap-4 py-8 bg-black/30 rounded-xl border border-gray-800">
              <span className="text-6xl font-mono font-bold text-[#E38035]">
                {formatTimer(localTimers.right)}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleTimer("right")}
                  className="w-16 h-16 rounded-full bg-[#E38035] flex items-center justify-center text-black hover:bg-[#d6722a]"
                >
                  {state.right.timerStart ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </button>
                <button
                  onClick={() => resetTimer("right")}
                  className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-6xl text-center font-mono font-bold mb-4 text-[#E38035]">
                {state.right.template === "tennis"
                  ? `${TENNIS_POINTS[state.right.p1]} - ${TENNIS_POINTS[state.right.p2]}`
                  : `${state.right.p1} / ${state.right.p2}`}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePoint("right", 1)}
                  className="bg-green-600 py-4 rounded font-bold hover:bg-green-500"
                >
                  + P1
                </button>
                <button
                  onClick={() => handlePoint("right", 2)}
                  className="bg-green-600 py-4 rounded font-bold hover:bg-green-500"
                >
                  + P2
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleUndo}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <Undo2 size={16} /> UNDO
                </button>
                <button
                  onClick={() => resetGame("right")}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  RESET
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN EXPORT ---
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState("landing");
  const defaultData = {
    viewMode: "score",
    left: { template: "americano", p1: 0, p2: 0 },
    right: { template: "americano", p1: 0, p2: 0 },
    motion: { active: true, src: "/intro.mp4", showClock: true },
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
          PADEL SYSTEM v3.0
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Americano & Tennis Format Supported
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <button
          onClick={() =>
            window.open("?view=board", "padel_board", "width=1800,height=100")
          }
          className="col-span-1 md:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-[#E38035] hover:bg-gray-800 transition-all shadow-2xl text-center"
        >
          <span className="block text-2xl font-bold mb-2 text-white">
            <Monitor className="inline mr-2" /> Launch LED Board
          </span>
        </button>
        <button
          onClick={() => setView("control")}
          className="col-span-1 md:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-blue-500 hover:bg-gray-800 transition-all shadow-2xl text-center"
        >
          <span className="block text-2xl font-bold mb-2 text-white">
            <Settings2 className="inline mr-2" /> Master Control (Desktop)
          </span>
        </button>
        <div className="col-span-1 md:col-span-2 flex gap-4">
          <button
            onClick={() => (window.location.href = "?view=control&court=left")}
            className="flex-1 bg-blue-950/40 p-6 rounded-2xl border border-blue-900/50 hover:bg-blue-900/40 hover:border-blue-500 transition-all text-center"
          >
            <span className="block text-xl font-bold mb-1 text-blue-200">
              <Smartphone className="inline mr-2" /> Left Court Remote
            </span>
          </button>
          <button
            onClick={() => (window.location.href = "?view=control&court=right")}
            className="flex-1 bg-green-950/40 p-6 rounded-2xl border border-green-900/50 hover:bg-green-900/40 hover:border-green-500 transition-all text-center"
          >
            <span className="block text-xl font-bold mb-1 text-green-200">
              <Smartphone className="inline mr-2" /> Right Court Remote
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
