import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
    }

    const { plan } = await request.json().catch(() => ({ plan: "monthly" }));
    const isAnnual = plan === "annual";

    const priceId = isAnnual
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Price ID manquant." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
