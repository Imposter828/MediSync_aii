export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "MediSync AI";

  if (!apiKey || !senderEmail) {
    console.error("Missing Brevo configuration (BREVO_API_KEY or BREVO_SENDER_EMAIL)");
    throw new Error("Email service is not configured correctly.");
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email }],
    subject: "Reset Your Password - MediSync AI",
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2563eb; text-align: center;">MediSync AI</h2>
            <p>Hello,</p>
            <p>You requested to reset your password for your MediSync AI account. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #999;">If you didn't request this password reset, you can safely ignore this email. This link will expire in 1 hour.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      throw new Error("Failed to send email.");
    }

    const data = await response.json();
    console.log("Email sent successfully via Brevo:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    throw error;
  }
}
