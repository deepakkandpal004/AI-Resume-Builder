import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Check, Zap, Sparkles, Lock,
  BarChart2, Mail, MessageSquare, FileText, Infinity,
  ShieldCheck, Clock, Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../configs/api";
import { login } from "../app/features/authSlice";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Everything you need to get started.",
    cta: "Current plan",
    ctaDisabled: true,
    highlight: false,
    features: [
      { label: "Unlimited resumes",            included: true  },
      { label: "7 professional templates",     included: true  },
      { label: "PDF export",                   included: true  },
      { label: "AI summary enhancement",       included: true  },
      { label: "Public share link",            included: true  },
      { label: "1 ATS scan per day",           included: true  },
      { label: "3 cover letters per day",      included: true  },
      { label: "3 interview prep sets per day",included: true  },
      { label: "Unlimited ATS scans",          included: false },
      { label: "Unlimited cover letters",      included: false },
      { label: "Unlimited interview prep",     included: false },
      { label: "Priority AI processing",       included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹299",
    period: "one-time",
    description: "Lifetime access. Full power of the AI.",
    cta: "Upgrade now",
    ctaDisabled: false,
    highlight: true,
    features: [
      { label: "Everything in Free",           included: true  },
      { label: "Unlimited ATS scans",          included: true  },
      { label: "Unlimited cover letters",      included: true  },
      { label: "Unlimited interview prep",     included: true  },
      { label: "Priority AI processing",       included: true  },
      { label: "Early access to new features", included: true  },
    ],
  },
];

const COMPARISON = [
  { icon: FileText,      label: "Resumes",              free: "Unlimited",   premium: "Unlimited"  },
  { icon: FileText,      label: "Templates",             free: "7",           premium: "7"          },
  { icon: BarChart2,     label: "ATS scans",             free: "1 / day",     premium: "Unlimited"  },
  { icon: Mail,          label: "Cover letters",         free: "3 / day",     premium: "Unlimited"  },
  { icon: MessageSquare, label: "Interview prep sets",   free: "3 / day",     premium: "Unlimited"  },
  { icon: Zap,           label: "AI processing speed",   free: "Standard",    premium: "Priority"   },
  { icon: Sparkles,      label: "New features",          free: "Standard",    premium: "Early access"},
];

const PERKS = [
  { icon: ShieldCheck, text: "Lifetime access — pay once, use forever" },
  { icon: Infinity,    text: "No monthly fees or hidden charges" },
  { icon: Clock,       text: "Instant unlock after payment" },
  { icon: Star,        text: "All future AI features included" },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Upgrade = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const isPremium  = user?.subscriptionTier === "premium";

  const [loading, setLoading]       = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const { data: orderData } = await api.post(
        "/api/payments/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Resume Builder SaaS",
        description: "Premium Plan Lifetime Access",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
        },
        theme: {
          color: "#10b981",
        },
        handler: async function (response) {
          setLoading(true);
          try {
            const { data: verifyData } = await api.post(
              "/api/payments/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyData.success) {
              toast.success(verifyData.message || "Upgrade successful!");
              dispatch(
                login({
                  user: { ...user, subscriptionTier: "premium" },
                  token,
                })
              );
              navigate("/app");
            } else {
              toast.error(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to verify transaction.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment checkout was closed.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to initiate payment gateway.");
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg px-4 py-24 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30"
        >
          <Sparkles className="size-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-ink">You're on Premium</h1>
        <p className="mt-3 text-muted leading-relaxed max-w-sm mx-auto">
          You have lifetime access with unlimited AI tools, resume downloads, templates, and ATS scans. Enjoy the full power!
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {["Unlimited ATS", "Cover Letters", "Interview Prep", "Priority AI"].map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
              {tag}
            </span>
          ))}
        </div>
        <Link
          to="/app"
          className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <Link
        to="/app"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-emerald-600"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg"
        >
          <Zap className="size-4" /> Unlock full access
        </motion.div>
        <h1 className="text-4xl font-bold text-ink">Simple, honest pricing</h1>
        <p className="mt-3 text-muted max-w-md mx-auto">
          The free plan gets you far. Premium removes every limit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-16">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-3xl border p-8 transition-all duration-300 ${
              plan.highlight
                ? "border-emerald-400 shadow-2xl shadow-emerald-500/15 scale-[1.02] md:scale-105"
                : "border-line bg-surface"
            }`}
          >
            {plan.highlight && (
              <>
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1.5">
                  <Star className="size-3" /> Best Value
                </span>
              </>
            )}

            <div className="relative mb-6">
              <h2 className="text-xl font-bold text-ink">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-bold text-ink">{plan.price}</span>
                <span className="mb-1.5 text-sm text-muted">/{plan.period}</span>
              </div>
            </div>

            <ul className="relative mb-8 space-y-3">
              {plan.features.map((f) => (
                <motion.li
                  key={f.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                    f.included
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-line/30 text-muted"
                  }`}>
                    {f.included ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={f.included ? "text-ink" : "text-muted line-through"}>{f.label}</span>
                </motion.li>
              ))}
            </ul>

            <div className="relative">
              {plan.highlight ? (
                <div className="space-y-3">
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing…
                      </span>
                    ) : (
                      <>
                        <Zap className="size-4 transition-transform group-hover:scale-110" />
                        {plan.cta}
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-muted flex items-center justify-center gap-1">
                    <Lock className="size-3" /> Secure upgrade via Razorpay
                  </p>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl border border-line py-3.5 text-sm font-medium text-muted cursor-default"
                >
                  {plan.cta}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {PERKS.map((perk) => {
          const Icon = perk.icon;
          return (
            <div key={perk.text} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Icon className="size-4" />
              </span>
              <p className="text-xs text-body leading-relaxed">{perk.text}</p>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-line bg-surface overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-ink">Full feature comparison</h2>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hidden sm:inline-block">
            Premium unlocks all limits
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted">Feature</th>
                <th className="px-6 py-3 text-center font-medium text-muted">Free</th>
                <th className="px-6 py-3 text-center font-medium text-emerald-600">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMPARISON.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.label} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-3.5 flex items-center gap-2.5 text-ink">
                      <Icon className="size-4 text-muted shrink-0" />
                      {row.label}
                    </td>
                    <td className="px-6 py-3.5 text-center text-muted">{row.free}</td>
                    <td className="px-6 py-3.5 text-center font-semibold text-emerald-600">{row.premium}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <p className="mt-8 text-center text-xs text-muted">
        Prices shown in INR. Payments are secured and processed via Razorpay. Support is available for all local payment methods including UPI.
      </p>
    </div>
  );
};

export default Upgrade;
