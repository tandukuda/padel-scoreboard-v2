import { NextResponse } from 'next/server';

let gameData = {
  template: "simple",
  runningText: "WELCOME TO PADEL CHAMPIONS",
  isAnimating: true,
  showClock: true,
  logoSrc: null,
  motion: { src: null, active: false, showClock: true },
  left: { p1Name: "TEAM A", p2Name: "TEAM B", p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 },
  right: { p1Name: "TEAM C", p2Name: "TEAM D", p1Sets: 0, p2Sets: 0, p1: 0, p2: 0, winner: null, timerStart: null, timerStored: 0 }
};

export async function GET() {
  return NextResponse.json(gameData);
}

export async function POST(request) {
  const body = await request.json();

  // MERGE LOGIC: Instead of replacing gameData, we merge the new fields into it.
  // This allows "Partial Updates" (e.g. sending only { left: ... })
  gameData = {
    ...gameData,
    ...body,
    // Deep merge for nested objects if provided in body
    left: body.left ? { ...gameData.left, ...body.left } : gameData.left,
    right: body.right ? { ...gameData.right, ...body.right } : gameData.right,
    motion: body.motion ? { ...gameData.motion, ...body.motion } : gameData.motion,
  };

  return NextResponse.json({ success: true });
}
