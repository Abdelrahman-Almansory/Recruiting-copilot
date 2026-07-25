import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportAccordion } from "@/components/report-accordion";
import { ReportShell } from "@/components/report-shell";
import { getReportsData } from "@/lib/report-data";

export const dynamic = "force-dynamic";

const sectionConfig: Record<string, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description: "The role context, positioning, and hiring intent.",
  },
  "search-strategy": {
    title: "Search Strategy",
    description: "How the team will approach talent discovery.",
  },
  "candidate-persona": {
    title: "Candidate Persona",
    description: "The profile of the strongest-fit candidate.",
  },
  insights: {
    title: "Insights",
    description: "Recommendations and signals for the hiring team.",
  },
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = await params;
  const { reports } = await getReportsData();
  const report = reports.find((item) => item.slug === slug) ?? null;

  if (!report) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
          <h1 className="text-3xl font-semibold">Report not found</h1>
          <p className="mt-3 text-slate-400">
            The requested role report could not be located.
          </p>
          <Link
            href="/reports"
            className="mt-6 inline-flex items-center gap-2 text-cyan-300"
          >
            Return to reports
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const currentSection = sectionConfig[section] ? section : "overview";

  return (
    <ReportShell report={report} currentSection={currentSection}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              {report.team}
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              {report.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-lg text-slate-300">{report.summary}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
                How to use this report
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Pick one strategy, copy the search text, and use it in LinkedIn
                or your sourcing tool. Keep the strategy claim and note updated
                so other recruiters can follow the same approach.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-slate-100">
                Quick steps
              </p>
              <ol className="mt-3 space-y-2 text-sm text-slate-300">
                <li>1. Open the strategy section and choose one option.</li>
                <li>2. Copy the Boolean/LinkedIn/X-ray text.</li>
                <li>
                  3. Paste in LinkedIn or your sourcing tool and filter by
                  role/location.
                </li>
                <li>4. Mark it claimed and save your note if you use it.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-slate-100">
                Example prompts
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div>
                  <p className="text-slate-100">LinkedIn search</p>
                  <p className="mt-1 rounded-xl bg-slate-900/80 px-3 py-2 font-mono text-slate-200">
                    Copy this query, paste in LinkedIn Recruiter, then filter
                    for current location and seniority.
                  </p>
                </div>
                <div>
                  <p className="text-slate-100">X-ray search</p>
                  <p className="mt-1 rounded-xl bg-slate-900/80 px-3 py-2 font-mono text-slate-200">
                    Copy the X-ray string and search Google for profiles with
                    the target title plus company keywords.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ReportAccordion report={report} initialSection={currentSection} />

        <div className="flex justify-end">
          <Link
            href="/reports"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
          >
            See all reports
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </ReportShell>
  );
}
