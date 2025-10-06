import { NextResponse, NextRequest } from "next/server";
import { generateStockReport } from "@/app/actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email manquant" }, { status: 400 });
    }

    const report = await generateStockReport(email);
    return NextResponse.json({ report }, { status: 200 });
  } catch (err) {
    console.error("/api/report error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération du rapport" },
      { status: 500 }
    );
  }
}
