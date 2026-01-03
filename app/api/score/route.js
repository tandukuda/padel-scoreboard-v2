import { NextResponse } from "next/server";

// This variable stores the score in the server's memory
// It works perfectly for Local LAN setups (npm run dev / npm start)
let gameData = {
  mode: "score",
  runningText: "CHAMPIONS DE PADEL",
  isAnimating: true,
  left: { p1: 0, p2: 0, winner: null },
  right: { p1: 0, p2: 0, winner: null },
};

export async function GET() {
  return NextResponse.json(gameData);
}

export async function POST(request) {
  const body = await request.json();
  gameData = body; // Update the memory
  return NextResponse.json({ success: true });
}
