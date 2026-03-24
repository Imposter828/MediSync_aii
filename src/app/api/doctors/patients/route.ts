import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const symptom = searchParams.get("symptom") || "";
    const duration = searchParams.get("duration");
    const frequency = searchParams.get("frequency");

    const patients = await prisma.patient.findMany({
      include: {
        user: true,
        medicalRecords: {
          include: {
            doctor: {
              include: { user: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        appointments: true,
      },
    });

    let filtered = patients;

    if (search) {
      filtered = filtered.filter((p) =>
        p.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (symptom) {
      filtered = filtered.filter((p) =>
        p.medicalRecords.some((r) =>
          r.symptom.toLowerCase().includes(symptom.toLowerCase())
        )
      );
    }

    if (duration) {
      const days = parseInt(duration);
      filtered = filtered.filter((p) =>
        p.medicalRecords.some((r) => r.duration > days)
      );
    }

    if (frequency) {
      const freq = parseInt(frequency);
      filtered = filtered.filter((p) => p.medicalRecords.length >= freq);
    }

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Patients error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
