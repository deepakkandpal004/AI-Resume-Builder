import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Check, X, Zap, Sparkles, Lock,
  BarChart2, Mail, MessageSquare, FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../configs/api";
import { login } from "../app/features/authSlice";

// ── Plan data ─────────────────────────────────────────────────────────────

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

// ── Feature comparison rows ───────────────────────────────────────────────

const COMPARISON = [
  { icon: FileText,      label: "Resumes",              free: "Unlimited",   premium: "Unlimited"  },
  { icon: FileText,      label: "Templates",             free: "7",           premium: "7"          },
  { icon: BarChart2,     label: "ATS scans",             free: "1 / day",     premium: "Unlimited"  },
  { icon: Mail,          label: "Cover letters",         free: "3 / day",     premium: "Unlimited"  },
  { icon: MessageSquare, label: "Interview prep sets",   free: "3 / day",     premium: "Unlimited"  },
  { icon: Zap,           label: "AI processing speed",   free: "Standard",    premium: "Priority"   },
  { icon: Sparkles,      label: "New features",          free: "Standard",    premium: "Early access"},
];

// ─────────────────────────────────────────────────────────────────────────

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
      // Step 1: Load Razorpay standard script overlay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step 2: Request order ID creation from the backend
      const { data: orderData } = await api.post(
        "/api/payments/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 3: Open Razorpay Standard Checkout overlay modal
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
          color: "#7c3aed", // Brand Violet Color
        },
        handler: async function (response) {
          // Step 4: Verify payment server-side
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
              // Update user state in auth reducer
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

  // Already premium — show nice status and links back to builder/dashboard
  if (isPremium) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
        <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 mb-2 shadow-lg shadow-brand-500/20">
          <Sparkles className="size-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-ink">You are on Premium</h1>
        <p className="text-sm text-muted leading-relaxed">
          Thank you for your upgrade! You have active **Lifetime Access** with unlimited AI tools, resume downloads, templates, and resume analyzers.
        </p>
        
        <div className="flex flex-col gap-3 pt-4">
          <Link
            to="/app"
            className="btn-brand flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold shadow-md cursor-pointer"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">

      {/* Back link */}
      <Link
        to="/app"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand-600"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-1.5 text-sm font-semibold text-white">
          <Sparkles className="size-4" /> Unlock full access
        </div>
        <h1 className="text-4xl font-bold text-ink">Simple, honest pricing</h1>
        <p className="mt-3 text-muted max-w-md mx-auto">
          The free plan gets you far. Premium removes every limit.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-8 transition-shadow ${
              plan.highlight
                ? "border-brand-400 shadow-xl shadow-brand-500/10 dark:shadow-brand-500/5"
                : "border-line bg-surface"
            }`}
          >
            {plan.highlight && (
              <>
                {/* Gradient background for premium card */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 -z-10" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                  Lifetime Value
                </span>
              </>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-ink">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold text-ink">{plan.price}</span>
                <span className="mb-1 text-sm text-muted">/{plan.period}</span>
              </div>
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  {f.included
                    ? <Check className="size-4 shrink-0 text-accent-600" />
                    : <X className="size-4 shrink-0 text-muted" />}
                  <span className={f.included ? "text-ink" : "text-muted line-through"}>{f.label}</span>
                </li>
              ))}
            </ul>

            {plan.highlight ? (
              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:from-brand-500 hover:to-accent-500 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Contacting Razorpay…
                    </span>
                  ) : (
                    <>
                      <Zap className="size-4 animate-bounce" />
                      {plan.cta}
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-muted flex items-center justify-center gap-1">
                  <Lock className="size-3" /> Secure upgrade · Instant lifetime unlock
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
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-line">
          <h2 className="font-semibold text-ink">Full feature comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted">Feature</th>
                <th className="px-6 py-3 text-center font-medium text-muted">Free</th>
                <th className="px-6 py-3 text-center font-medium text-brand-600">Premium</th>
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
                    <td className="px-6 py-3.5 text-center font-semibold text-brand-600">{row.premium}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-muted">
        Prices shown in INR. Payments are secured and processed via Razorpay. Support is available for all local payment methods including UPI.
      </p>
    </div>
  );
};

export default Upgrade;
