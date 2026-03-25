import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const doctorSchema = z.object({
  specialization: z.string().optional(),
  experience: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization");
    const experience = searchParams.get("experience");

    const where: any = {};

    if (specialization) {
      where.specialization = specialization;
    }

    if (experience) {
      where.experience = { gte: parseInt(experience) };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: true,
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Doctors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
