import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Req {
  from?: string;
  to?: string;
  depart?: string;
  cabin?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("AVIATIONSTACK_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "AVIATIONSTACK_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { from, to, depart, cabin }: Req = await req.json();
    if (!from || !to) {
      return new Response(JSON.stringify({ error: "from and to required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aviationstack /flights endpoint. Free tier has limits, no date filter.
    const url = new URL("https://api.aviationstack.com/v1/flights");
    url.searchParams.set("access_key", key);
    url.searchParams.set("dep_iata", from);
    url.searchParams.set("arr_iata", to);
    url.searchParams.set("limit", "20");
    if (depart) url.searchParams.set("flight_date", depart);

    const resp = await fetch(url.toString());
    const json = await resp.json();

    if (json.error) {
      return new Response(JSON.stringify({ error: json.error.message ?? "Provider error", data: [] }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map to our FlightOffer shape. Aviationstack provides schedules only (no prices),
    // so we derive an indicative price from great-circle-ish heuristics + cabin.
    const cabinMult: Record<string, number> = {
      Economy: 1,
      "Premium Economy": 1.6,
      Business: 3.2,
      First: 5.5,
    };
    const mult = cabinMult[cabin ?? "Economy"] ?? 1;

    const flights = (json.data ?? []).map((f: any, i: number) => {
      const depIso = f.departure?.scheduled ?? f.departure?.estimated;
      const arrIso = f.arrival?.scheduled ?? f.arrival?.estimated;
      const dep = depIso ? new Date(depIso) : null;
      const arr = arrIso ? new Date(arrIso) : null;
      const durationMin = dep && arr ? Math.max(30, Math.round((arr.getTime() - dep.getTime()) / 60000)) : 120;
      const hh = String(dep?.getUTCHours() ?? 0).padStart(2, "0");
      const mm = String(dep?.getUTCMinutes() ?? 0).padStart(2, "0");
      const ahh = String(arr?.getUTCHours() ?? 0).padStart(2, "0");
      const amm = String(arr?.getUTCMinutes() ?? 0).padStart(2, "0");
      const basePrice = Math.round((180 + durationMin * 0.9) * mult);
      return {
        id: `${f.flight?.iata ?? f.airline?.iata ?? "FL"}-${i}`,
        airline: f.airline?.name ?? "Unknown",
        code: f.flight?.iata ?? f.flight?.icao ?? "—",
        from: f.departure?.iata ?? from,
        to: f.arrival?.iata ?? to,
        depart: `${hh}:${mm}`,
        arrive: `${ahh}:${amm}`,
        duration: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
        stops: "Direct",
        cabin: cabin ?? "Economy",
        price: basePrice,
        fareType: "Economy Semi-Flex",
        live: true,
        status: f.flight_status,
      };
    });

    return new Response(JSON.stringify({ flights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
