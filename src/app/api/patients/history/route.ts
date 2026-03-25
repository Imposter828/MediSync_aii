import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createRecordSchema = z.object({
  symptom: z.string().min(1),
  duration: z.number().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = createRecordSchema.parse(body);

    // For patient-created records, we might not have a doctor yet
    // Let's assign it to a default doctor or create a placeholder
    // For now, let's get the first available doctor
    const defaultDoctor = await prisma.doctor.findFirst();
    if (!defaultDoctor) {
      return NextResponse.json({ error: "No doctors available" }, { status: 400 });
    }

    const newRecord = await prisma.medicalRecord.create({
      data: {
        ...validatedData,
        patientId: patient.id,
        doctorId: defaultDoctor.id,
      },
      include: {
        doctor: { include: { user: true } },
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Create record error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
