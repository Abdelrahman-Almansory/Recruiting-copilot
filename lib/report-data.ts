export interface ReportSection {
  title: string;
  slug: string;
  description: string;
}

export interface SourcingStrategy {
  id: string;
  strategyName: string;
  goal: string;
  philosophy: string;
  description: string;
  difficulty: string;
  status: string;
  claimedBy: string;
  recruiterNote: string;
  lastUpdated: string;
  expectedCandidateQuality: string;
  bestWhen: string;
  whyItWorks: string;
  targetTitles: string[];
  targetCompanies: string[];
  targetIndustries: string[];
  keywords: string[];
  excludedKeywords: string[];
  booleanSearch: string;
  linkedinSearch: string;
  xraySearch: string;
  steps: string[];
}

export interface ReportMetadata {
  reportId?: string;
  generatedAt?: string;
  model?: string;
  reportVersion?: string;
  language?: string;
  seniority?: string;
  department?: string;
  industry?: string;
  location?: string;
  employmentType?: string;
  workModel?: string;
  experience?: string;
  education?: string;
  salaryRange?: string;
  primaryObjective?: string;
  confidenceScore?: number;
  confidenceAssumptions: string[];
  mustHave: string[];
  niceToHave: string[];
}

export interface Report {
  id: string;
  slug: string;
  title: string;
  summary: string;
  overview: string;
  searchStrategy: string;
  candidatePersona: string;
  sourcingStrategies: string;
  insights: string;
  team: string;
  priority: string;
  updatedAt: string;
  tags: string[];
  sections: ReportSection[];
  metadata: ReportMetadata;
  strategyDetails: SourcingStrategy[];
}

export interface ReportsResponse {
  reports: Report[];
  source: "airtable" | "fallback";
}

type AirtableFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[];

type AirtableRecord = {
  id?: string;
  fields: Record<string, AirtableFieldValue>;
};

function coerceString(value: AirtableFieldValue): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => coerceString(item))
      .filter(Boolean)
      .join(", ");
  }

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

function pickField(
  fields: Record<string, AirtableFieldValue>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = fields[key];
    if (value !== undefined && value !== null && coerceString(value).trim()) {
      return coerceString(value);
    }
  }

  return "";
}

function parseStringList(value: AirtableFieldValue): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => coerceString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => coerceString(item)).filter(Boolean);
      }
    } catch {
      // Fall back to comma separated values
    }

    return trimmed
      .replace(/^\[|\]$/g, "")
      .split(/,|;|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, AirtableFieldValue>)
      .map((item) => coerceString(item))
      .filter(Boolean);
  }

  return [];
}

function parseStructuredText(
  value: AirtableFieldValue,
  mode: "search" | "persona" | "insights",
): string {
  const text = coerceString(value);
  if (!text) {
    return "";
  }

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null) {
      if (mode === "search") {
        const parts: string[] = [];
        if (parsed.booleanSearch) {
          parts.push(`Boolean search: ${parsed.booleanSearch}`);
        }
        if (parsed.linkedinSearch) {
          parts.push(`LinkedIn search: ${parsed.linkedinSearch}`);
        }
        if (parsed.xraySearch) {
          parts.push(`X-ray search: ${parsed.xraySearch}`);
        }
        if (parsed.hiddenKeywords) {
          const keywords = Array.isArray(parsed.hiddenKeywords)
            ? parsed.hiddenKeywords.join(", ")
            : parsed.hiddenKeywords;
          parts.push(`Hidden keywords: ${keywords}`);
        }
        if (parsed.similarTitles) {
          const titles = Array.isArray(parsed.similarTitles)
            ? parsed.similarTitles.join(", ")
            : parsed.similarTitles;
          parts.push(`Similar titles: ${titles}`);
        }
        return parts.join("\n");
      }

      if (mode === "persona") {
        const parts: string[] = [];
        if (parsed.yearsExperience) {
          parts.push(`Years: ${parsed.yearsExperience}`);
        }
        if (parsed.education) {
          parts.push(`Education: ${parsed.education}`);
        }
        if (parsed.industries) {
          const industries = Array.isArray(parsed.industries)
            ? parsed.industries.join(", ")
            : parsed.industries;
          parts.push(`Industries: ${industries}`);
        }
        if (parsed.technicalSkills) {
          const skills = Array.isArray(parsed.technicalSkills)
            ? parsed.technicalSkills.join(", ")
            : parsed.technicalSkills;
          parts.push(`Technical skills: ${skills}`);
        }
        if (parsed.softSkills) {
          const skills = Array.isArray(parsed.softSkills)
            ? parsed.softSkills.join(", ")
            : parsed.softSkills;
          parts.push(`Soft skills: ${skills}`);
        }
        return parts.join(" • ");
      }

      if (mode === "insights") {
        const parts: string[] = [];
        if (parsed.recruiterTips) {
          const tips = Array.isArray(parsed.recruiterTips)
            ? parsed.recruiterTips.join(" • ")
            : parsed.recruiterTips;
          parts.push(`Recruiter tips: ${tips}`);
        }
        if (parsed.commonMistakes) {
          const mistakes = Array.isArray(parsed.commonMistakes)
            ? parsed.commonMistakes.join(" • ")
            : parsed.commonMistakes;
          parts.push(`Common mistakes: ${mistakes}`);
        }
        if (parsed.redFlags) {
          const flags = Array.isArray(parsed.redFlags)
            ? parsed.redFlags.join(" • ")
            : parsed.redFlags;
          parts.push(`Red flags: ${flags}`);
        }
        if (parsed.greenFlags) {
          const flags = Array.isArray(parsed.greenFlags)
            ? parsed.greenFlags.join(" • ")
            : parsed.greenFlags;
          parts.push(`Green flags: ${flags}`);
        }
        return parts.join("\n");
      }
    }
  } catch {
    // Fall back to a plain string representation.
  }

  return text;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeSections(): ReportSection[] {
  return [
    {
      title: "Overview",
      slug: "overview",
      description: "Executive summary and role context",
    },
    {
      title: "Search Strategy",
      slug: "search-strategy",
      description: "How the team will approach the search",
    },
    {
      title: "Candidate Persona",
      slug: "candidate-persona",
      description: "Who the best-fit candidate looks like",
    },
    {
      title: "Insights",
      slug: "insights",
      description: "Signals and recommendations for the hiring team",
    },
  ];
}

function summarizeStrategies(strategies: SourcingStrategy[]): string {
  if (!strategies.length) {
    return "";
  }

  return strategies
    .map(
      (strategy) =>
        `${strategy.strategyName}: ${strategy.description || strategy.goal}`,
    )
    .join(" • ");
}

function normalizeStrategyRecord(
  record: AirtableRecord | null | undefined,
  index: number,
): SourcingStrategy {
  const fields =
    record?.fields && typeof record.fields === "object" ? record.fields : {};

  return {
    id: record?.id || `strategy-${index + 1}`,
    strategyName: pickField(fields, ["strategyName", "Strategy Name", "Name"]),
    goal: pickField(fields, ["goal", "Goal"]),
    philosophy: pickField(fields, ["philosophy", "Philosophy"]),
    description: pickField(fields, ["description", "Description"]),
    difficulty: pickField(fields, ["difficulty", "Difficulty"]),
    status: pickField(fields, ["status", "Status"]) || "Available",
    claimedBy: pickField(fields, ["claimedBy", "Claimed By", "ClaimedBy"]),
    recruiterNote: pickField(fields, [
      "recruiterNote",
      "Recruiter Note",
      "Note",
      "Notes",
    ]),
    lastUpdated: pickField(fields, ["lastUpdated", "Last Updated", "Updated"]),
    expectedCandidateQuality: pickField(fields, [
      "expectedCandidateQuality",
      "Expected Candidate Quality",
    ]),
    bestWhen: pickField(fields, ["bestWhen", "Best When"]),
    whyItWorks: pickField(fields, ["whyItWorks", "Why It Works"]),
    targetTitles: parseStringList(fields.targetTitles),
    targetCompanies: parseStringList(fields.targetCompanies),
    targetIndustries: parseStringList(fields.targetIndustries),
    keywords: parseStringList(fields.keywords),
    excludedKeywords: parseStringList(fields.excludedKeywords),
    booleanSearch: pickField(fields, ["booleanSearch", "Boolean Search"]),
    linkedinSearch: pickField(fields, ["linkedinSearch", "LinkedIn Search"]),
    xraySearch: pickField(fields, ["xraySearch", "X-Ray Search"]),
    steps: parseStringList(fields.steps),
  };
}

function buildFallbackReports(): Report[] {
  return [
    {
      id: "report-people-ops",
      slug: "people-operations-manager",
      title: "People Operations Manager",
      summary:
        "A high-impact role focused on employee experience, HR operations, and leadership support.",
      overview:
        "This role is designed for a leader who can streamline people processes across a growing organization. The report is structured to support a thoughtful search around culture, compliance, and enablement.",
      searchStrategy:
        "Prioritize candidates from scaling companies, HR ops leadership, and organizations with strong employee experience and process maturity.",
      candidatePersona:
        "The ideal candidate combines operational rigor with a calm leadership style. They are comfortable balancing systems thinking with interpersonal communication.",
      sourcingStrategies:
        "Blend outbound recruiting, HR community networks, and referrals from payroll, benefits, and employee experience leaders to uncover high-signal talent.",
      insights:
        "Compensation expectations will likely be shaped by cross-functional scope and the candidate's experience with distributed teams.",
      team: "Talent Acquisition",
      priority: "High",
      updatedAt: "2026-07-18",
      tags: ["People Ops", "HR", "Leadership"],
      sections: makeSections(),
      metadata: {
        confidenceAssumptions: [],
        mustHave: [],
        niceToHave: [],
      },
      strategyDetails: [],
    },
    {
      id: "report-hiring-partner",
      slug: "talent-partner",
      title: "Talent Partner",
      summary:
        "A strategic recruiting role that partners closely with business leaders and hiring managers.",
      overview:
        "This role should attract a talent operator who can build trust quickly and bring clarity to hiring decisions across stakeholders.",
      searchStrategy:
        "Use a balanced strategy that mixes active recruiters, employer brand channels, and strong referral networks in high-growth functions.",
      candidatePersona:
        "The best-fit candidate is a relationship-driven operator who understands both the business and the candidate experience journey.",
      sourcingStrategies:
        "Target talent from venture-backed companies, transformation programs, and internal mobility networks where hiring velocity and stakeholder alignment matter.",
      insights:
        "The strongest profiles will have built search and advisory capabilities rather than relying only on sourcing volume.",
      team: "Recruiting",
      priority: "Medium",
      updatedAt: "2026-07-17",
      tags: ["TA", "Business Partnering", "Strategy"],
      sections: makeSections(),
      metadata: {
        confidenceAssumptions: [],
        mustHave: [],
        niceToHave: [],
      },
      strategyDetails: [],
    },
    {
      id: "report-hrbp",
      slug: "hr-business-partner",
      title: "HR Business Partner",
      summary:
        "A business-facing partner role supporting leaders through change, performance, and organization design.",
      overview:
        "This report helps frame a search around leaders who can influence without authority and maintain calm through scale and ambiguity.",
      searchStrategy:
        "Focus on HR leaders with experience in multi-site organizations and a track record of enabling growth through strong partner relationships.",
      candidatePersona:
        "The ideal candidate brings depth in HR operations and the ability to connect commercial priorities with people strategy.",
      sourcingStrategies:
        "Leverage executive search partners, sector communities, and former people leaders from product-led organizations to unlock adjacent talent.",
      insights:
        "The most compelling profiles will show thoughtful communication, strong judgment, and a clear people development lens.",
      team: "HR Leadership",
      priority: "High",
      updatedAt: "2026-07-16",
      tags: ["HRBP", "Leadership", "Business Alignment"],
      sections: makeSections(),
      metadata: {
        confidenceAssumptions: [],
        mustHave: [],
        niceToHave: [],
      },
      strategyDetails: [],
    },
  ];
}

function normalizeAirtableRecords(
  reportRecords: AirtableRecord[],
  strategyRecords: AirtableRecord[],
): Report[] {
  const normalizedStrategies = strategyRecords.map((record, index) =>
    normalizeStrategyRecord(record, index),
  );

  return reportRecords.map((record, index) => {
    const fields = record.fields;
    const title = pickField(fields, [
      "role",
      "Role",
      "title",
      "Title",
      "name",
      "Name",
    ]);
    const slug = slugify(
      pickField(fields, ["role", "Role", "title", "Title", "name", "Name"]) ||
        title ||
        `report-${index + 1}`,
    );

    const linkedStrategyIds = Array.isArray(fields.sourcingStrategies)
      ? fields.sourcingStrategies
      : typeof fields.sourcingStrategies === "string"
        ? [fields.sourcingStrategies]
        : [];

    const strategyDetails = normalizedStrategies.filter((strategy) => {
      return linkedStrategyIds.includes(strategy.id);
    });

    const summary = pickField(fields, [
      "summary",
      "Summary",
      "overview",
      "Overview",
      "primaryObjective",
      "Primary Objective",
    ]);

    const overview = pickField(fields, [
      "primaryObjective",
      "Primary Objective",
      "summary",
      "Summary",
      "overview",
      "Overview",
    ]);

    const confidenceScoreValue = Number(
      pickField(fields, ["confidenceScore", "Confidence Score"]),
    );
    const confidenceScore = Number.isFinite(confidenceScoreValue)
      ? confidenceScoreValue
      : undefined;

    const department = pickField(fields, [
      "department",
      "Department",
      "team",
      "Team",
    ]);
    const industry = pickField(fields, ["industry", "Industry"]);
    const seniority = pickField(fields, ["seniority", "Seniority"]);
    const location = pickField(fields, ["location", "Location"]);

    return {
      id: record.id || `airtable-${index + 1}`,
      slug: slug || `report-${index + 1}`,
      title: title || `Report ${index + 1}`,
      summary: summary || "Linked to Airtable data.",
      overview: overview || summary || "Airtable content will be mapped here.",
      searchStrategy:
        parseStructuredText(
          pickField(fields, ["searchStrategy", "Search Strategy"]),
          "search",
        ) || "Add your search strategy from Airtable.",
      candidatePersona:
        parseStructuredText(
          pickField(fields, ["candidatePersona", "Candidate Persona"]),
          "persona",
        ) || "Add the candidate persona from Airtable.",
      sourcingStrategies:
        summarizeStrategies(strategyDetails) ||
        "Add sourcing strategies from Airtable.",
      insights:
        parseStructuredText(
          pickField(fields, ["recruiterInsights", "Recruiter Insights"]),
          "insights",
        ) ||
        pickField(fields, [
          "insights",
          "Insights",
          "Notes",
          "Recommendations",
        ]) ||
        "Add insights from Airtable.",
      team: department || "People Operations",
      priority:
        confidenceScore !== undefined
          ? confidenceScore >= 85
            ? "High"
            : confidenceScore >= 70
              ? "Medium"
              : "Low"
          : pickField(fields, ["priority", "Priority", "Status"]) || "Medium",
      updatedAt:
        pickField(fields, [
          "generatedAt",
          "Generated At",
          "updatedAt",
          "Updated",
          "Last Updated",
        ]) || new Date().toISOString().slice(0, 10),
      tags: [department, industry, seniority, location]
        .filter(Boolean)
        .slice(0, 3),
      sections: makeSections(),
      metadata: {
        reportId: pickField(fields, ["reportId", "Report ID"]),
        generatedAt: pickField(fields, ["generatedAt", "Generated At"]),
        model: pickField(fields, ["model", "Model"]),
        reportVersion: pickField(fields, ["reportVersion", "Report Version"]),
        language: pickField(fields, ["language", "Language"]),
        seniority,
        department,
        industry,
        location,
        employmentType: pickField(fields, [
          "employmentType",
          "Employment Type",
        ]),
        workModel: pickField(fields, ["workModel", "Work Model"]),
        experience: pickField(fields, ["experience", "Experience"]),
        education: pickField(fields, ["education", "Education"]),
        salaryRange: pickField(fields, ["salaryRange", "Salary Range"]),
        primaryObjective: overview,
        confidenceScore,
        confidenceAssumptions: parseStringList(fields.confidenceAssumptions),
        mustHave: parseStringList(fields.mustHave),
        niceToHave: parseStringList(fields.niceToHave),
      },
      strategyDetails,
    };
  });
}

function hasConfiguredAirtableEnv(): boolean {
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();

  if (!baseId || !apiKey) {
    return false;
  }

  return !baseId.startsWith("your_") && !apiKey.startsWith("your_");
}

export async function getReportsData(): Promise<ReportsResponse> {
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();

  if (hasConfiguredAirtableEnv()) {
    try {
      const reportsTable = process.env.AIRTABLE_REPORTS_TABLE || "JD Reports";
      const strategiesTable =
        process.env.AIRTABLE_STRATEGIES_TABLE || "Sourcing Strategies";
      const airtableUrl = `https://api.airtable.com/v0/${baseId}`;

      const [reportsResponse, strategiesResponse] = await Promise.all([
        fetch(
          `${airtableUrl}/${encodeURIComponent(reportsTable)}?view=Grid%20view`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            cache: "no-store",
          },
        ),
        fetch(
          `${airtableUrl}/${encodeURIComponent(strategiesTable)}?view=Grid%20view`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            cache: "no-store",
          },
        ),
      ]);

      if (!reportsResponse.ok || !strategiesResponse.ok) {
        throw new Error("Airtable request failed");
      }

      const reportsPayload = (await reportsResponse.json()) as {
        records?: AirtableRecord[];
      };
      const strategiesPayload = (await strategiesResponse.json()) as {
        records?: AirtableRecord[];
      };
      const reports = Array.isArray(reportsPayload.records)
        ? reportsPayload.records
        : [];
      const strategies = Array.isArray(strategiesPayload.records)
        ? strategiesPayload.records
        : [];
      const records = normalizeAirtableRecords(reports, strategies);

      if (records.length) {
        return { reports: records, source: "airtable" };
      }
    } catch (error) {
      console.warn("Falling back to local report seed data:", error);
    }
  }

  return {
    reports: buildFallbackReports(),
    source: "fallback",
  };
}

export async function fetchReportsFromRoute(): Promise<ReportsResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL || "localhost"}`
      : "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${baseUrl}/api/reports`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to read reports route");
    }

    return (await response.json()) as ReportsResponse;
  } catch (error) {
    console.warn("Using local fallback data:", error);
    return { reports: buildFallbackReports(), source: "fallback" };
  }
}

export async function fetchReportBySlug(slug: string): Promise<Report | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL || "localhost"}`
      : "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${baseUrl}/api/reports/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to read report route");
    }

    const payload = (await response.json()) as { report?: Report };
    return payload.report ?? null;
  } catch (error) {
    console.warn("Using local fallback report data:", error);
    const fallback = buildFallbackReports().find((item) => item.slug === slug);
    return fallback ?? null;
  }
}
