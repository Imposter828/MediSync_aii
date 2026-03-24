import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const doctor1 = await prisma.user.upsert({
    where: { email: "dr.smith@medisy.com" },
    update: {},
    create: {
      name: "Sarah Smith",
      email: "dr.smith@medisy.com",
      password: hashedPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "General Physician",
          experience: 10,
        },
      },
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: "dr.johnson@medisy.com" },
    update: {},
    create: {
      name: "Michael Johnson",
      email: "dr.johnson@medisy.com",
      password: hashedPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "Neurologist",
          experience: 15,
        },
      },
    },
  });

  const doctor3 = await prisma.user.upsert({
    where: { email: "dr.williams@medisy.com" },
    update: {},
    create: {
      name: "Emily Williams",
      email: "dr.williams@medisy.com",
      password: hashedPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "Cardiologist",
          experience: 12,
        },
      },
    },
  });

  const doctor4 = await prisma.user.upsert({
    where: { email: "dr.brown@medisy.com" },
    update: {},
    create: {
      name: "James Brown",
      email: "dr.brown@medisy.com",
      password: hashedPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "Dermatologist",
          experience: 8,
        },
      },
    },
  });

  const doctor5 = await prisma.user.upsert({
    where: { email: "dr.davis@medisy.com" },
    update: {},
    create: {
      name: "Lisa Davis",
      email: "dr.davis@medisy.com",
      password: hashedPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "Pediatrician",
          experience: 6,
        },
      },
    },
  });

  const patient1 = await prisma.user.upsert({
    where: { email: "john.doe@email.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@email.com",
      password: hashedPassword,
      role: "PATIENT",
      patient: {
        create: {
          age: 35,
          gender: "Male",
        },
      },
    },
  });

  const patient2 = await prisma.user.upsert({
    where: { email: "jane.wilson@email.com" },
    update: {},
    create: {
      name: "Jane Wilson",
      email: "jane.wilson@email.com",
      password: hashedPassword,
      role: "PATIENT",
      patient: {
        create: {
          age: 28,
          gender: "Female",
        },
      },
    },
  });

  const patient3 = await prisma.user.upsert({
    where: { email: "robert.garcia@email.com" },
    update: {},
    create: {
      name: "Robert Garcia",
      email: "robert.garcia@email.com",
      password: hashedPassword,
      role: "PATIENT",
      patient: {
        create: {
          age: 45,
          gender: "Male",
        },
      },
    },
  });

  const doctorRecords = await prisma.doctor.findMany();
  const patientRecords = await prisma.patient.findMany();

  if (patientRecords.length >= 2 && doctorRecords.length >= 1) {
    await prisma.medicalRecord.createMany({
      data: [
        {
          patientId: patientRecords[0].id,
          doctorId: doctorRecords[0].id,
          symptom: "Fever and body ache",
          duration: 3,
          diagnosis: "Viral infection",
          treatment: "Rest and fluids",
        },
        {
          patientId: patientRecords[0].id,
          doctorId: doctorRecords[0].id,
          symptom: "Headache",
          duration: 5,
          diagnosis: "Tension headache",
          treatment: "Pain relievers",
        },
        {
          patientId: patientRecords[1].id,
          doctorId: doctorRecords[0].id,
          symptom: "Cough and cold",
          duration: 7,
          diagnosis: "Upper respiratory infection",
          treatment: "Antibiotics",
        },
        {
          patientId: patientRecords[1].id,
          doctorId: doctorRecords[1].id,
          symptom: "Persistent headaches",
          duration: 20,
          diagnosis: "Migraine",
          treatment: "Lifestyle changes and medication",
        },
      ],
      skipDuplicates: true,
    });

    await prisma.appointment.createMany({
      data: [
        {
          patientId: patientRecords[0].id,
          doctorId: doctorRecords[0].id,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: "PENDING",
        },
        {
          patientId: patientRecords[1].id,
          doctorId: doctorRecords[0].id,
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          status: "APPROVED",
        },
        {
          patientId: patientRecords[0].id,
          doctorId: doctorRecords[1].id,
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: "PENDING",
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("Database seeded successfully!");
  console.log("\nTest Accounts:");
  console.log("Doctor: dr.smith@medisy.com / password123");
  console.log("Patient: john.doe@email.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
