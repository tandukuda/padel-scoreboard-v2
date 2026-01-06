import { NextResponse } from 'next/server';

// UPDATE THIS SECTION
let gameData = {
  template: "simple",
  runningText: "WELCOME TO PADEL CHAMPIONS ",
  isAnimating: true,
  showClock: true,
  logoSrc: null,

  // FIX: Set the default motion state here so the server knows about it immediately
  motion: {
    src: '/intro.mp4',  // <--- Point to your file in public
    active: true,       // <--- Start active
    showClock: true
  },

  left: { p1Name: "TEAM A", p2Name: "TEAM B", p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 },
  right: { p1Name: "TEAM C", p2Name: "TEAM D", p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 }
};

export async function GET() {
  return NextResponse.json(gameData);
}

export async function POST(request) {
  const body = await request.json();

  gameData = {
    ...gameData,
    ...body,
    left: body.left ? { ...gameData.left, ...body.left } : gameData.left,
    right: body.right ? { ...gameData.right, ...body.right } : gameData.right,
    motion: body.motion ? { ...gameData.motion, ...body.motion } : gameData.motion,
  };

  return NextResponse.json({ success: true });
}
