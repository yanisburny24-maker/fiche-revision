"use client";

import { useState, useRef, useEffect } from "react";

interface Definition {
  terme: string;
  definition: string;
}

interface QCMQuestion {
  question: string;
  options: string[];
  reponse: string;
}

interface Fiche {
  titre: string;
  points_cles: string[];
  definitions: Definition[];
  qcm: QCMQuestion[];
}

const MAX_FREE_FICHES = 3;
const STORAGE_KEY = "fiche_count";

function CounterBadge({ count }: { count: number }) {
  const remaining = MAX_FREE_FICHES - count;
  const color =
    remaining === 0
      ? "bg-red-100 text-red-700 border-red-200"
      : remaining === 1
      ? "bg-orange-100 text-orange-700 border-orange-200"
      : "bg-violet-100 text-violet-700 border-violet-200";

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${color}`}>
      <span className="text-base">🎓</span>
      {remaining > 0
        ? `${remaining} fiche${remaining > 1 ? "s" : ""} gratuite${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`
        : "Limite atteinte"}
    </div>
  );
}

function FicheDisplay({
  fiche,
  onDownload,
}: {
  fiche: Fiche;
  onDownload: () => void;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const handleAnswer = (qIdx: number, option: string) => {
    const letter = option.charAt(0);
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: letter }));
    setShowAnswers((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div id="fiche-content" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 text-violet-200 text-sm mb-2">
          <span>📚</span>
          <span>Fiche de révision</span>
        </div>
        <h2 className="text-2xl font-bold">{fiche.titre}</h2>
      </div>

      {/* Points clés */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
        <h3 className="text-lg font-bold text-violet-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Points clés
        </h3>
        <ul className="space-y-2">
          {fiche.points_cles.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Définitions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
        <h3 className="text-lg font-bold text-violet-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📖</span> Définitions importantes
        </h3>
        <div className="space-y-3">
          {fiche.definitions.map((def, i) => (
            <div key={i} className="p-4 bg-violet-50 rounded-xl border border-violet-100">
              <p className="font-semibold text-violet-900 mb-1">{def.terme}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{def.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QCM */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
        <h3 className="text-lg font-bold text-violet-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🧠</span> QCM d&apos;entraînement
        </h3>
        <div className="space-y-6">
          {fiche.qcm.map((q, qIdx) => {
            const answered = showAnswers[qIdx];
            const selected = selectedAnswers[qIdx];
            const isCorrect = selected === q.reponse;

            return (
              <div key={qIdx} className="border border-gray-100 rounded-xl p-4">
                <p className="font-medium text-gray-800 mb-3">
                  <span className="text-violet-600 font-bold mr-2">Q{qIdx + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((option, oIdx) => {
                    const letter = option.charAt(0);
                    let btnClass =
                      "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ";

                    if (!answered) {
                      btnClass += "border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-gray-700 cursor-pointer";
                    } else if (letter === q.reponse) {
                      btnClass += "border-green-400 bg-green-50 text-green-800";
                    } else if (letter === selected) {
                      btnClass += "border-red-300 bg-red-50 text-red-700";
                    } else {
                      btnClass += "border-gray-100 text-gray-400";
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => !answered && handleAnswer(qIdx, option)}
                        className={btnClass}
                        disabled={answered}
                      >
                        {answered && letter === q.reponse && (
                          <span className="mr-1">✅</span>
                        )}
                        {answered && letter === selected && letter !== q.reponse && (
                          <span className="mr-1">❌</span>
                        )}
                        {option}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <p className={`mt-2 text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {isCorrect ? "✓ Bonne réponse !" : `✗ La bonne réponse était : ${q.reponse}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={onDownload}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <span>⬇️</span> Télécharger en PDF
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 rounded-2xl loading-shimmer" />
      <div className="h-48 rounded-2xl loading-shimmer" />
      <div className="h-40 rounded-2xl loading-shimmer" />
      <div className="h-64 rounded-2xl loading-shimmer" />
    </div>
  );
}

export default function Home() {
  const [courseText, setCourseText] = useState("");
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ficheCount, setFicheCount] = useState(0);
  const [pdfFileName, setPdfFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ficheRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFicheCount(parseInt(stored, 10));
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setCourseText(data.text);
      } else {
        setError("Impossible de lire ce PDF.");
      }
    } catch {
      setError("Erreur lors de la lecture du PDF.");
    }
  };

  const handleGenerate = async () => {
    if (ficheCount >= MAX_FREE_FICHES) {
      setError("Tu as utilisé tes 3 fiches gratuites. Reviens demain !");
      return;
    }
    if (!courseText.trim()) {
      setError("Colle d'abord ton cours dans le champ texte.");
      return;
    }

    setLoading(true);
    setError("");
    setFiche(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseText }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Erreur lors de la génération.");
      }

      setFiche(data.fiche);
      const newCount = ficheCount + 1;
      setFicheCount(newCount);
      localStorage.setItem(STORAGE_KEY, String(newCount));

      setTimeout(() => {
        ficheRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!fiche) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = pageW - 2 * margin;
    let y = 20;

    const addText = (text: string, fontSize: number, color: [number, number, number], bold = false, x = margin) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, contentW);
      if (y + lines.length * (fontSize * 0.4) > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, x, y);
      y += lines.length * (fontSize * 0.45) + 2;
    };

    const addSection = (title: string, emoji: string) => {
      y += 4;
      doc.setFillColor(124, 58, 237);
      doc.roundedRect(margin, y - 5, contentW, 9, 2, 2, "F");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(`${emoji}  ${title}`, margin + 3, y + 1);
      y += 10;
    };

    // Title
    doc.setFillColor(124, 58, 237);
    doc.roundedRect(margin, y - 8, contentW, 20, 3, 3, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(fiche.titre, margin + 5, y + 5);
    y += 20;

    // Points clés
    addSection("Points clés", "⚡");
    fiche.points_cles.forEach((p, i) => {
      addText(`${i + 1}. ${p}`, 10, [50, 50, 50]);
    });

    // Définitions
    addSection("Définitions importantes", "📖");
    fiche.definitions.forEach((def) => {
      addText(`${def.terme}`, 10, [109, 40, 217], true);
      addText(def.definition, 9.5, [80, 80, 80]);
      y += 2;
    });

    // QCM
    addSection("QCM d'entraînement", "🧠");
    fiche.qcm.forEach((q, i) => {
      addText(`Q${i + 1}. ${q.question}`, 10, [30, 30, 30], true);
      q.options.forEach((opt) => {
        const isAnswer = opt.charAt(0) === q.reponse;
        addText(`  ${opt}${isAnswer ? " ✓" : ""}`, 9.5, isAnswer ? [22, 163, 74] : [100, 100, 100]);
      });
      y += 3;
    });

    doc.save(`fiche-${fiche.titre.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  const remaining = MAX_FREE_FICHES - ficheCount;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-3xl mb-4 shadow-lg">
            📝
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Fiche<span className="text-violet-600">Revision</span> AI
          </h1>
          <p className="text-gray-500 text-lg">
            Colle ton cours → reçois ta fiche en 30 secondes
          </p>
          <div className="mt-3 flex justify-center">
            <CounterBadge count={ficheCount} />
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Ton cours
            </label>
            <div className="flex items-center gap-2">
              {pdfFileName && (
                <span className="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-1 rounded-full">
                  📄 {pdfFileName}
                </span>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors border border-violet-200"
              >
                <span>📎</span> Upload PDF
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </div>
          </div>

          <textarea
            value={courseText}
            onChange={(e) => setCourseText(e.target.value)}
            placeholder="Colle ton cours ici… (notes de cours, chapitre de manuel, résumé de prof, etc.)"
            className="w-full h-52 px-4 py-3 rounded-2xl border border-gray-200 text-gray-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all placeholder-gray-400"
          />

          <div className="flex items-center justify-between mt-1 mb-4">
            <span className="text-xs text-gray-400">
              {courseText.length} caractères
            </span>
            {courseText && (
              <button
                onClick={() => { setCourseText(""); setPdfFileName(""); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Effacer
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || remaining === 0}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || remaining === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-purple-700 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération en cours…
              </>
            ) : remaining === 0 ? (
              "🔒 Limite atteinte"
            ) : (
              <>✨ Générer ma fiche</>
            )}
          </button>

          {remaining > 0 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              {remaining} génération{remaining > 1 ? "s" : ""} gratuite{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Fiche Output */}
        {loading && <LoadingSkeleton />}

        {fiche && !loading && (
          <div ref={ficheRef}>
            <FicheDisplay fiche={fiche} onDownload={handleDownloadPDF} />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Propulsé par Claude AI · Gratuit pour 3 fiches
        </p>
      </div>
    </div>
  );
}
