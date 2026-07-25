"use client";

import { useState } from "react";
import {
  Building2,
  Compass,
  Copy,
  Layers3,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { Report } from "@/lib/report-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const sectionMeta = [
  {
    id: "overview",
    title: "Overview",
    description: "Core role details and hiring priorities",
    icon: Compass,
  },
  {
    id: "search-strategy",
    title: "Search Strategy",
    description: "Search motion options and targeting logic",
    icon: Search,
  },
  {
    id: "candidate-persona",
    title: "Candidate Persona",
    description: "LinkedIn-style profile of the ideal hire",
    icon: UserRound,
  },
  {
    id: "insights",
    title: "Insights",
    description: "Recruiter guidance and enablement notes",
    icon: Sparkles,
  },
] as const;

function toSafeText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
}

function renderBulletList(items: unknown[] | undefined, emptyText: string) {
  const safeItems = Array.isArray(items)
    ? items.map((item) => toSafeText(item)).filter(Boolean)
    : [];

  if (!safeItems.length) {
    return <p className="text-sm text-slate-400">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2 text-sm text-slate-300">
      {safeItems.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\w:.-]*\b[^>]*>/i.test(value);
}

function sanitizeHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s(on\w+)=['"][^'"]*['"]/gi, "")
    .replace(/javascript:/gi, "");
}

function RichTextBlock({
  content,
  fallback,
}: {
  content: string;
  fallback: string;
}) {
  const normalized = toSafeText(content).trim();

  if (!normalized) {
    return <p className="text-sm text-slate-400">{fallback}</p>;
  }

  if (isHtmlContent(normalized)) {
    return (
      <div
        className="rich-text text-sm leading-7 text-slate-300"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(normalized) }}
      />
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
      {normalized}
    </p>
  );
}

export function ReportAccordion({
  report,
  initialSection = "overview",
}: {
  report: Report;
  initialSection?: string;
}) {
  const [openSection, setOpenSection] = useState(initialSection);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openStrategyIds, setOpenStrategyIds] = useState<
    Record<string, boolean>
  >({});
  const [strategyState, setStrategyState] = useState<
    Record<
      string,
      {
        status: string;
        claimedBy: string;
        recruiterNote: string;
        lastUpdated: string;
      }
    >
  >(() =>
    Object.fromEntries(
      report.strategyDetails.map((strategy) => [
        strategy.id,
        {
          status: strategy.status || "Available",
          claimedBy: strategy.claimedBy || "",
          recruiterNote: strategy.recruiterNote || "",
          lastUpdated: strategy.lastUpdated || "",
        },
      ]),
    ),
  );
  const [savingStrategyIds, setSavingStrategyIds] = useState<
    Record<string, boolean>
  >({});
  const [strategyMessages, setStrategyMessages] = useState<
    Record<string, string>
  >({});

  const getStrategyFields = (strategyId: string) =>
    strategyState[strategyId] ?? {
      status: "Available",
      claimedBy: "",
      recruiterNote: "",
      lastUpdated: "",
    };

  const updateStrategyField = (
    strategyId: string,
    values: Partial<{
      status: string;
      claimedBy: string;
      recruiterNote: string;
      lastUpdated: string;
    }>,
  ) => {
    setStrategyState((prev) => ({
      ...prev,
      [strategyId]: {
        ...prev[strategyId],
        ...values,
      },
    }));
  };

  const isAirtableStrategy = (strategyId: string) =>
    !strategyId.startsWith("strategy-");

  const saveStrategyFields = async (strategyId: string) => {
    const fields = getStrategyFields(strategyId);

    if (!isAirtableStrategy(strategyId)) {
      setStrategyMessages((prev) => ({
        ...prev,
        [strategyId]:
          "Saving is only available for Airtable-backed strategies.",
      }));
      return;
    }

    setSavingStrategyIds((prev) => ({ ...prev, [strategyId]: true }));
    setStrategyMessages((prev) => ({ ...prev, [strategyId]: "" }));

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimedBy: fields.claimedBy,
          recruiterNote: fields.recruiterNote,
          status: fields.status,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Unable to save strategy metadata");
      }

      const today = new Date().toISOString().slice(0, 10);
      updateStrategyField(strategyId, { lastUpdated: today });
      setStrategyMessages((prev) => ({
        ...prev,
        [strategyId]: "Saved successfully.",
      }));
    } catch (error) {
      setStrategyMessages((prev) => ({
        ...prev,
        [strategyId]:
          error instanceof Error
            ? error.message
            : "Failed to save strategy metadata.",
      }));
    } finally {
      setSavingStrategyIds((prev) => ({ ...prev, [strategyId]: false }));
    }
  };

  const clearStrategyFields = async (strategyId: string) => {
    if (!isAirtableStrategy(strategyId)) {
      setStrategyMessages((prev) => ({
        ...prev,
        [strategyId]:
          "Clearing is only available for Airtable-backed strategies.",
      }));
      return;
    }

    const updatedValues = {
      claimedBy: "",
      recruiterNote: "",
      status: "Available",
    };

    setSavingStrategyIds((prev) => ({ ...prev, [strategyId]: true }));
    setStrategyMessages((prev) => ({ ...prev, [strategyId]: "" }));

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedValues),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Unable to clear strategy metadata");
      }

      const today = new Date().toISOString().slice(0, 10);
      updateStrategyField(strategyId, { ...updatedValues, lastUpdated: today });
      setStrategyMessages((prev) => ({
        ...prev,
        [strategyId]: "Cleared successfully.",
      }));
    } catch (error) {
      setStrategyMessages((prev) => ({
        ...prev,
        [strategyId]:
          error instanceof Error
            ? error.message
            : "Failed to clear strategy metadata.",
      }));
    } finally {
      setSavingStrategyIds((prev) => ({ ...prev, [strategyId]: false }));
    }
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1400);
    } catch {
      // ignore clipboard issues
    }
  };

  const toggleStrategy = (strategyId: string) => {
    setOpenStrategyIds((prev) => ({
      ...prev,
      [strategyId]: !prev[strategyId],
    }));
  };

  return (
    <div className="space-y-3">
      {sectionMeta.map((section) => {
        const Icon = section.icon;
        const isOpen = openSection === section.id;

        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
          >
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? "" : section.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-cyan-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {section.title}
                  </p>
                  <p className="text-sm text-slate-400">
                    {section.description}
                  </p>
                </div>
              </div>
              <span className="text-sm text-slate-400">
                {isOpen ? "Hide" : "Open"}
              </span>
            </button>

            {isOpen ? (
              <div className="border-t border-slate-800 px-4 py-4">
                {section.id === "overview" ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-200">
                            Role snapshot
                          </p>
                          <div className="mt-2">
                            <RichTextBlock
                              content={report.overview || report.summary}
                              fallback={toSafeText(report.summary)}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              toSafeText(report.summary),
                              `${section.id}-summary`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedKey === `${section.id}-summary`
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard label="Name" value={report.title} />
                        <MetricCard label="Team" value={report.team} />
                        <MetricCard
                          label="Location"
                          value={report.metadata.location || "—"}
                        />
                        <MetricCard
                          label="Confidence"
                          value={
                            report.metadata.confidenceScore !== undefined
                              ? `${report.metadata.confidenceScore}%`
                              : "—"
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-100">
                          <Building2 className="h-4 w-4 text-cyan-300" />
                          Role fit
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <MetricCard
                            label="Experience"
                            value={report.metadata.experience || "—"}
                          />
                          <MetricCard
                            label="Employment type"
                            value={report.metadata.employmentType || "—"}
                          />
                          <MetricCard
                            label="Work model"
                            value={report.metadata.workModel || "—"}
                          />
                          <MetricCard
                            label="Salary range"
                            value={report.metadata.salaryRange || "—"}
                          />
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="mb-3 text-sm font-medium text-slate-100">
                          Must-have / nice-to-have
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="mb-2 text-sm font-medium text-slate-200">
                              Must-have
                            </p>
                            {renderBulletList(
                              report.metadata.mustHave,
                              "No must-have requirements captured yet.",
                            )}
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-medium text-slate-200">
                              Nice-to-have
                            </p>
                            {renderBulletList(
                              report.metadata.niceToHave,
                              "No nice-to-have signals captured yet.",
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <InsightCard
                        title="Recruiter tips"
                        body={
                          report.insights ||
                          "No recruiter insights were supplied yet."
                        }
                        onCopy={() =>
                          copyText(
                            report.insights || "",
                            `${section.id}-insights`,
                          )
                        }
                        copied={copiedKey === `${section.id}-insights`}
                      />
                      <InsightCard
                        title="General search strategy"
                        body={
                          report.searchStrategy ||
                          "No search strategy was supplied yet."
                        }
                        onCopy={() =>
                          copyText(
                            report.searchStrategy || "",
                            `${section.id}-search`,
                          )
                        }
                        copied={copiedKey === `${section.id}-search`}
                      />
                    </div>
                  </div>
                ) : null}

                {section.id === "search-strategy" ? (
                  <div className="space-y-3">
                    {report.strategyDetails.length ? (
                      report.strategyDetails.map((strategy) => {
                        const strategyOpen = !!openStrategyIds[strategy.id];

                        return (
                          <div
                            key={strategy.id}
                            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
                          >
                            <button
                              type="button"
                              onClick={() => toggleStrategy(strategy.id)}
                              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-lg font-semibold text-slate-100">
                                  {strategy.strategyName}
                                </p>
                                <p className="mt-2 text-sm text-slate-400">
                                  {toSafeText(
                                    strategy.description || strategy.goal,
                                  )}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                  <span>
                                    {strategy.claimedBy
                                      ? `Claimed by ${strategy.claimedBy}`
                                      : "Available"}
                                  </span>
                                  {strategy.lastUpdated ? (
                                    <span className="text-slate-300">
                                      Updated {strategy.lastUpdated}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">
                                  {strategy.status || "Available"}
                                </Badge>
                                <Badge variant="secondary">
                                  {strategy.difficulty || "Open"}
                                </Badge>
                                <span className="text-sm text-slate-400">
                                  {strategyOpen ? "Hide" : "Open"}
                                </span>
                              </div>
                            </button>

                            {strategyOpen ? (
                              <div className="border-t border-slate-800 px-4 py-4">
                                <div className="grid gap-3 md:grid-cols-3">
                                  <CopyField
                                    label="Boolean"
                                    value={strategy.booleanSearch}
                                    onCopy={() =>
                                      copyText(
                                        strategy.booleanSearch || "",
                                        `${strategy.id}-boolean`,
                                      )
                                    }
                                    copied={
                                      copiedKey === `${strategy.id}-boolean`
                                    }
                                  />
                                  <CopyField
                                    label="LinkedIn"
                                    value={strategy.linkedinSearch}
                                    onCopy={() =>
                                      copyText(
                                        strategy.linkedinSearch || "",
                                        `${strategy.id}-linkedin`,
                                      )
                                    }
                                    copied={
                                      copiedKey === `${strategy.id}-linkedin`
                                    }
                                  />
                                  <CopyField
                                    label="X-ray"
                                    value={strategy.xraySearch}
                                    onCopy={() =>
                                      copyText(
                                        strategy.xraySearch || "",
                                        `${strategy.id}-xray`,
                                      )
                                    }
                                    copied={copiedKey === `${strategy.id}-xray`}
                                  />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <p className="text-sm font-medium text-slate-200">
                                        Targets
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyText(
                                            [
                                              strategy.targetTitles.join(", "),
                                              strategy.targetCompanies.join(
                                                ", ",
                                              ),
                                              strategy.targetIndustries.join(
                                                ", ",
                                              ),
                                            ]
                                              .filter(Boolean)
                                              .join(" | "),
                                            `${strategy.id}-targets`,
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        {copiedKey === `${strategy.id}-targets`
                                          ? "Copied"
                                          : "Copy"}
                                      </button>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      {strategy.targetTitles.length ? (
                                        <p>
                                          Titles:{" "}
                                          {strategy.targetTitles.join(", ")}
                                        </p>
                                      ) : null}
                                      {strategy.targetCompanies.length ? (
                                        <p>
                                          Companies:{" "}
                                          {strategy.targetCompanies.join(", ")}
                                        </p>
                                      ) : null}
                                      {strategy.targetIndustries.length ? (
                                        <p>
                                          Industries:{" "}
                                          {strategy.targetIndustries.join(", ")}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <p className="text-sm font-medium text-slate-200">
                                        Why it works
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyText(
                                            toSafeText(
                                              strategy.whyItWorks ||
                                                strategy.philosophy,
                                            ),
                                            `${strategy.id}-why`,
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        {copiedKey === `${strategy.id}-why`
                                          ? "Copied"
                                          : "Copy"}
                                      </button>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                      {toSafeText(
                                        strategy.whyItWorks ||
                                          strategy.philosophy,
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                      <p className="text-sm font-medium text-slate-200">
                                        Recruiter note
                                      </p>
                                      {getStrategyFields(strategy.id)
                                        .lastUpdated ? (
                                        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                          Updated{" "}
                                          {
                                            getStrategyFields(strategy.id)
                                              .lastUpdated
                                          }
                                        </span>
                                      ) : null}
                                    </div>
                                    <Textarea
                                      value={
                                        getStrategyFields(strategy.id)
                                          .recruiterNote
                                      }
                                      onChange={(event) =>
                                        updateStrategyField(strategy.id, {
                                          recruiterNote: event.target.value,
                                        })
                                      }
                                      placeholder="Enter a quick note for other recruiters..."
                                    />
                                  </div>
                                  <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                                      <label className="text-sm font-medium text-slate-200">
                                        Claimed by
                                      </label>
                                      <Input
                                        value={
                                          getStrategyFields(strategy.id)
                                            .claimedBy
                                        }
                                        onChange={(event) =>
                                          updateStrategyField(strategy.id, {
                                            claimedBy: event.target.value,
                                          })
                                        }
                                        placeholder="Your name"
                                        className="mt-2"
                                      />
                                    </div>
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                                      <label className="text-sm font-medium text-slate-200">
                                        Status
                                      </label>
                                      <select
                                        value={
                                          getStrategyFields(strategy.id).status
                                        }
                                        onChange={(event) =>
                                          updateStrategyField(strategy.id, {
                                            status: event.target.value,
                                          })
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                      >
                                        <option value="Available">
                                          Available
                                        </option>
                                        <option value="In progress">
                                          In progress
                                        </option>
                                        <option value="Used">Used</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <button
                                      type="button"
                                      disabled={savingStrategyIds[strategy.id]}
                                      onClick={() =>
                                        saveStrategyFields(strategy.id)
                                      }
                                      className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {savingStrategyIds[strategy.id]
                                        ? "Saving..."
                                        : "Save collaboration info"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={savingStrategyIds[strategy.id]}
                                      onClick={() =>
                                        clearStrategyFields(strategy.id)
                                      }
                                      className="inline-flex h-11 items-center justify-center rounded-full border border-slate-700 bg-transparent px-5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Clear
                                    </button>
                                    {strategyMessages[strategy.id] ? (
                                      <p className="text-sm text-slate-400">
                                        {strategyMessages[strategy.id]}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                        No search strategies are connected yet.
                      </div>
                    )}
                  </div>
                ) : null}

                {section.id === "candidate-persona" ? (
                  <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <Card className="border-slate-800 bg-slate-950/70">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-lg font-semibold text-cyan-300">
                            {report.title.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {report.title}
                            </CardTitle>
                            <p className="text-sm text-slate-400">
                              LinkedIn-style profile view
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-200">
                              Profile summary
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  report.candidatePersona || "",
                                  `${section.id}-persona`,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              {copiedKey === `${section.id}-persona`
                                ? "Copied"
                                : "Copy"}
                            </button>
                          </div>
                          <p className="text-sm leading-7 text-slate-400">
                            {report.candidatePersona ||
                              "No candidate persona text is available yet."}
                          </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <MetricCard
                            label="Education"
                            value={report.metadata.education || "—"}
                          />
                          <MetricCard
                            label="Experience"
                            value={report.metadata.experience || "—"}
                          />
                          <MetricCard
                            label="Location"
                            value={report.metadata.location || "—"}
                          />
                          <MetricCard
                            label="Work model"
                            value={report.metadata.workModel || "—"}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-800 bg-slate-950/70">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Signals to prioritize
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="mb-2 text-sm font-medium text-slate-200">
                            Must-have
                          </p>
                          {renderBulletList(
                            report.metadata.mustHave,
                            "No must-have requirements captured yet.",
                          )}
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-slate-200">
                            Nice-to-have
                          </p>
                          {renderBulletList(
                            report.metadata.niceToHave,
                            "No nice-to-have signals captured yet.",
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}

                {section.id === "insights" ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    <InsightCard
                      title="Recruiter insights"
                      body={
                        report.insights ||
                        "No recruiter insights were supplied yet."
                      }
                      onCopy={() =>
                        copyText(
                          report.insights || "",
                          `${section.id}-insights`,
                        )
                      }
                      copied={copiedKey === `${section.id}-insights`}
                    />
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                      <div className="mb-3 text-sm font-medium text-slate-100">
                        Confidence assumptions
                      </div>
                      {renderBulletList(
                        report.metadata.confidenceAssumptions,
                        "No confidence assumptions captured yet.",
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}

function InsightCard({
  title,
  body,
  onCopy,
  copied,
}: {
  title: string;
  body: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm leading-7 text-slate-400">{body}</p>
    </div>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-slate-400">
        {value || "No search text available yet."}
      </p>
    </div>
  );
}
