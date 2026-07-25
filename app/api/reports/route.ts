import { NextResponse } from "next/server";
import { getReportsData } from "@/lib/report-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getReportsData();
  return NextResponse.json(payload);
}
