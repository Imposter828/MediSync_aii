import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symptomText } = body;

    if (!symptomText) {
      return NextResponse.json(
        { error: "Symptom text is required" },
        { status: 400 }
      );
    }

    const prompt = `
Based on the following patient symptoms, generate a structured medical note with:
1. List of symptoms identified
2. Possible diagnosis
3. Suggested treatment draft

Patient symptoms: ${symptomText}

Provide the output in this format:
SYMPTOMS: <list of symptoms>
POSSIBLE DIAGNOSIS: <possible conditions>
SUGGESTED TREATMENT: <treatment recommendations>
`;

    const result = await generateContent(prompt);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Notes generator error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
