import Link from "next/link";
import {
  ArrowRight,
  Database,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
          <Badge variant="secondary">Ethics HR • Intelligence Hub</Badge>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Structured HR strategy reports for ethical hiring
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                Browse role-specific research, candidate personas, and sourcing
                strategy summaries in one secure internal tool. Designed for
                Ethics HR teams to review actionable talent intelligence with
                clarity.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reports"
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-100 px-6 text-base font-medium text-slate-950 transition-colors hover:bg-slate-200"
              >
                Open report library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-1">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-300" />
                Report library for Ethics HR
              </CardTitle>
              <CardDescription>
                Access structured role guidance, candidate persona summaries,
                and recruiter-facing sourcing notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              This tool centralizes hiring intelligence for Ethics HR, making it
              easy to review approved role briefs, search strategy
              recommendations, and priority outcomes.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
