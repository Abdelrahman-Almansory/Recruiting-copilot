import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const strategiesTable =
    process.env.AIRTABLE_STRATEGIES_TABLE || "Sourcing Strategies";

  if (!baseId || !apiKey) {
    return NextResponse.json(
      { error: "Airtable is not configured" },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const body = payload as {
    claimedBy?: string;
    recruiterNote?: string;
    status?: string;
  };

  const fields: Record<string, string> = {};

  if (typeof body.claimedBy === "string") {
    fields["Claimed By"] = body.claimedBy;
  }

  if (typeof body.recruiterNote === "string") {
    fields["Recruiter Note"] = body.recruiterNote;
  }

  if (typeof body.status === "string") {
    fields["Status"] = body.status;
  }

  if (!Object.keys(fields).length) {
    return NextResponse.json(
      { error: "No valid fields provided" },
      { status: 400 },
    );
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    strategiesTable,
  )}/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `Airtable update failed: ${response.status} ${errorText}` },
      { status: response.status },
    );
  }

  const record = await response.json();
  return NextResponse.json({ record });
}
