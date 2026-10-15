import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RegisterForm from "@/components/auth/RegisterForm";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-tva-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white rounded-24 shadow-lg border border-tva-border overflow-hidden">
          <div className="h-1.5 bg-tva-red" />
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <Link href="/" aria-label="TechVaults home">
              <Image src="/TechVaults-Logo-b2.png" alt="TechVaults" width={160} height={44} className="object-contain" priority />
              </Link>
            </div>
            <h1 className="text-2xl font-semibold text-tva-ink mb-1">Create account</h1>
            <p className="text-sm text-tva-ink-m mb-6">Join TechVaults Project Manager</p>
            <RegisterForm />
            <p className="mt-6 text-center text-xs text-tva-ink-m">
              Already have an account?{" "}
              <Link href="/login" className="text-tva-red font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
