"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const PRO_STORAGE_KEY = "fiche_pro";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/stripe/verify?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          localStorage.setItem(
            PRO_STORAGE_KEY,
            JSON.stringify({
              isPro: true,
              email: data.email,
              customerId: data.customerId,
              subscriptionId: data.subscriptionId,
              activatedAt: Date.now(),
            })
          );
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-gray-500 font-medium">Vérification du paiement…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">Une erreur est survenue</h2>
        <p className="text-gray-500 text-center">
          Impossible de vérifier ton paiement. Contacte le support.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">
        ✅
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900">
        Bienvenue dans le plan Pro !
      </h2>
      <p className="text-gray-500 text-center max-w-sm">
        Ton abonnement est actif. Tu peux maintenant générer des fiches illimitées.
      </p>
      <div className="bg-violet-50 border border-violet-200 rounded-2xl px-6 py-4 text-center">
        <p className="text-violet-800 font-semibold text-sm">
          ✨ Fiches illimitées débloquées
        </p>
      </div>
      <button
        onClick={() => router.push("/")}
        className="mt-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
      >
        Générer ma première fiche Pro →
      </button>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-10 w-full max-w-md text-center">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
              <p className="text-gray-500">Chargement…</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
