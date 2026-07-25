import { NextResponse } from "next/server";

const REPORT_FORM_URL =
  process.env.REPORT_FORM_URL?.trim() ||
  "https://n8n.srv1838879.hstgr.cloud/form/0257b271-19fd-46c6-97d8-45c2c88cf3aa";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.redirect(REPORT_FORM_URL);
}
