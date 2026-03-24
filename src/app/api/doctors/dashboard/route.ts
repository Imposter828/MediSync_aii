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

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      include: {
        appointments: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          include: {
            patient: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { date: "asc" },
        },
        medicalRecords: {
          include: {
            patient: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const allPatients = await prisma.patient.findMany({
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
      },
    });

    const todayAppointments = doctor.appointments.length;
    
    const patientCounts = await prisma.patient.count();
    
    const frequentPatients = allPatients
      .filter((p) => p.medicalRecords.length > 2)
      .slice(0, 5);

    const riskAlerts = allPatients
      .map((p) => {
        const symptomCounts: Record<string, number> = {};
        p.medicalRecords.forEach((r) => {
          const symptom = r.symptom.toLowerCase().split(" ")[0];
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
        const recurring = Object.entries(symptomCounts).find(([_, count]) => count >= 2);
        return recurring ? { patient: p, symptom: recurring[0], count: recurring[1] } : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    return NextResponse.json({
      doctor,
      stats: {
        todayAppointments,
        totalPatients: patientCounts,
        frequentPatients: frequentPatients.length,
        riskAlerts: riskAlerts.length,
      },
      recentAppointments: doctor.appointments,
      frequentPatients,
      riskAlerts,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
