import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use lib path directly to avoid pdf-parse loading its test files (causes errors in Next.js)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const data = await pdfParse(buffer);

    const text = (data.text as string)?.trim();

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: "Le PDF ne contient pas de texte extractible (PDF scanné ?)" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Erreur parsing PDF:", error);
    return NextResponse.json(
      { error: "Impossible de lire ce PDF. Vérifiez qu'il n'est pas protégé." },
      { status: 500 }
    );
  }
}
