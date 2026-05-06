import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { courseText } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Clé API Anthropic manquante. Vérifiez votre fichier .env.local." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (!courseText || courseText.trim().length < 50) {
      return NextResponse.json(
        { error: "Le texte du cours est trop court." },
        { status: 400 }
      );
    }

    const prompt = `Tu es un assistant pédagogique expert. À partir du cours suivant, génère une fiche de révision structurée en JSON.

COURS :
${courseText}

Génère une fiche de révision au format JSON STRICT suivant (sans markdown, sans explications, juste le JSON) :
{
  "titre": "Titre concis de la fiche",
  "points_cles": [
    "Point clé 1",
    "Point clé 2",
    "Point clé 3",
    "Point clé 4",
    "Point clé 5"
  ],
  "definitions": [
    { "terme": "Terme 1", "definition": "Définition claire et concise" },
    { "terme": "Terme 2", "definition": "Définition claire et concise" },
    { "terme": "Terme 3", "definition": "Définition claire et concise" }
  ],
  "qcm": [
    {
      "question": "Question 1 ?",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      "reponse": "A"
    },
    {
      "question": "Question 2 ?",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      "reponse": "B"
    },
    {
      "question": "Question 3 ?",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      "reponse": "C"
    },
    {
      "question": "Question 4 ?",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      "reponse": "A"
    },
    {
      "question": "Question 5 ?",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      "reponse": "D"
    }
  ]
}`;

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Réponse inattendue de l'API");
    }

    // Extract JSON from the response
    const text = content.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Format JSON invalide dans la réponse");
    }

    const fiche = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ fiche });
  } catch (error) {
    console.error("Erreur API:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
