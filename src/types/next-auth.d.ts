import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "DOCTOR" | "PATIENT";
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "DOCTOR" | "PATIENT";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "DOCTOR" | "PATIENT";
    id: string;
  }
}
