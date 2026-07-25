import { NextResponse } from "next/server";
import { getReportsData } from "@/lib/report-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const payload = await getReportsData();
  const report = payload.reports.find((item) => item.slug === slug);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}

async function deleteAirtableRecords(
  baseId: string,
  apiKey: string,
  tableName: string,
  recordIds: string[],
) {
  if (!recordIds.length) {
    return;
  }

  const query = recordIds
    .map((id) => `records[]=${encodeURIComponent(id)}`)
    .join("&");
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName,
  )}?${query}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Airtable delete failed for ${tableName}: ${response.status} ${text}`,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const payload = await getReportsData();
  const report = payload.reports.find((item) => item.slug === slug);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const reportsTable = process.env.AIRTABLE_REPORTS_TABLE || "JD Reports";
  const strategiesTable =
    process.env.AIRTABLE_STRATEGIES_TABLE || "Sourcing Strategies";

  if (!baseId || !apiKey) {
    return NextResponse.json(
      { error: "Airtable is not configured" },
      { status: 500 },
    );
  }

  if (report.id.startsWith("airtable-")) {
    return NextResponse.json(
      { error: "Cannot delete a fallback report record" },
      { status: 400 },
    );
  }

  try {
    const strategyIds = report.strategyDetails
      .filter((strategy) => strategy.id)
      .map((strategy) => strategy.id);

    if (strategyIds.length) {
      await deleteAirtableRecords(baseId, apiKey, strategiesTable, strategyIds);
    }

    await deleteAirtableRecords(baseId, apiKey, reportsTable, [report.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to delete report records" },
      { status: 500 },
    );
  }
}
