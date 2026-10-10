import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : null;
  const email = typeof sp.email === "string" ? sp.email : null;
  return <ForgotForm token={token} email={email} />;
}
