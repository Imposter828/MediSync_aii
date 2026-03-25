import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateRecordSchema = z.object({
  symptom: z.string().min(1),
  duration: z.number().min(1),
  diagnosis: z.string().nullable().optional(),
  treatment: z.string().nullable().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateRecordSchema.parse(body);

    // Check if the record belongs to the patient
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
    });

    if (!existingRecord || existingRecord.patientId !== patient.id) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        doctor: { include: { user: true } },
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Update record error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if the record belongs to the patient
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
    });

    if (!existingRecord || existingRecord.patientId !== patient.id) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.medicalRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete record error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}