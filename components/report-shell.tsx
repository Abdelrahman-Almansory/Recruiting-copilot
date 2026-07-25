import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Layers3,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Report } from "@/lib/report-data";

const icons = {
  overview: Compass,
  "search-strategy": Search,
  "candidate-persona": UserRound,
  "sourcing-strategies": Layers3,
  insights: Sparkles,
};

export function ReportShell({
  report,
  currentSection,
  children,
}: {
  report: Report;
  currentSection: string;
  children: React.ReactNode;
}) {
  const sections = Array.isArray(report.sections) ? report.sections : [];
  const navSections = sections.filter(
    (section) => section.slug !== "sourcing-strategies",
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
        <aside className="lg:sticky lg:top-6 lg:h-fit lg:w-80">
          <Card className="border-slate-800/80 bg-slate-900/90 shadow-2xl shadow-slate-950/30">
            <CardHeader className="space-y-4 border-b border-slate-800/80 pb-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Report navigator</CardTitle>
                  <p className="text-sm text-slate-400">
                    Quick access to the active report sections.
                  </p>
                </div>
                <Badge variant="secondary">{report.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                  Role
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-50">
                  {report.title}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {report.tags.length ? report.tags.join(" / ") : report.team}
                </p>
              </div>

              <nav className="space-y-2" aria-label="Report sections">
                {sections.length ? (
                  sections.map((section) => {
                    const Icon =
                      icons[section.slug as keyof typeof icons] ?? Compass;
                    const isActive = currentSection === section.slug;

                    return (
                      <Link
                        key={section.slug}
                        href={`/reports/${report.slug}/${section.slug}`}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-100 shadow-sm shadow-cyan-500/10"
                            : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </Link>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                    No report sections were returned for this record.
                  </div>
                )}
              </nav>

              <Link href="/reports">
                <Button
                  variant="outline"
                  className="w-full justify-center rounded-full border-slate-700 bg-slate-950/80 text-slate-100 hover:bg-slate-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        <section className="flex-1 space-y-6">{children}</section>
      </div>
    </div>
  );
}
