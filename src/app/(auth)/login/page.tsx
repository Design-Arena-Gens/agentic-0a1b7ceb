"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ShieldCheck, Coffee, UtensilsCrossed } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/components/providers/auth-provider";

interface LoginForm {
  email: string;
  password: string;
}

const defaultValues: LoginForm = {
  email: "",
  password: "",
};

const credentials = [
  {
    role: "Employee",
    email: "jane@karmic.solutions",
    password: "Karmic@123",
  },
  {
    role: "Administrator",
    email: "admin@karmic.solutions",
    password: "Admin@123",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = useForm<LoginForm>({ defaultValues });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const data = await response.json();
        setError("email", { message: data.error ?? "Invalid credentials" });
        setErrorMessage(data.error ?? "Invalid credentials");
        return;
      }
      const data = await response.json();
      setUser(data.user);
      router.push(redirect);
    } catch {
      setErrorMessage("Unable to login at this time.");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-900/50 p-10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-emerald-300/70">
                  Karmic Solutions
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  Karmic Canteen Experience Platform
                </h1>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-300">
              Confirm meals, explore nutritional insights, and share feedback to help the
              culinary team reduce waste and craft mindful dining experiences.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {credentials.map((cred) => (
                <div
                  key={cred.role}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {cred.role} demo login
                  </p>
                  <p className="mt-2 font-medium text-white">{cred.email}</p>
                  <p className="font-mono text-emerald-300">{cred.password}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl bg-emerald-500/10 p-5 text-sm text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
              <p className="leading-relaxed">
                Secure single sign-on using Karmic Solutions employee credentials with
                encrypted session cookies and least-privilege roles.
              </p>
            </div>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 text-emerald-300">
              <Coffee className="h-5 w-5" />
              <p className="text-sm font-medium uppercase tracking-wide">
                Sign in to continue
              </p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Welcome back to mindful meals
            </h2>
            <form className="mt-8 space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="email">
                  Corporate Email
                </label>
                <input
                  {...register("email", { required: true })}
                  id="email"
                  type="email"
                  placeholder="you@karmic.solutions"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 transition focus:ring-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="password">
                  Password
                </label>
                <input
                  {...register("password", { required: true })}
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 transition focus:ring-2"
                />
              </div>
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                  "flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition",
                  isSubmitting ? "opacity-80" : "hover:from-emerald-400 hover:to-teal-400",
                )}
              >
                {isSubmitting ? "Authenticating..." : "Secure Login"}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
