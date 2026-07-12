"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import {
  Leaf,
  Building2,
  Users,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Plus,
  X,
  Loader2,
  Sparkles,
  TreePine,
  HandHeart,
  Scale,
} from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Manufacturing",
  "Finance",
  "Healthcare",
  "Energy",
  "Retail",
  "Real Estate",
  "Transportation",
  "Agriculture",
  "Other",
];

const DEPARTMENT_PRESETS = [
  { name: "Human Resources", code: "HR" },
  { name: "Operations", code: "OPS" },
  { name: "Finance", code: "FIN" },
  { name: "Marketing", code: "MKT" },
  { name: "Engineering", code: "ENG" },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                i < currentStep
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                  : i === currentStep
                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-200 scale-110"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < currentStep ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
            </div>
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`h-1 w-12 sm:w-20 mx-2 rounded-full transition-all duration-500 ${
                i < currentStep ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [departments, setDepartments] = useState<{ name: string; code: string }[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [envTarget, setEnvTarget] = useState("30");
  const [socialTarget, setSocialTarget] = useState("25");
  const [govTarget, setGovTarget] = useState("20");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const updateOrg = trpc.settings.updateOrg.useMutation();

  useEffect(() => {
    if (localStorage.getItem("ecosphere-onboarding-done") === "1") {
      setDone(true);
    }
  }, []);

  const addDepartment = () => {
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    if (departments.length >= 5) return;
    if (departments.some((d) => d.code.toUpperCase() === newDeptCode.trim().toUpperCase())) return;
    setDepartments([...departments, { name: newDeptName.trim(), code: newDeptCode.trim().toUpperCase() }]);
    setNewDeptName("");
    setNewDeptCode("");
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const addPreset = (preset: { name: string; code: string }) => {
    if (departments.length >= 5) return;
    if (departments.some((d) => d.code === preset.code)) return;
    setDepartments([...departments, preset]);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateOrg.mutateAsync({
        name: orgName || undefined,
        industry: industry || undefined,
        employeeCount: employeeCount ? parseInt(employeeCount) : undefined,
        envWeight: parseFloat(envTarget) / 100,
        socialWeight: parseFloat(socialTarget) / 100,
        govWeight: parseFloat(govTarget) / 100,
      });
      localStorage.setItem("ecosphere-onboarding-done", "1");
      setDone(true);
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center animate-[fadeInUp_0.5s_ease-out]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-200">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Setup Complete!</h1>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Your organization has been configured. Start tracking your ESG performance now.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all duration-300"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <StepIndicator currentStep={step} totalSteps={5} />

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl animate-[fadeInUp_0.4s_ease-out]">
          {step === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-2xl shadow-emerald-200">
                <Leaf className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">Welcome to EcoSphere</h1>
              <p className="mt-3 text-gray-500 max-w-md mx-auto leading-relaxed">
                Let&apos;s set up your ESG management platform in just a few steps.
                You&apos;ll configure your organization, departments, and sustainability goals.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <TreePine className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-2 text-sm font-semibold text-emerald-700">Environmental</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <HandHeart className="mx-auto h-8 w-8 text-blue-500" />
                  <p className="mt-2 text-sm font-semibold text-blue-700">Social</p>
                </div>
                <div className="rounded-2xl bg-violet-50 p-4">
                  <Scale className="mx-auto h-8 w-8 text-violet-500" />
                  <p className="mt-2 text-sm font-semibold text-violet-700">Governance</p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Organization Setup</h2>
                  <p className="text-sm text-gray-500">Tell us about your organization</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee Count</label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    placeholder="e.g. 500"
                    min="1"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Department Setup</h2>
                  <p className="text-sm text-gray-500">Add 3-5 departments for your organization</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Add</p>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENT_PRESETS.map((preset) => {
                    const added = departments.some((d) => d.code === preset.code);
                    return (
                      <button
                        key={preset.code}
                        onClick={() => addPreset(preset)}
                        disabled={added}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          added
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Department name"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
                <input
                  type="text"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="Code"
                  maxLength={5}
                  className="w-24 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all uppercase"
                />
                <button
                  onClick={addDepartment}
                  disabled={!newDeptName.trim() || !newDeptCode.trim() || departments.length >= 5}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {departments.length > 0 && (
                <div className="space-y-2">
                  {departments.map((dept, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                          {dept.code}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                      </div>
                      <button onClick={() => removeDepartment(i)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-gray-400">{departments.length}/5 departments added</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ESG Goals</h2>
                  <p className="text-sm text-gray-500">Set your sustainability priority weights</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-700">Environmental</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{envTarget}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={envTarget}
                    onChange={(e) => setEnvTarget(e.target.value)}
                    className="w-full h-2 bg-emerald-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HandHeart className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700">Social</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{socialTarget}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={socialTarget}
                    onChange={(e) => setSocialTarget(e.target.value)}
                    className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-violet-500" />
                      <span className="text-sm font-semibold text-gray-700">Governance</span>
                    </div>
                    <span className="text-sm font-bold text-violet-600">{govTarget}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={govTarget}
                    onChange={(e) => setGovTarget(e.target.value)}
                    className="w-full h-2 bg-violet-100 rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div className="rounded-xl bg-gray-50 p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className={`text-lg font-bold ${parseInt(envTarget) + parseInt(socialTarget) + parseInt(govTarget) === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                    {parseInt(envTarget) + parseInt(socialTarget) + parseInt(govTarget)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Review & Complete</h2>
                  <p className="text-sm text-gray-500">Review your setup before finishing</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{orgName || "Not specified"}</p>
                  <p className="text-xs text-gray-500">{industry || "No industry"} &bull; {employeeCount || "?"} employees</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments ({departments.length})</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {departments.length > 0 ? departments.map((d) => (
                      <span key={d.code} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {d.code} &mdash; {d.name}
                      </span>
                    )) : <span className="text-xs text-gray-400">No departments added</span>}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ESG Priority Weights</p>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div className="text-center rounded-lg bg-emerald-50 p-3">
                      <p className="text-lg font-bold text-emerald-600">{envTarget}%</p>
                      <p className="text-xs text-emerald-700">Environmental</p>
                    </div>
                    <div className="text-center rounded-lg bg-blue-50 p-3">
                      <p className="text-lg font-bold text-blue-600">{socialTarget}%</p>
                      <p className="text-xs text-blue-700">Social</p>
                    </div>
                    <div className="text-center rounded-lg bg-violet-50 p-3">
                      <p className="text-lg font-bold text-violet-600">{govTarget}%</p>
                      <p className="text-xs text-violet-700">Governance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 px-1">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {saving ? "Saving..." : "Complete Setup"}
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
