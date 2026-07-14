import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-tva-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white rounded-24 shadow-lg border border-tva-border overflow-hidden">
          {/* Top band */}
          <div className="h-1.5 bg-tva-red" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/TechVaults-Logo-b2.png"
                alt="TechVaults"
                width={160}
                height={44}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-semibold text-tva-ink mb-1">Welcome back</h1>
            <p className="text-sm text-tva-ink-m mb-6">Sign in to TechVaults Project Manager</p>

            <LoginForm />

            <p className="mt-6 text-center text-xs text-tva-ink-m">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-tva-red font-semibold hover:underline">
                Request access
              </a>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-tva-ink-m">
          © {new Date().getFullYear()} TechVaults Limited · Internal use only
        </p>
      </div>
    </div>
  );
}
