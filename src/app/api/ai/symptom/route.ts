import { NextResponse } from "next/server";
import { suggestDoctorType } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symptom, duration } = body;

    if (!symptom || !duration) {
      return NextResponse.json(
        { error: "Symptom and duration are required" },
        { status: 400 }
      );
    }

    const result = suggestDoctorType(symptom, duration);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Symptom suggestion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
