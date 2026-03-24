"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const goals = [
  "Get into IIT/NIT",
  "MBBS Admission",
  "MBA from Top IIM",
  "Study Abroad",
  "Government Job",
  "Other",
];

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 hero-grid opacity-20" />
      <div className="absolute top-20 right-20 h-64 w-64 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/images/mayra-logo.png"
              alt="Mayra logo"
              width={200}
              height={62}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s <= step ? "bg-primary-600" : "bg-gray-100"
                }`}
              />
            ))}
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-1">Create Account</h1>
              <p className="text-gray-500 text-sm mb-6">Join 10 lakh+ students on Mayra</p>

              {/* Google */}
              <button suppressHydrationWarning className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors mb-5">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Sign up with Google</span>
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Kumar" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@example.com" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" className="pl-10 pr-10" required minLength={8} />
                    <button suppressHydrationWarning type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" variant="gradient" size="lg" className="w-full gap-2 mt-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-1">What&apos;s your goal?</h1>
              <p className="text-gray-500 text-sm mb-6">We&apos;ll personalize your experience</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {goals.map((goal) => (
                  <button suppressHydrationWarning
                    key={goal}
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      selectedGoal === goal
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-100 text-gray-700 hover:border-primary-200"
                    }`}
                  >
                    {selectedGoal === goal && <Check className="h-4 w-4 text-primary-600 mb-1" />}
                    {goal}
                  </button>
                ))}
              </div>
              <Button
                variant="gradient"
                size="lg"
                className="w-full gap-2"
                disabled={!selectedGoal || loading}
                onClick={handleSubmit}
              >
                {loading ? "Creating account..." : "Create My Account"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-gray-400 text-center mt-3">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-primary-600">Terms of Service</Link>
              </p>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
