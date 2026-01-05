import { NextResponse } from "next/server";

let gameData = {
  template: "simple",
  runningText: "WELCOME TO PADEL CHAMPIONS",
  isAnimating: true,

  // New Feature: Global Clock Toggle
  showClock: true,
  logoSrc: null,

  motion: {
    src: null,
    active: false,
    showClock: false,
  },

  left: {
    p1Name: "TEAM A",
    p2Name: "TEAM B",
    p1Sets: 0,
    p2Sets: 0,
    p1: 0,
    p2: 0,
    winner: null,
    timerStart: null,
    timerStored: 0,
  },

  right: {
    p1Name: "TEAM C",
    p2Name: "TEAM D",
    p1Sets: 0,
    p2Sets: 0,
    p1: 0,
    p2: 0,
    winner: null,
    timerStart: null,
    timerStored: 0,
  },
};

export async function GET() {
  return NextResponse.json(gameData);
}

export async function POST(request) {
  const body = await request.json();
  gameData = body;
  return NextResponse.json({ success: true });
}
