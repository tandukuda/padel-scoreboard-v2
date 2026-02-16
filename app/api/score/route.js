import { NextResponse } from "next/server";

let gameData = {
  viewMode: "score",
  runningText: "WELCOME TO CHAMPS DE PADEL ",
  isAnimating: true,
  showClock: true, // This now controls the Main Scoreboard Clock

  motion: {
    src: "/intro.mp4",
    active: true,
    asBackground: false,
    showClock: true, // This controls the Video Overlay Clock
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
    motion: body.motion
      ? { ...gameData.motion, ...body.motion }
      : gameData.motion,
  };

  return NextResponse.json({ success: true });
}
