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
const PRO_STORAGE_KEY = "fiche_pro";

function PlanBadge({ isPro, count }: { isPro: boolean; count: number }) {
  if (isPro) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-300">
        <span className="text-base">⚡</span>
        Plan Pro — fiches illimitées
      </div>
    );
  }

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

function ProUpgradeCard({ onUpgrade, loading }: { onUpgrade: (plan: "monthly" | "annual") => void; loading: boolean }) {
  return (
    <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-violet-200 text-sm font-medium mb-1">Tu as utilisé tes 3 fiches gratuites</p>
          <h3 className="text-xl font-extrabold mb-2">Passe au Plan Pro</h3>
          <ul className="space-y-1 text-sm text-violet-100 mb-4">
            <li>✓ Fiches illimitées</li>
            <li>✓ Accès prioritaire à Claude</li>
            <li>✓ Support dédié</li>
          </ul>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-extrabold">7€</span>
            <span className="text-violet-300">/mois</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onUpgrade("monthly")}
              disabled={loading}
              className="px-4 py-2.5 bg-white/20 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors disabled:opacity-60 text-sm"
            >
              7€/mois
            </button>
            <button
              onClick={() => onUpgrade("annual")}
              disabled={loading}
              className="px-4 py-2.5 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {loading ? "Redirection…" : <>⚡ 50€/an — économisez 20€</>}
            </button>
          </div>
        </div>
        <div className="text-6xl opacity-20 flex-shrink-0">🚀</div>
      </div>
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
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 text-violet-200 text-sm mb-2">
          <span>📚</span>
          <span>Fiche de révision</span>
        </div>
        <h2 className="text-2xl font-bold">{fiche.titre}</h2>
      </div>

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
                        {answered && letter === q.reponse && <span className="mr-1">✅</span>}
                        {answered && letter === selected && letter !== q.reponse && <span className="mr-1">❌</span>}
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

      <button
        onClick={onDownload}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <span>⬇️</span> Télécharger en PDF
      </button>
    </div>
  );
}

function PricingSection({
  isPro,
  onUpgrade,
  loading,
}: {
  isPro: boolean;
  onUpgrade: (plan: "monthly" | "annual") => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-2">
        Nos plans
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        Commence gratuitement, passe Pro quand tu es prêt.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Gratuit */}
        <div className="relative rounded-2xl border-2 border-gray-200 bg-white p-6 flex flex-col">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gratuit</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold text-gray-800">0€</span>
            <span className="text-gray-400 text-sm font-medium">/mois</span>
          </div>
          <p className="text-xs text-gray-400 mb-5">Pour découvrir l&apos;outil</p>

          <ul className="space-y-3 mb-8 flex-1">
            {[
              { ok: true,  text: "3 fiches par mois" },
              { ok: true,  text: "Génération de base" },
              { ok: true,  text: "Points clés + Définitions + QCM" },
              { ok: false, text: "Fiches illimitées" },
              { ok: false, text: "Téléchargement PDF" },
              { ok: false, text: "Support prioritaire" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.ok ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                }`}>
                  {item.ok ? "✓" : "✕"}
                </span>
                <span className={item.ok ? "text-gray-700" : "text-gray-400"}>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-gray-100 text-gray-400 cursor-default select-none">
            Plan actuel
          </div>
        </div>

        {/* Card Pro */}
        <div className="relative rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-6 flex flex-col shadow-xl">
          {/* Badge Recommandé */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
              ⭐ Recommandé
            </span>
          </div>

          <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3">Pro</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold text-gray-900">7€</span>
            <span className="text-gray-500 text-sm font-medium">/mois</span>
          </div>
          <p className="text-xs text-violet-400 mb-5">Tout ce qu&apos;il faut pour réviser</p>

          <ul className="space-y-3 mb-8 flex-1">
            {[
              "Fiches illimitées",
              "Génération avancée avec Claude AI",
              "Points clés + Définitions + QCM",
              "Téléchargement PDF",
              "Accès prioritaire",
              "Support prioritaire",
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span className="text-gray-700 font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="w-full py-3 rounded-xl text-center text-sm font-bold bg-violet-600 text-white">
              ⚡ Plan actif
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Bouton annuel — mis en avant */}
              <button
                onClick={() => onUpgrade("annual")}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirection…
                  </>
                ) : (
                  <>
                    ⚡ Annuel — 50€/an
                    <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      économisez 20€
                    </span>
                  </>
                )}
              </button>

              {/* Bouton mensuel — secondaire */}
              <button
                onClick={() => onUpgrade("monthly")}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-violet-300 text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Mensuel — 7€/mois
              </button>
            </div>
          )}
        </div>
      </div>
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [ficheCount, setFicheCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ficheRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFicheCount(parseInt(stored, 10));

    const proData = localStorage.getItem(PRO_STORAGE_KEY);
    if (proData) {
      try {
        const parsed = JSON.parse(proData);
        if (parsed.isPro) setIsPro(true);
      } catch {
        // invalid data, ignore
      }
    }
  }, []);

  const handleUpgrade = async (plan: "monthly" | "annual" = "monthly") => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Impossible de lancer le paiement. Réessaie.");
        setCheckoutLoading(false);
      }
    } catch {
      setError("Erreur lors de la connexion à Stripe.");
      setCheckoutLoading(false);
    }
  };

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
        setError(data.error || "Impossible de lire ce PDF.");
      }
    } catch {
      setError("Erreur lors de la lecture du PDF.");
    }
  };

  const handleGenerate = async () => {
    if (!isPro && ficheCount >= MAX_FREE_FICHES) {
      setError("Tu as utilisé tes 3 fiches gratuites.");
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

      if (!isPro) {
        const newCount = ficheCount + 1;
        setFicheCount(newCount);
        localStorage.setItem(STORAGE_KEY, String(newCount));
      }

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

    doc.setFillColor(124, 58, 237);
    doc.roundedRect(margin, y - 8, contentW, 20, 3, 3, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(fiche.titre, margin + 5, y + 5);
    y += 20;

    addSection("Points clés", "⚡");
    fiche.points_cles.forEach((p, i) => {
      addText(`${i + 1}. ${p}`, 10, [50, 50, 50]);
    });

    addSection("Définitions importantes", "📖");
    fiche.definitions.forEach((def) => {
      addText(`${def.terme}`, 10, [109, 40, 217], true);
      addText(def.definition, 9.5, [80, 80, 80]);
      y += 2;
    });

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

  const limitReached = !isPro && ficheCount >= MAX_FREE_FICHES;

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
            <PlanBadge isPro={isPro} count={ficheCount} />
          </div>
        </div>

        {/* Pro upgrade card when limit reached */}
        {limitReached && (
          <ProUpgradeCard onUpgrade={(plan) => handleUpgrade(plan)} loading={checkoutLoading} />
        )}

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
            <span className="text-xs text-gray-400">{courseText.length} caractères</span>
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
            onClick={limitReached ? () => handleUpgrade("monthly") : handleGenerate}
            disabled={loading || checkoutLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || checkoutLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : limitReached
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-purple-700 active:scale-[0.98]"
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
            ) : checkoutLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection vers Stripe…
              </>
            ) : limitReached ? (
              <>⚡ Passer Pro — 7€/mois</>
            ) : (
              <>✨ Générer ma fiche</>
            )}
          </button>

          {!isPro && !limitReached && (
            <p className="text-center text-xs text-gray-400 mt-3">
              {MAX_FREE_FICHES - ficheCount} génération{MAX_FREE_FICHES - ficheCount > 1 ? "s" : ""} gratuite{MAX_FREE_FICHES - ficheCount > 1 ? "s" : ""} restante{MAX_FREE_FICHES - ficheCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading && <LoadingSkeleton />}

        {fiche && !loading && (
          <div ref={ficheRef}>
            <FicheDisplay fiche={fiche} onDownload={handleDownloadPDF} />
          </div>
        )}

        {/* Pricing Section */}
        <div className="mt-12">
          <PricingSection isPro={isPro} onUpgrade={handleUpgrade} loading={checkoutLoading} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isPro ? "Plan Pro actif · Fiches illimitées" : "Gratuit · 3 fiches · Passe Pro pour illimité"}
        </p>
      </div>
    </div>
  );
}
