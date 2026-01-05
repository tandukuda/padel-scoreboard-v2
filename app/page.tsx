"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Settings2, Play, Pause, RotateCcw, Clock, Type, LayoutTemplate, Trophy, Video, Image as ImageIcon, ArrowRight, Eye, EyeOff, Smartphone } from "lucide-react";

const POINTS = ["0", "15", "30", "40", "AD"];

// --- HELPER: Time Logic ---
const getSeconds = (stored, start) => {
  if (!start) return stored;
  const now = Date.now();
  const diff = Math.floor((now - start) / 1000);
  return stored + diff;
};

const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// --- COMPONENT: LED BOARD ---
const LEDBoard = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [displayTimers, setDisplayTimers] = useState({ left: 0, right: 0 });

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/score');
        const newData = await res.json();
        if (newData) setData(newData);
      } catch (e) { console.error(e); }
    }, 500);

    const timerInterval = setInterval(() => {
      setDisplayTimers({
        left: getSeconds(data.left.timerStored, data.left.timerStart),
        right: getSeconds(data.right.timerStored, data.right.timerStart)
      });
    }, 100);

    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    const handleResize = () => setScale(Math.min(window.innerWidth / 1840, 1));
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
      clearInterval(clockInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  if (!mounted) return null;

  const loopedText = (data.runningText || "PADEL CHAMPIONS").repeat(20);

  const CourtDisplay = ({ side, courtData, template, currentTimer }) => {
    const isLeft = side === "left";
    const posClass = isLeft ? "left-3" : "right-3";

    if (courtData.winner) {
      return (
        <div className={`absolute top-1/2 -translate-y-1/2 h-[84px] min-w-[260px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-6 shadow-lg ${posClass}`}>
           <span className="text-4xl font-bold tracking-wider text-[#E38035] font-mono animate-pulse">WINNER</span>
        </div>
      );
    }

    if (template === "timer") {
      return (
        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-4 ${posClass} ${!isLeft ? 'flex-row-reverse' : ''}`}>
           <div className="h-[84px] min-w-[160px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-4 shadow-lg border-l-4 border-[#E38035]">
              <span className="text-5xl font-bold text-[#FFF6E5] font-mono tracking-widest">{formatTimer(currentTimer)}</span>
           </div>
           <div className="h-[84px] w-[84px] bg-[#0C0C0C] rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden shadow-lg">
              {data.logoSrc ? <img src={data.logoSrc} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-[10px] text-gray-600 font-mono text-center leading-tight">NO<br/>LOGO</span>}
           </div>
        </div>
      );
    }

    if (template === "full") {
      const dirClass = isLeft ? "flex-row" : "flex-row-reverse";
      const borderClass = isLeft ? "border-r" : "border-l";
      const textAlign = isLeft ? "text-left" : "text-right";
      return (
        <div className={`absolute top-1/2 -translate-y-1/2 h-[88px] min-w-[550px] bg-[#0C0C0C] rounded-xl flex ${dirClass} items-center overflow-hidden shadow-lg border-2 border-[#E38035] ${posClass}`}>
           <div className={`flex flex-col justify-center h-full flex-1 min-w-0 ${borderClass} border-gray-800`}>
              <div className={`flex items-center ${dirClass} justify-between h-1/2 px-4 border-b border-gray-900`}>
                 <div className="overflow-hidden w-full relative"><span className={`text-xl font-bold text-white uppercase block truncate ${textAlign}`}>{courtData.p1Name}</span></div>
                 <div className="bg-gray-800 px-2 rounded mx-2 min-w-[30px] text-center"><span className="text-[#E38035] font-bold">{courtData.p1Sets}</span></div>
              </div>
              <div className={`flex items-center ${dirClass} justify-between h-1/2 px-4`}>
                 <div className="overflow-hidden w-full relative"><span className={`text-xl font-bold text-white uppercase block truncate ${textAlign}`}>{courtData.p2Name}</span></div>
                  <div className="bg-gray-800 px-2 rounded mx-2 min-w-[30px] text-center"><span className="text-[#E38035] font-bold">{courtData.p2Sets}</span></div>
              </div>
           </div>
           <div className="flex flex-col justify-center h-full px-2 w-[70px] bg-black items-center">
               <span className="text-3xl font-mono font-bold text-[#FFF6E5] leading-tight mb-1">{POINTS[courtData.p1]}</span>
               <span className="text-3xl font-mono font-bold text-[#FFF6E5] leading-tight">{POINTS[courtData.p2]}</span>
           </div>
        </div>
      );
    }

    return (
      <div className={`absolute top-1/2 -translate-y-1/2 h-[84px] min-w-[260px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-4 shadow-lg overflow-hidden ${posClass}`}>
          <div className="flex items-center justify-between w-full relative h-full">
            <span className="text-6xl font-bold text-[#FFF6E5] font-mono text-center z-10 w-[60px]">{POINTS[courtData.p1]}</span>
            <span className="text-[#E38035] font-medium italic text-[160px] leading-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] transform -skew-x-12 z-0 select-none">/</span>
            <span className="text-6xl font-bold text-[#FFF6E5] font-mono text-center z-10 w-[60px]">{POINTS[courtData.p2]}</span>
          </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 45s linear infinite; }
      `}</style>
      {scale < 0.9 && <div className="absolute top-4 text-gray-500 text-xs font-mono">PREVIEW MODE</div>}
      <div style={{ transform: `scale(${scale})` }}>
        <div className="relative bg-[#E38035] rounded-[30px] shadow-2xl overflow-hidden" style={{ width: '1800px', height: '100px' }}>
          {data.motion?.active && data.motion?.src && (
             <div className="absolute inset-0 z-50 bg-black flex items-center justify-center overflow-hidden rounded-[30px]">
                <video src={data.motion.src} autoPlay loop muted className="w-full h-full object-cover" />
                {data.motion.showClock && (
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center px-10 border border-white/20">
                      <span className="text-6xl font-bold text-white font-mono tracking-widest">{time}</span>
                   </div>
                )}
             </div>
          )}
          {!data.motion?.active && (
             <>
                {data.template === "text" ? (
                   <>
                     <div className="absolute inset-0 flex items-center overflow-hidden">
                        <div className={`whitespace-nowrap text-[70px] font-bold text-black uppercase ${data.isAnimating ? 'animate-marquee' : ''}`}>{loopedText}</div>
                     </div>
                     {data.showClock && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"><div className="bg-[#0C0C0C] text-[#FFF6E5] rounded-xl px-8 py-2 shadow-2xl border-2 border-[#E38035]"><span className="text-5xl font-bold font-mono tracking-widest">{time}</span></div></div>}
                   </>
                ) : (
                   <>
                      <CourtDisplay side="left" courtData={data.left} template={data.template} currentTimer={displayTimers.left} />
                      {data.showClock && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-10 shadow-xl border border-gray-800"><span className="text-6xl font-bold text-[#FFF6E5] font-mono tracking-widest mt-1">{time}</span></div>}
                      <CourtDisplay side="right" courtData={data.right} template={data.template} currentTimer={displayTimers.right} />
                   </>
                )}
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
    template: "simple",
    runningText: "CHAMPIONS DE PADEL",
    isAnimating: true,
    showClock: true,
    logoSrc: null,
    motion: { src: null, active: false, showClock: true },
    left: { p1Name: "TEAM A", p2Name: "TEAM B", p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 },
    right: { p1Name: "TEAM C", p2Name: "TEAM D", p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 }
  });

  const [filterCourt, setFilterCourt] = useState(null);
  const [localTimers, setLocalTimers] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courtParam = params.get("court");
    if (courtParam === "left" || courtParam === "right") setFilterCourt(courtParam);

    const poll = setInterval(async () => {
        try {
            const res = await fetch('/api/score');
            const data = await res.json();
            setState(prev => ({...prev, ...data}));
        } catch(e) {}
    }, 1000);

    const timer = setInterval(() => {
      setLocalTimers({
        left: getSeconds(state.left.timerStored, state.left.timerStart),
        right: getSeconds(state.right.timerStored, state.right.timerStart)
      });
    }, 500);

    return () => { clearInterval(poll); clearInterval(timer); };
  }, [state.left.timerStart, state.left.timerStored, state.right.timerStart, state.right.timerStored]);

  const pushToServer = async (payload) => {
    try {
      await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) { console.error(e); }
  };

  const updateState = (updater, scope = null) => {
    setState(prev => {
      const next = updater(prev);
      let payload = next;
      if (scope === 'left') payload = { left: next.left };
      if (scope === 'right') payload = { right: next.right };
      if (scope === 'motion') payload = { motion: next.motion };
      pushToServer(payload);
      return next;
    });
  };

  const handleContinue = (courtSide) => {
    updateState(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const c = n[courtSide];
      if (c.winner === 1) c.p1Sets++; else if (c.winner === 2) c.p2Sets++;
      c.winner = null; c.p1 = 0; c.p2 = 0;
      return n;
    }, courtSide);
  };

  const handlePoint = (courtSide, player) => {
    updateState(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const c = n[courtSide];
      if (c.winner) return prev;
      const isP1 = player === 1;
      const myScore = isP1 ? c.p1 : c.p2;
      const oppScore = isP1 ? c.p2 : c.p1;
      if (myScore === 4) c.winner = player;
      else if (oppScore === 4) { if (isP1) c.p2 = 3; else c.p1 = 3; }
      else if (myScore === 3 && oppScore < 3) c.winner = player;
      else { if (isP1) c.p1++; else c.p2++; }
      return n;
    }, courtSide);
  };

  const toggleTimer = (courtSide) => {
    updateState(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const c = n[courtSide];
      if (c.timerStart) {
        c.timerStored += Math.floor((Date.now() - c.timerStart) / 1000);
        c.timerStart = null;
      } else { c.timerStart = Date.now(); }
      return n;
    }, courtSide);
  };

  const resetTimer = (courtSide) => {
    updateState(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n[courtSide].timerStart = null;
      n[courtSide].timerStored = 0;
      return n;
    }, courtSide);
  };

  const updateSet = (courtSide, player, delta) => {
    updateState(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      if (player === 1) n[courtSide].p1Sets = Math.max(0, n[courtSide].p1Sets + delta);
      else n[courtSide].p2Sets = Math.max(0, n[courtSide].p2Sets + delta);
      return n;
    }, courtSide);
  };

  const resetGame = (courtSide) => {
    updateState(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n[courtSide] = { ...n[courtSide], p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 };
      return n;
    }, courtSide);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans min-h-screen pb-20">

      {/* HEADER & GLOBAL SETTINGS (MASTER ONLY) */}
      {!filterCourt && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
               <h1 className="text-3xl font-bold text-[#E38035]">PADEL CONTROL</h1>
               <button onClick={() => updateState(s => ({...s, showClock: !s.showClock}))} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${state.showClock ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {state.showClock ? <Eye size={18}/> : <EyeOff size={18}/>}
                  CLOCK
               </button>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-black/50 p-1 rounded-xl">
               {[{id:'simple',icon:LayoutTemplate},{id:'timer',icon:Clock},{id:'full',icon:Trophy},{id:'text',icon:Type}].map(m => (
                 <button key={m.id} onClick={() => updateState(s=>({...s,template:m.id,motion:{...s.motion,active:false}}))}
                   className={`py-3 rounded-lg ${state.template===m.id && !state.motion.active ? 'bg-[#E38035] text-black' : 'text-gray-500 hover:text-white'}`}>
                   <m.icon size={20} className="mx-auto"/>
                 </button>
               ))}
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
             <div className="flex gap-4 items-center">
                <div className="flex-1 bg-black p-2 rounded border border-gray-700 flex items-center gap-2">
                   <ImageIcon size={16} className="text-[#E38035]"/>
                   <label className="text-xs text-gray-400 font-bold flex-1 cursor-pointer">LOGO<input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onloadend=()=>updateState(s=>({...s,logoSrc:r.result})); r.readAsDataURL(f); }}}/></label>
                </div>
                <div className="flex-1 bg-black p-2 rounded border border-gray-700 flex items-center gap-2">
                   <Video size={16} className="text-[#E38035]"/>
                   <label className="text-xs text-gray-400 font-bold flex-1 cursor-pointer">MOTION<input type="file" accept="video/*" className="hidden" onChange={(e)=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onloadend=()=>updateState(s=>({...s,motion:{...s.motion,src:r.result}}),'motion'); r.readAsDataURL(f); }}}/></label>
                </div>
             </div>
             {state.motion.src && (
               <div className="flex flex-col gap-2">
                  <button onClick={() => updateState(s => ({...s, motion: {...s.motion, active: !s.motion.active}}), 'motion')} className={`w-full py-2 rounded font-bold text-xs ${state.motion.active ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>{state.motion.active ? "STOP MOTION" : "PLAY MOTION"}</button>
                  <button onClick={() => updateState(s => ({...s, motion: {...s.motion, showClock: !s.motion.showClock}}), 'motion')} className={`w-full py-1 rounded border border-gray-600 text-xs text-gray-400 hover:text-white ${state.motion.showClock ? 'bg-blue-900/50' : ''}`}>SHOW CLOCK ON VIDEO: {state.motion.showClock ? "YES" : "NO"}</button>
               </div>
             )}
          </div>
        </div>
      )}

      {/* REMOTE HEADER (REMOTE ONLY) */}
      {filterCourt && (
        <div className="mb-6 bg-gray-900 p-4 rounded-xl border-l-4 border-[#E38035]">
           <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white uppercase">REMOTE: {filterCourt} COURT</h1>
              <button onClick={() => window.location.href="?view=control"} className="text-xs text-gray-400 hover:text-white underline">Back to Master</button>
           </div>

           {/* TEMPLATE SWITCHER FOR REMOTE (SIMPLE, TIMER, FULL ONLY) */}
           <div className="grid grid-cols-3 gap-2 mt-4 bg-black/50 p-1 rounded-lg">
             {[{id:'simple',icon:LayoutTemplate, label:'Score'},{id:'timer',icon:Clock, label:'Timer'},{id:'full',icon:Trophy, label:'Detail'}].map(m => (
               <button key={m.id} onClick={() => updateState(s=>({...s,template:m.id,motion:{...s.motion,active:false}}))}
                 className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${state.template===m.id && !state.motion.active ? 'bg-[#E38035] text-black' : 'text-gray-500 hover:text-white'}`}>
                 <m.icon size={18}/>
                 <span className="text-sm">{m.label}</span>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* MARQUEE INPUT (MASTER ONLY) */}
      {!filterCourt && state.template === "text" && !state.motion.active && (
        <div className="bg-gray-900 p-6 rounded-2xl mb-6 border border-gray-800">
           <input value={state.runningText} onChange={(e) => updateState(s => ({ ...s, runningText: e.target.value }))} className="w-full bg-black border border-gray-700 p-4 text-lg rounded-xl text-white font-mono mb-4 focus:border-[#E38035] outline-none" />
           <button onClick={() => updateState(s => ({ ...s, isAnimating: !s.isAnimating }))} className={`w-full py-3 rounded-xl font-bold ${state.isAnimating ? 'bg-red-600' : 'bg-green-600'} text-white`}>PAUSE/START SCROLL</button>
        </div>
      )}

      {/* COURTS GRID */}
      <div className={`grid grid-cols-1 ${!filterCourt ? 'lg:grid-cols-2' : ''} gap-8 ${state.template === 'text' || state.motion.active ? 'opacity-40 pointer-events-none grayscale' : ''}`}>

        {['left', 'right'].map((side) => {
           if (filterCourt && filterCourt !== side) return null;

           const court = state[side];
           const isBlue = side === 'left';
           const localTime = localTimers[side];

           return (
             <div key={side} className={`bg-gray-900 p-6 rounded-2xl border-t-4 ${isBlue ? 'border-blue-600' : 'border-green-600'} shadow-2xl flex flex-col gap-6`}>
               <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                 <h2 className="text-xl font-bold text-white uppercase">{side} COURT</h2>
                 <button onClick={() => resetGame(side)} className="text-xs bg-red-950/40 text-red-200 px-3 py-1.5 rounded hover:bg-red-900">FULL RESET</button>
               </div>

               {state.template !== 'timer' && (
                 <div className="grid grid-cols-2 gap-4">
                    <input value={court.p1Name} onChange={(e) => updateState(s => { const n = JSON.parse(JSON.stringify(s)); n[side].p1Name = e.target.value; return n; }, side)} className="bg-black border border-gray-700 p-2 rounded text-center text-sm font-bold text-white outline-none" placeholder="Team 1"/>
                    <input value={court.p2Name} onChange={(e) => updateState(s => { const n = JSON.parse(JSON.stringify(s)); n[side].p2Name = e.target.value; return n; }, side)} className="bg-black border border-gray-700 p-2 rounded text-center text-sm font-bold text-white outline-none" placeholder="Team 2"/>
                 </div>
               )}

               <div className="bg-black rounded-xl p-6 border border-gray-800 text-center min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
                  {state.template === 'timer' ? (
                     <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl font-mono font-bold text-white tracking-widest">{formatTimer(localTime)}</span>
                        <div className="flex gap-2 mt-2">
                           <button onClick={() => toggleTimer(side)} className={`p-2 rounded w-10 h-10 flex items-center justify-center ${court.timerStart ? 'bg-yellow-600 text-black' : 'bg-green-600 text-white'}`}>{court.timerStart ? <Pause size={18}/> : <Play size={18}/>}</button>
                           <button onClick={() => resetTimer(side)} className="p-2 rounded w-10 h-10 flex items-center justify-center bg-gray-800 text-red-400 hover:bg-gray-700"><RotateCcw size={18}/></button>
                        </div>
                     </div>
                  ) : (
                     <>
                        {court.winner ? (
                          <div className="absolute inset-0 z-10 bg-black/90 flex flex-col items-center justify-center gap-2">
                             <span className="text-4xl font-bold text-[#E38035] animate-pulse">WINNER!</span>
                             <button onClick={() => handleContinue(side)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all"><ArrowRight size={20}/> CONTINUE MATCH</button>
                          </div>
                        ) : null}
                        <span className="text-6xl font-mono text-white font-bold tracking-tight">{`${POINTS[court.p1]} - ${POINTS[court.p2]}`}</span>
                     </>
                  )}
               </div>

               {state.template !== 'timer' && (
                 <>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handlePoint(side, 1)} disabled={court.winner} className={`py-4 rounded-xl font-bold text-lg ${isBlue ? 'bg-blue-600' : 'bg-green-600'} text-white shadow-lg active:scale-95 transition-transform`}>{court.p1Name} +</button>
                      <button onClick={() => handlePoint(side, 2)} disabled={court.winner} className={`py-4 rounded-xl font-bold text-lg ${isBlue ? 'bg-blue-600' : 'bg-green-600'} text-white shadow-lg active:scale-95 transition-transform`}>{court.p2Name} +</button>
                   </div>
                   <div className="grid grid-cols-2 gap-4 bg-black/40 p-3 rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] text-gray-500 font-bold uppercase truncate pr-2">{court.p1Name}</span>
                         <div className="flex items-center gap-1">
                            <button onClick={() => updateSet(side, 1, -1)} className="w-6 h-6 rounded bg-gray-800 text-white hover:bg-gray-700 text-xs">-</button>
                            <span className="text-lg font-bold text-[#E38035] w-4 text-center">{court.p1Sets}</span>
                            <button onClick={() => updateSet(side, 1, 1)} className="w-6 h-6 rounded bg-gray-800 text-white hover:bg-gray-700 text-xs">+</button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between border-l border-gray-700 pl-3">
                         <span className="text-[10px] text-gray-500 font-bold uppercase truncate pr-2">{court.p2Name}</span>
                         <div className="flex items-center gap-1">
                            <button onClick={() => updateSet(side, 2, -1)} className="w-6 h-6 rounded bg-gray-800 text-white hover:bg-gray-700 text-xs">-</button>
                            <span className="text-lg font-bold text-[#E38035] w-4 text-center">{court.p2Sets}</span>
                            <button onClick={() => updateSet(side, 2, 1)} className="w-6 h-6 rounded bg-gray-800 text-white hover:bg-gray-700 text-xs">+</button>
                         </div>
                      </div>
                   </div>
                 </>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState("landing");
  const defaultData = { template: "simple", runningText: "", isAnimating: true, left: { p1:0, p2:0 }, right: { p1:0, p2:0 } };
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
        <h1 className="text-5xl font-extrabold text-[#E38035] mb-2 tracking-tight">PADEL SYSTEM v2.4</h1>
        <p className="text-gray-400 text-lg mb-8">LED Scoreboard & Controller</p>
      </div>

      {/* LANDING PAGE BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <button onClick={() => window.open("?view=board", "padel_board", "width=1800,height=100")} className="col-span-1 md:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-[#E38035] hover:bg-gray-800 transition-all shadow-2xl text-center">
             <span className="block text-2xl font-bold mb-2 text-white"><Monitor className="inline mr-2"/> Launch LED Board</span>
             <span className="block text-sm text-gray-400">For OBS / Display Screen</span>
        </button>

        <button onClick={() => setView("control")} className="col-span-1 md:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-blue-500 hover:bg-gray-800 transition-all shadow-2xl text-center">
             <span className="block text-2xl font-bold mb-2 text-white"><Settings2 className="inline mr-2"/> Full Master Controller</span>
             <span className="block text-sm text-gray-400">Control everything (Left + Right)</span>
        </button>

        <div className="col-span-1 md:col-span-2 flex gap-4">
            <button onClick={() => window.location.href="?view=control&court=left"} className="flex-1 bg-blue-950/40 p-6 rounded-2xl border border-blue-900/50 hover:bg-blue-900/40 hover:border-blue-500 transition-all text-center">
                <span className="block text-xl font-bold mb-1 text-blue-200"><Smartphone className="inline mr-2"/> Left Court Remote</span>
                <span className="block text-xs text-blue-400">For iPad A</span>
            </button>
            <button onClick={() => window.location.href="?view=control&court=right"} className="flex-1 bg-green-950/40 p-6 rounded-2xl border border-green-900/50 hover:bg-green-900/40 hover:border-green-500 transition-all text-center">
                <span className="block text-xl font-bold mb-1 text-green-200"><Smartphone className="inline mr-2"/> Right Court Remote</span>
                <span className="block text-xs text-green-400">For iPad B</span>
            </button>
        </div>
      </div>
    </div>
  );
}
