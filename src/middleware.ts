export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*"],
};