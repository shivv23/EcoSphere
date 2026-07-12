"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Sliders,
  TrendingUp,
  Leaf,
  Users,
  Shield,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

function calculateESGScore(
  env: number,
  social: number,
  gov: number,
  envW: number,
  socialW: number,
  govW: number
) {
  return Math.round((env * envW + social * socialW + gov * govW) * 10) / 10;
}

interface SliderConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  gradient: string;
}

const sliderConfigs: SliderConfig[] = [
  {
    id: "envWeight",
    label: "Environmental Weight",
    icon: Leaf,
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "socialWeight",
    label: "Social Weight",
    icon: Users,
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
    color: "text-blue-600",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "govWeight",
    label: "Governance Weight",
    icon: Shield,
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
    color: "text-purple-600",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "emissionReduction",
    label: "Emission Reduction Target",
    icon: Leaf,
    min: 0,
    max: 50,
    step: 1,
    unit: "%",
    color: "text-teal-600",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    id: "csrParticipation",
    label: "CSR Participation Increase",
    icon: Users,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    color: "text-sky-600",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "auditImprovement",
    label: "Audit Score Improvement",
    icon: Shield,
    min: 0,
    max: 30,
    step: 1,
    unit: " pts",
    color: "text-violet-600",
    gradient: "from-violet-500 to-purple-600",
  },
];

export default function SimulatorPage() {
  const orgProfile = trpc.settings.getOrgProfile.useQuery();
  const departmentScores = trpc.department.listScores.useQuery();
  const departments = trpc.department.list.useQuery();

  const orgData = orgProfile.data?.organization;
  const currentEnvW = orgData?.envWeight ?? 0.4;
  const currentSocialW = orgData?.socialWeight ?? 0.3;
  const currentGovW = orgData?.govWeight ?? 0.3;

  const [sliders, setSliders] = useState({
    envWeight: 40,
    socialWeight: 30,
    govWeight: 30,
    emissionReduction: 10,
    csrParticipation: 20,
    auditImprovement: 5,
  });

  const [simulated, setSimulated] = useState(false);

  useEffect(() => {
    if (orgData) {
      setSliders((prev) => ({
        ...prev,
        envWeight: Math.round((orgData.envWeight || 0.4) * 100),
        socialWeight: Math.round((orgData.socialWeight || 0.3) * 100),
        govWeight: Math.round((orgData.govWeight || 0.3) * 100),
      }));
    }
  }, [orgData]);

  const updateSlider = useCallback(
    (id: string, value: number) => {
      setSliders((prev) => ({ ...prev, [id]: value }));
      setSimulated(false);
    },
    []
  );

  const { envWeightRaw, socialWeightRaw, govWeightRaw, envW, socialW, govW } =
    useMemo(() => {
      const total = sliders.envWeight + sliders.socialWeight + sliders.govWeight;
      return {
        envWeightRaw: sliders.envWeight,
        socialWeightRaw: sliders.socialWeight,
        govWeightRaw: sliders.govWeight,
        envW: total > 0 ? sliders.envWeight / total : 0.333,
        socialW: total > 0 ? sliders.socialWeight / total : 0.333,
        govW: total > 0 ? sliders.govWeight / total : 0.334,
      };
    }, [sliders.envWeight, sliders.socialWeight, sliders.govWeight]);

  const scores = useMemo(() => {
    if (!departmentScores.data) return [];
    return departmentScores.data as Array<{
      id: string;
      name: string;
      environmentalScore: number;
      socialScore: number;
      governanceScore: number;
      totalScore: number;
    }>;
  }, [departmentScores.data]);

  const avgScores = useMemo(() => {
    if (scores.length === 0) {
      return { env: 0, social: 0, gov: 0, total: 0 };
    }
    const env =
      scores.reduce((sum, s) => sum + (s.environmentalScore || 0), 0) /
      scores.length;
    const social =
      scores.reduce((sum, s) => sum + (s.socialScore || 0), 0) / scores.length;
    const gov =
      scores.reduce((sum, s) => sum + (s.governanceScore || 0), 0) /
      scores.length;
    const total =
      scores.reduce((sum, s) => sum + (s.totalScore || 0), 0) / scores.length;
    return {
      env: Math.round(env * 10) / 10,
      social: Math.round(social * 10) / 10,
      gov: Math.round(gov * 10) / 10,
      total: Math.round(total * 10) / 10,
    };
  }, [scores]);

  const currentTotal = useMemo(
    () =>
      calculateESGScore(
        avgScores.env,
        avgScores.social,
        avgScores.gov,
        currentEnvW,
        currentSocialW,
        currentGovW
      ),
    [avgScores, currentEnvW, currentSocialW, currentGovW]
  );

  const simulatedEnv = useMemo(
    () => Math.min(100, avgScores.env * (1 + sliders.emissionReduction / 100)),
    [avgScores.env, sliders.emissionReduction]
  );

  const simulatedSocial = useMemo(
    () =>
      Math.min(100, avgScores.social * (1 + sliders.csrParticipation / 100)),
    [avgScores.social, sliders.csrParticipation]
  );

  const simulatedGov = useMemo(
    () => Math.min(100, avgScores.gov + sliders.auditImprovement),
    [avgScores.gov, sliders.auditImprovement]
  );

  const projectedTotal = useMemo(
    () =>
      calculateESGScore(
        simulatedEnv,
        simulatedSocial,
        simulatedGov,
        envW,
        socialW,
        govW
      ),
    [simulatedEnv, simulatedSocial, simulatedGov, envW, socialW, govW]
  );

  const handleSimulate = useCallback(() => {
    setSimulated(true);
  }, []);

  const radarData = useMemo(
    () => [
      {
        subject: "Environmental",
        current: avgScores.env,
        simulated: Math.round(simulatedEnv * 10) / 10,
      },
      {
        subject: "Social",
        current: avgScores.social,
        simulated: Math.round(simulatedSocial * 10) / 10,
      },
      {
        subject: "Governance",
        current: avgScores.gov,
        simulated: Math.round(simulatedGov * 10) / 10,
      },
    ],
    [avgScores, simulatedEnv, simulatedSocial, simulatedGov]
  );

  const lineData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentBase = currentTotal;
    const projectedBase = projectedTotal;
    const delta = projectedBase - currentBase;

    return months.map((month, i) => {
      const progress = (i + 1) / 12;
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      return {
        month,
        current: Math.round((currentBase + (delta < 0 ? delta * easedProgress * 0.3 : 0)) * 10) / 10,
        projected: Math.round((currentBase + delta * easedProgress) * 10) / 10,
      };
    });
  }, [currentTotal, projectedTotal]);

  const delta = Math.round((projectedTotal - currentTotal) * 10) / 10;
  const deltaPositive = delta >= 0;

  const weightSliderConfigs = sliderConfigs.slice(0, 3);
  const paramSliderConfigs = sliderConfigs.slice(3);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Sliders className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ESG Score Simulator
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            What-if analysis for strategic ESG planning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Category Weights
              </h2>
              <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                Auto-normalized
              </span>
            </div>

            <div className="space-y-5">
              {weightSliderConfigs.map((config) => {
                const rawVal =
                  config.id === "envWeight"
                    ? envWeightRaw
                    : config.id === "socialWeight"
                    ? socialWeightRaw
                    : govWeightRaw;
                const normalizedVal =
                  config.id === "envWeight"
                    ? envW
                    : config.id === "socialWeight"
                    ? socialW
                    : govW;

                return (
                  <div key={config.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <config.icon className={cn("w-4 h-4", config.color)} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {rawVal}
                          {config.unit}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(normalizedVal * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 h-2 mt-3 rounded-full bg-gray-100 dark:bg-gray-700" />
                      <div
                        className={cn(
                          "absolute h-2 mt-3 rounded-full bg-gradient-to-r",
                          config.gradient
                        )}
                        style={{ width: `${(rawVal / config.max) * 100}%` }}
                      />
                      <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={rawVal}
                        onChange={(e) =>
                          updateSlider(config.id, Number(e.target.value))
                        }
                        className="relative w-full h-8 appearance-none bg-transparent cursor-pointer z-10
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-5
                          [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-white
                          [&::-webkit-slider-thumb]:border-2
                          [&::-webkit-slider-thumb]:border-gray-300
                          [&::-webkit-slider-thumb]:shadow-md
                          [&::-webkit-slider-thumb]:hover:border-emerald-500
                          [&::-webkit-slider-thumb]:transition-colors
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:w-5
                          [&::-moz-range-thumb]:h-5
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-white
                          [&::-moz-range-thumb]:border-2
                          [&::-moz-range-thumb]:border-gray-300
                          [&::-moz-range-thumb]:shadow-md
                          [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Improvement Levers
              </h2>
            </div>

            <div className="space-y-5">
              {paramSliderConfigs.map((config) => {
                const val =
                  config.id === "emissionReduction"
                    ? sliders.emissionReduction
                    : config.id === "csrParticipation"
                    ? sliders.csrParticipation
                    : sliders.auditImprovement;

                return (
                  <div key={config.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <config.icon className={cn("w-4 h-4", config.color)} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {config.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        +{val}
                        {config.unit}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 h-2 mt-3 rounded-full bg-gray-100 dark:bg-gray-700" />
                      <div
                        className={cn(
                          "absolute h-2 mt-3 rounded-full bg-gradient-to-r",
                          config.gradient
                        )}
                        style={{ width: `${(val / config.max) * 100}%` }}
                      />
                      <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={val}
                        onChange={(e) =>
                          updateSlider(config.id, Number(e.target.value))
                        }
                        className="relative w-full h-8 appearance-none bg-transparent cursor-pointer z-10
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-5
                          [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-white
                          [&::-webkit-slider-thumb]:border-2
                          [&::-webkit-slider-thumb]:border-gray-300
                          [&::-webkit-slider-thumb]:shadow-md
                          [&::-webkit-slider-thumb]:hover:border-emerald-500
                          [&::-webkit-slider-thumb]:transition-colors
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:w-5
                          [&::-moz-range-thumb]:h-5
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-white
                          [&::-moz-range-thumb]:border-2
                          [&::-moz-range-thumb]:border-gray-300
                          [&::-moz-range-thumb]:shadow-md
                          [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSimulate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <Target className="w-5 h-5" />
            Simulate Impact
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {simulated && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Score Projection
                </h2>
              </div>
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Current Score
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {currentTotal}
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Projected Score
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-extrabold",
                      deltaPositive ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {projectedTotal}
                  </p>
                </div>
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-bold",
                    deltaPositive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  )}
                >
                  {deltaPositive ? "+" : ""}
                  {delta}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                E/S/G Comparison
              </h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  {simulated && (
                    <Radar
                      name="Simulated"
                      dataKey="simulated"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "13px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current
                </span>
              </div>
              {simulated && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Simulated
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                12-Month Projection
              </h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "13px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="6 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-gray-400 border-dashed" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current Trajectory
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-emerald-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Projected Trajectory
                </span>
              </div>
            </div>
          </div>

          {simulated && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
                Simulation Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    Environmental
                  </p>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    {avgScores.env} →{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {Math.round(simulatedEnv * 10) / 10}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    Social
                  </p>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {avgScores.social} →{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {Math.round(simulatedSocial * 10) / 10}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                    Governance
                  </p>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                    {avgScores.gov} →{" "}
                    <span className="text-purple-600 dark:text-purple-400">
                      {Math.round(simulatedGov * 10) / 10}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
