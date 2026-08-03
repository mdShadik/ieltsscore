"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Settings2, Check, Wallet } from "lucide-react";
import Header from "@/components/Header";
import { AI_PROVIDERS } from "@/constant/providers";
import { PROVIDER_MODELS, getDefaultModel, getModelLabel } from "@/constant/models";
import {
  getModelForProvider,
  setModelForProvider,
  resetAllModelPreferences,
} from "@/lib/client/modelPreferences";
import { getUseMinBalance, setUseMinBalance } from "@/lib/client/managerSettings";

export default function ProfilePage() {
  const [preferences, setPreferences] = useState({});
  const [savedProvider, setSavedProvider] = useState(null);
  const [useMinBalance, setUseMinBalanceState] = useState(false);

  const loadPreferences = () => {
    const next = {};
    for (const id of Object.keys(PROVIDER_MODELS)) {
      next[id] = getModelForProvider(id);
    }
    setPreferences(next);
    setUseMinBalanceState(getUseMinBalance());
  };

  useEffect(() => {
    loadPreferences();

    const handleChange = () => loadPreferences();
    window.addEventListener("ieltsscore:model-preferences-changed", handleChange);
    window.addEventListener("ieltsscore:manager-settings-changed", handleChange);
    return () => {
      window.removeEventListener("ieltsscore:model-preferences-changed", handleChange);
      window.removeEventListener("ieltsscore:manager-settings-changed", handleChange);
    };
  }, []);

  const handleSelectModel = (providerId, modelId) => {
    setModelForProvider(providerId, modelId);
    setSavedProvider(providerId);
    loadPreferences();
    setTimeout(() => setSavedProvider(null), 1500);
  };

  const handleToggleMinBalance = () => {
    const newValue = !useMinBalance;
    setUseMinBalance(newValue);
    setUseMinBalanceState(newValue);
  };

  const handleResetAll = () => {
    if (!confirm("Reset all models to defaults?")) return;
    resetAllModelPreferences();
    loadPreferences();
  };

  const providers = Object.values(AI_PROVIDERS).filter((p) => PROVIDER_MODELS[p.id]);

  return (
    <div className="min-h-screen bg-[#101010] text-gray-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Settings2 className="w-3.5 h-3.5" />
              User Settings
            </div>
            <h1 className="text-3xl font-black text-white">Profile</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your AI model configurations and personal finance manager preferences.
            </p>
          </div>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white border border-[#333] bg-[#141414] px-3 py-2 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>
        </div>

        {/* Manager Settings Section */}
        <section className="rounded-2xl border border-indigo-500/30 bg-[#141414] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Personal Finance Manager</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure account balance visibility and minimum reserve behavior
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#222] pt-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-sm font-semibold text-white block">
                Use Minimum Balance Account
              </span>
              <p className="text-xs text-gray-400 mt-0.5 max-w-lg">
                When enabled, minimum monthly balance reserves are included in your usable balance and available for spending. When disabled, minimum monthly balance amounts are hidden and reserved.
              </p>
            </div>

            <button
              onClick={handleToggleMinBalance}
              type="button"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                useMinBalance ? "bg-indigo-600" : "bg-[#333]"
              }`}
              role="switch"
              aria-checked={useMinBalance}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  useMinBalance ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* AI Configuration Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            AI Models Configuration
          </h2>
          <div className="space-y-5">
            {providers.map((provider) => {
              const config = PROVIDER_MODELS[provider.id];
              const selectedModel = preferences[provider.id] ?? config.default;
              const Icon = provider.icon;
              const isDefault = selectedModel === config.default;

              return (
                <section
                  key={provider.id}
                  className={`rounded-2xl border p-5 space-y-4 ${provider.color}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-white">{provider.name}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Default: {getModelLabel(provider.id, config.default)}
                        </p>
                      </div>
                    </div>
                    {savedProvider === provider.id && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Select Model
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {config.models.map((model) => {
                        const isSelected = selectedModel === model.id;

                        return (
                          <button
                            key={model.id}
                            onClick={() => handleSelectModel(provider.id, model.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                : "bg-[#0d0d0d] border-[#2a2a2a] text-gray-400 hover:border-[#444] hover:text-gray-200"
                            }`}
                          >
                            {model.label}
                            {model.free && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-emerald-500/15 text-emerald-400"
                                }`}
                              >
                                Free
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 border-t border-white/5 pt-3 font-mono truncate">
                    Active: {selectedModel}
                    {isDefault && (
                      <span className="ml-2 text-indigo-400/70">(default)</span>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
