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

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      include: {
        appointments: {
          include: {
            doctor: { include: { user: true } },
          },
          orderBy: { date: "desc" },
        },
        medicalRecords: {
          include: {
            doctor: { include: { user: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const upcomingAppointments = patient.appointments.filter(
      (a) => a.date > new Date() && a.status === "APPROVED"
    );
    const pastAppointments = patient.appointments.filter(
      (a) => a.date <= new Date() || a.status === "CANCELLED"
    );

    const symptomCounts: Record<string, number> = {};
    patient.medicalRecords.forEach((r) => {
      const symptom = r.symptom.toLowerCase();
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });

    const recurringIssues = Object.entries(symptomCounts)
      .filter(([_, count]) => count >= 2)
      .map(([symptom, count]) => ({ symptom, count }));

    const thisMonthRecords = patient.medicalRecords.filter(
      (r) => {
        const recordDate = new Date(r.createdAt);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() && 
               recordDate.getFullYear() === now.getFullYear();
      }
    );

    return NextResponse.json({
      patient,
      upcomingAppointments,
      pastAppointments,
      stats: {
        totalVisits: patient.medicalRecords.length,
        thisMonthVisits: thisMonthRecords.length,
        recurringIssues: recurringIssues.length,
      },
      healthInsights: {
        recurringIssues,
        thisMonthRecords: thisMonthRecords.length,
      },
    });
  } catch (error) {
    console.error("Patient dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
