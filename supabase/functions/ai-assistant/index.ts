import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM = `You are Luskam Travel Assistant, an expert travel advisor for Luskam Travel Agents based in Lusaka, Zambia. You help travelers with:
- Visa requirements and application tips (especially from Zambia)
- Destination recommendations (Africa, Middle East, Europe, Asia)
- Flight, hotel and car booking guidance
- Kakande Ministries pilgrimage trips (monthly, from Zambia)
- Travel documents, vaccinations (yellow fever), and airport tips

Be concise, warm, and specific. When users ask to search flights or book, guide them to the site's Flights/Hotels/Cars/Visa pages. Never invent prices or fares — direct them to run a search. For contact, share WhatsApp +260 773 918 145.`;

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
        model: "google/gemini-3-flash-preview",
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
