import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found for security (avoid email enumeration)
      return NextResponse.json({ message: "If an account exists, a reset link has been sent" }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    try {
      // @ts-ignore - The model will be available after the user runs prisma generate
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      
      // Send real email via Brevo
      await sendPasswordResetEmail(email, resetUrl);

      return NextResponse.json({ message: "Reset link sent" }, { status: 200 });
    } catch (dbError: any) {
      console.error("Database or Email error during reset request:", dbError);
      
      // Still show the link in console for development if Brevo or DB fails
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      console.log("Password Reset URL (Backup):", resetUrl);
      
      return NextResponse.json({ 
        message: "There was an error processing your request. Please try again later." 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
