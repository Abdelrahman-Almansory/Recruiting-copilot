import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReportDeleteAction from "@/components/report-delete-action";
import { getReportsData } from "@/lib/report-data";

export const dynamic = "force-dynamic";

function normalizeQuery(input: string | string[] | undefined): string {
  if (Array.isArray(input)) {
    return input[0] ?? "";
  }

  return input ?? "";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeQuery(resolvedSearchParams.q).trim();
  const { reports } = await getReportsData();

  const filteredReports = reports.filter((report) => {
    if (!query) {
      return true;
    }

    const haystack = [
      report.title,
      report.summary,
      report.team,
      report.priority,
      ...(report.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="space-y-4">
          <Badge variant="secondary">Ethics HR Strategy Studio</Badge>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Role-based reports and sourcing strategies
              </h1>
              <p className="text-lg text-slate-300">
                Each report brings together the business overview, search plan,
                target persona, sourcing channels, and insight packets for a
                specific job title.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-full bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200",
                )}
              >
                Back to overview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/reports/new-job"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition duration-200 hover:border-cyan-400 hover:bg-cyan-400"
              >
                Add job details
              </Link>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <form
            action="/reports"
            method="get"
            className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <Search className="h-4 w-4 text-cyan-300" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search roles, teams, or tags"
                className="w-full bg-transparent outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
            >
              Search reports
            </button>
          </form>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {filteredReports.length ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredReports.map((report) => (
                <Card
                  key={report.slug}
                  className="border-slate-800 bg-slate-900/70"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-lg font-semibold">
                        {report.title}
                      </CardTitle>
                      <Badge variant="secondary">{report.priority}</Badge>
                    </div>
                    <CardDescription>
                      <span
                        className="block overflow-hidden text-sm leading-6 text-slate-300"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {report.summary}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {report.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                      <div className="mb-2 flex items-center gap-2 font-medium text-slate-100">
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                        Suggested sections
                      </div>
                      <p className="text-sm leading-6 text-slate-300">
                        {Array.isArray(report.sections) &&
                        report.sections.length
                          ? report.sections
                              .map((section) => section.title)
                              .join(" • ")
                          : "No section metadata available yet."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/reports/${report.slug}/overview`}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
                      >
                        Open report
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                      <ReportDeleteAction slug={report.slug} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
              <p className="text-lg font-medium text-slate-100">
                No reports match your search yet.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Try a broader title, team, or tag to surface more options.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
