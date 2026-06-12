"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "account" | "business" | "competitors" | "plan";

interface AccountData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface BusinessData {
  businessName: string;
  businessType: string;
  city: string;
  timezone: string;
}

interface CompetitorData {
  urls: string[];
}

interface PlanData {
  plan: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [account, setAccount] = useState<AccountData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [business, setBusiness] = useState<BusinessData>({
    businessName: "",
    businessType: "cafe",
    city: "",
    timezone: "UTC",
  });

  const [competitors, setCompetitors] = useState<CompetitorData>({
    urls: [""],
  });

  const [plan, setPlan] = useState<PlanData>({
    plan: "free",
  });

  const steps: { id: Step; label: string; number: number }[] = [
    { id: "account", label: "Account", number: 1 },
    { id: "business", label: "Business", number: 2 },
    { id: "competitors", label: "Competitors", number: 3 },
    { id: "plan", label: "Plan", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].id);
      setError("");
    }
  };

  const addCompetitorUrl = () => {
    setCompetitors({ urls: [...competitors.urls, ""] });
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitors.urls];
    newUrls[index] = value;
    setCompetitors({ urls: newUrls });
  };

  const removeCompetitorUrl = (index: number) => {
    if (competitors.urls.length > 1) {
      setCompetitors({ urls: competitors.urls.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: account.name,
          email: account.email,
          password: account.password,
          business: {
            name: business.businessName,
            type: business.businessType,
            city: business.city,
            timezone: business.timezone,
          },
          competitors: competitors.urls.filter((url) => url.trim() !== ""),
          plan: plan.plan,
        }),
      });

      if (!response.ok) {
        router.push("/auth/login");
        return;
      }

      const result = await signIn("credentials", {
        email: account.email,
        password: account.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f1a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 border-r border-slate-800">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>
              CafePromo AI
            </span>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "var(--font-montserrat)" }}>
            Set up your cafe in minutes
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Connect your menu, add competitors, and let our AI agents start working for your business today.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              ✓
            </div>
            <span className="text-slate-400">Free 14-day trial, no credit card</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              ✓
            </div>
            <span className="text-slate-400">Set up in under 5 minutes</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              ✓
            </div>
            <span className="text-slate-400">Cancel anytime, no questions asked</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 relative z-10 flex flex-col p-8 lg:p-12">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-white">CafePromo AI</span>
          </Link>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < currentStepIndex
                    ? "bg-emerald-500 text-white"
                    : i === currentStepIndex
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {i < currentStepIndex ? "✓" : s.number}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    i < currentStepIndex ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Step 1: Account */}
            {step === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                  <p className="text-slate-400">Enter your details to get started</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => setAccount({ ...account, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={account.email}
                      onChange={(e) => setAccount({ ...account, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={account.password}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      value={account.confirmPassword}
                      onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business */}
            {step === "business" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Your business</h2>
                  <p className="text-slate-400">Tell us about your cafe or restaurant</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={business.businessName}
                      onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="The Cozy Bean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Business Type</label>
                    <select
                      value={business.businessType}
                      onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="cafe">Cafe</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="bakery">Bakery</option>
                      <option value="bar">Bar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                    <input
                      type="text"
                      value={business.city}
                      onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="Seattle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone</label>
                    <select
                      value={business.timezone}
                      onChange={(e) => setBusiness({ ...business, timezone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Competitors */}
            {step === "competitors" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Competitor tracking</h2>
                  <p className="text-slate-400">Add competitor websites to monitor their prices and promotions</p>
                </div>

                <div className="space-y-3">
                  {competitors.urls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        placeholder="https://competitor-cafe.com"
                      />
                      {competitors.urls.length > 1 && (
                        <button
                          onClick={() => removeCompetitorUrl(index)}
                          className="px-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCompetitorUrl}
                  className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-indigo-400 font-medium hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all"
                >
                  + Add another competitor
                </button>

                <p className="text-xs text-slate-500">
                  You can skip this for now and add competitors later from your dashboard.
                </p>
              </div>
            )}

            {/* Step 4: Plan */}
            {step === "plan" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Choose your plan</h2>
                  <p className="text-slate-400">Start free, upgrade anytime</p>
                </div>

                <div className="space-y-3">
                  <PlanOption
                    name="Free"
                    price="$0"
                    period="forever"
                    features={["3 AI analyses/day", "1 competitor tracked", "Basic weather insights"]}
                    selected={plan.plan === "free"}
                    onSelect={() => setPlan({ plan: "free" })}
                  />
                  <PlanOption
                    name="Pro"
                    price="$29"
                    period="/month"
                    features={["Unlimited AI analyses", "10 competitors tracked", "Advanced analytics", "Priority support"]}
                    selected={plan.plan === "pro"}
                    onSelect={() => setPlan({ plan: "pro" })}
                    badge="Popular"
                  />
                  <PlanOption
                    name="Enterprise"
                    price="$99"
                    period="/month"
                    features={["Everything in Pro", "Unlimited competitors", "Custom AI models", "Dedicated support", "API access"]}
                    selected={plan.plan === "enterprise"}
                    onSelect={() => setPlan({ plan: "enterprise" })}
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex gap-4">
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800/50 hover:border-slate-600 transition-all"
                >
                  Back
                </button>
              )}
              {step === "plan" ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:from-indigo-400 hover:to-violet-400 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                >
                  Continue
                </button>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanOption({
  name,
  price,
  period,
  features,
  selected,
  onSelect,
  badge,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-xl border transition-all ${
        selected
          ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected ? "border-indigo-500 bg-indigo-500" : "border-slate-600"
            }`}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="font-semibold text-white">{name}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-white">{price}</span>
          <span className="text-sm text-slate-500">{period}</span>
        </div>
      </div>
      <div className="ml-8 space-y-1">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-emerald-400">✓</span>
            {feature}
          </div>
        ))}
      </div>
    </button>
  );
}
