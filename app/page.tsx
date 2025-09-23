import { OptimizedLandingPage } from "@/components/landing/OptimizedLandingPage";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return <OptimizedLandingPage />;
}
