"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password");
        setErrors({ password: "Invalid credentials" });
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email address"
        type="email"
        placeholder="you@techvaults.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        leftIcon={<Mail size={14} />}
        autoComplete="email"
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          leftIcon={<Lock size={14} />}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-8 text-tva-ink-m hover:text-tva-ink transition-colors"
          aria-label={showPw ? "Hide password" : "Show password"}
        >
          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <div className="flex justify-end">
        <button type="button" className="text-xs text-tva-red hover:underline font-medium">
          Forgot password?
        </button>
      </div>

      <Button type="submit" loading={loading} className="w-full justify-center py-2.5 mt-1">
        Sign in
      </Button>

      {/* Dev hint */}
      <p className="text-center text-[11px] text-tva-ink-m bg-tva-surface rounded-8 px-3 py-2">
        Demo: <strong>kudirat@techvaults.com</strong> / <strong>password123</strong>
      </p>
    </form>
  );
}
