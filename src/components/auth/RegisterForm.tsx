"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Briefcase } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", jobTitle: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Registration failed"); return; }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Full name" placeholder="Kudirat Taiwo" value={form.name} onChange={set("name")} leftIcon={<User size={14} />} required />
      <Input label="Email address" type="email" placeholder="you@techvaults.com" value={form.email} onChange={set("email")} leftIcon={<Mail size={14} />} required />
      <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} leftIcon={<Lock size={14} />} minLength={8} required />
      <Input label="Job title" placeholder="Product Manager" value={form.jobTitle} onChange={set("jobTitle")} leftIcon={<Briefcase size={14} />} />
      <Button type="submit" loading={loading} className="w-full justify-center py-2.5 mt-1">
        Create account
      </Button>
    </form>
  );
}
