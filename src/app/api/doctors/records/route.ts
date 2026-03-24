import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const recordSchema = z.object({
  patientId: z.string(),
  symptom: z.string().min(1, "Symptom is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
});

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
    const patientId = searchParams.get("patientId");

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const where = patientId
      ? { doctorId: doctor.id, patientId }
      : { doctorId: doctor.id };

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const data = recordSchema.parse(body);

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: doctor.id,
        symptom: data.symptom,
        duration: data.duration,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    return NextResponse.json(record);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create record error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
