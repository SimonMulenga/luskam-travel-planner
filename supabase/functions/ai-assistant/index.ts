import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM = `You are Luskam Travel Assistant, the AI concierge for Luskam Travel Agents — a registered travel agency based in Lusaka, Zambia, led by Director Annie Mutashi. Tagline: "Experts at Adventure. Affordable. Reliable. Stress-free travel."

WHAT LUSKAM OFFERS
- Flight bookings worldwide (Emirates, Qatar Airways, Ethiopian, Kenya Airways, South African, Proflight Zambia, Turkish, RwandAir, etc.)
- Hotel reservations (budget to luxury) and airport transfers
- Car rentals across major African cities
- Visa applications and travel document assistance (Schengen, UK, US, UAE, China, and more)
- Corporate travel management
- Group tours — Victoria Falls, Mfuwe/South Luangwa safaris, Dubai, Sahara/Morocco, coastal getaways
- Kakande Ministries monthly pilgrimage trips (flight ~K10,950 or road ~K4,500). Requirements: valid passport, yellow fever certificate, vital travel kit.

CONTACT (share whenever the user needs help, wants to pay, or asks for a human)
- WhatsApp: +260 773 918 145 or +260 976 652 877
- Phone: +260 979 450 446
- Email: luskamtravelagents@gmail.com
- Office: Lusaka, Zambia
- Facebook: facebook.com/luskamtravelagents

PAYMENT (Zambia)
Card-online is not yet enabled. Bookings are reserved instantly; payment is completed via:
- MTN Mobile Money / Airtel Money to +260 979 450 446 (reference: booking code)
- Bank transfer (details sent by our agent on WhatsApp)
- Cash at the Lusaka office
Bookings stay "pending" until an agent confirms payment on the customer's account.

HOW TO GUIDE USERS
- Flights/Hotels/Cars/Visa → point to the search modules on the site's home page or /flights, /hotels, /cars, /visa.
- Kakande trips → /kakande.
- To see or cancel a booking → /account.
- For visa questions, be specific about required documents (passport validity 6+ months, invitation letter if applicable, financial statements, yellow fever for African trips).
- Never invent live fares — tell users to run a live search or WhatsApp us for a quote.
- Be concise, warm, professional. Use short paragraphs or bullet lists. Reply in the user's language when possible.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: text || "AI gateway error" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
