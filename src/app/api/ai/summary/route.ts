import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth";
import prisma from "@/lib/prisma";
import { generateContent } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (records.length === 0) {
      return NextResponse.json({ summary: "No medical records found for this patient." });
    }

    const recordsText = records
      .map(
        (r, i) =>
          `${i + 1}. Date: ${new Date(r.createdAt).toLocaleDateString()}, Symptoms: ${r.symptom}, Duration: ${r.duration} days, Diagnosis: ${r.diagnosis || "N/A"}, Treatment: ${r.treatment || "N/A"}`
      )
      .join("\n");

    const prompt = `
Analyze the following medical records and provide a patient summary:
- Any recurring symptoms or conditions
- Visit frequency
- Overall health insights

Medical Records:
${recordsText}

Provide a concise summary highlighting key patterns and insights.
`;

    const summary = await generateContent(prompt);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary generator error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
