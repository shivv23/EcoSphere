import Link from "next/link";
import { Leaf, BarChart3, Users, Shield, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Carbon Tracking", desc: "Real-time Scope 1, 2 & 3 emissions monitoring with trend analysis" },
  { icon: Users, title: "Social Impact", desc: "CSR activities, employee participation, and diversity metrics" },
  { icon: Shield, title: "Governance", desc: "Policy management, audit trails, and compliance monitoring" },
  { icon: Trophy, title: "Gamification", desc: "XP, badges, challenges, rewards, and leaderboards" },
];

const stats = [
  { value: "47", label: "Routes" },
  { value: "28", label: "tRPC Routers" },
  { value: "33", label: "Prisma Models" },
  { value: "20", label: "Premium Features" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">EcoSphere</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <CheckCircle2 className="w-4 h-4" />
          Enterprise-Grade ESG Management Platform
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
          Manage Your<br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">ESG Performance</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Track environmental impact, manage social initiatives, ensure governance compliance, and gamify sustainability — all in one platform.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="px-8 py-4 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/5 transition-all">
            Demo Login
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-emerald-400">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Built for Hackathon Excellence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8 text-center">
        <p className="text-sm text-slate-500">EcoSphere ESG Platform &middot; Built with Next.js 16, Prisma 5, MySQL, tRPC</p>
      </div>
    </div>
  );
}
