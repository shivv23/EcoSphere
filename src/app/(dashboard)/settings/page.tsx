"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Settings, Save, Loader2, Building2, Bell, Calculator, Shield, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: settingsData, isLoading } = trpc.settings.get.useQuery();
  const updateSetting = trpc.settings.update.useMutation({
    onSuccess: () => toast.success("Setting saved"),
    onError: (err) => toast.error(err.message),
  });
  const updateOrg = trpc.settings.updateOrg.useMutation({
    onSuccess: () => toast.success("Organization profile saved"),
    onError: (err) => toast.error(err.message),
  });

  const [autoEmission, setAutoEmission] = useState(false);
  const [evidenceRequired, setEvidenceRequired] = useState(false);
  const [badgeAutoAward, setBadgeAutoAward] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [envWeight, setEnvWeight] = useState("40");
  const [socialWeight, setSocialWeight] = useState("30");
  const [govWeight, setGovWeight] = useState("30");

  const handleSaveOrg = () => {
    updateOrg.mutate({
      name: orgName || undefined,
      industry: industry || undefined,
      envWeight: parseInt(envWeight) / 100,
      socialWeight: parseInt(socialWeight) / 100,
      govWeight: parseInt(govWeight) / 100,
    });
  };

  const handleToggle = async (key: string, value: boolean) => {
    await updateSetting.mutateAsync({ key, value: String(value) });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-gray-500 mt-1">Platform configuration and preferences</p></div>

      {/* Organization Profile */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
          <div><h3 className="font-semibold text-gray-900">Organization Profile</h3><p className="text-xs text-gray-500">Configure your organization details</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-700 mb-1">Organization Name</label><input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder={settingsData?.organization?.name || "EcoCorp"} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Industry</label><input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder={settingsData?.organization?.industry || "Technology"} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" /></div>
        </div>
      </div>

      {/* ESG Score Weights */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Calculator className="w-5 h-5 text-white" /></div>
          <div><h3 className="font-semibold text-gray-900">ESG Score Weights</h3><p className="text-xs text-gray-500">Configure scoring percentages (must equal 100%)</p></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm text-gray-700 mb-1">Environmental %</label><input type="number" min="0" max="100" value={envWeight} onChange={e => setEnvWeight(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Social %</label><input type="number" min="0" max="100" value={socialWeight} onChange={e => setSocialWeight(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Governance %</label><input type="number" min="0" max="100" value={govWeight} onChange={e => setGovWeight(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" /></div>
        </div>
        <div className="mt-2 text-xs text-gray-400">Total: {parseInt(envWeight || "0") + parseInt(socialWeight || "0") + parseInt(govWeight || "0")}%</div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Bell className="w-5 h-5 text-white" /></div>
          <div><h3 className="font-semibold text-gray-900">Feature Toggles</h3><p className="text-xs text-gray-500">Enable or disable platform features</p></div>
        </div>
        <div className="space-y-4">
          {[
            { label: "Auto Emission Calculation", desc: "Automatically calculate carbon emissions from ERP records", value: autoEmission, onChange: setAutoEmission, key: "auto_emission_calculation" },
            { label: "Evidence Requirement", desc: "Require proof file for CSR activity approval", value: evidenceRequired, onChange: setEvidenceRequired, key: "evidence_required" },
            { label: "Badge Auto-Award", desc: "Automatically award badges when unlock rules are met", value: badgeAutoAward, onChange: setBadgeAutoAward, key: "badge_auto_award" },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div><p className="font-medium text-gray-900 text-sm">{toggle.label}</p><p className="text-xs text-gray-500">{toggle.desc}</p></div>
              <button onClick={() => { toggle.onChange(!toggle.value); handleToggle(toggle.key, !toggle.value); }} className={`relative w-12 h-6 rounded-full transition-colors ${toggle.value ? "bg-emerald-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${toggle.value ? "translate-x-6" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSaveOrg} disabled={updateOrg.isPending} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/25">
        {updateOrg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Settings
      </button>
    </div>
  );
}
