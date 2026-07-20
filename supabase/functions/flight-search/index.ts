import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Req {
  from?: string;
  to?: string;
  depart?: string;
  cabin?: string;
}

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function callAviationstack(key: string, from: string, to: string, depart?: string) {
  const url = new URL("https://api.aviationstack.com/v1/flights");
  url.searchParams.set("access_key", key);
  url.searchParams.set("dep_iata", from);
  url.searchParams.set("arr_iata", to);
  url.searchParams.set("limit", "30");
  if (depart) url.searchParams.set("flight_date", depart);

  // 1 retry on transient failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await fetchWithTimeout(url.toString(), TIMEOUT_MS);
      const json = await resp.json();
      if (json?.error) {
        if (attempt === 1) return { ok: false, message: json.error.message ?? "Provider error" };
        continue;
      }
      return { ok: true, data: json.data ?? [] };
    } catch (e) {
      if (attempt === 1) return { ok: false, message: (e as Error).message };
    }
  }
  return { ok: false, message: "Unavailable" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("AVIATIONSTACK_API_KEY");
    const { from, to, depart, cabin }: Req = await req.json();
    if (!from || !to) {
      return new Response(JSON.stringify({ error: "from and to required", flights: [] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!key) {
      // Soft failure: no live provider — the client keeps its generated offers.
      return new Response(JSON.stringify({ flights: [], warning: "Live schedules not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromCode = from.toUpperCase().slice(0, 3);
    const toCode = to.toUpperCase().slice(0, 3);
    const result = await callAviationstack(key, fromCode, toCode, depart);
    if (!result.ok) {
      // Soft failure: return empty so the client falls back to indicative offers, still 200.
      return new Response(JSON.stringify({ flights: [], warning: result.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cabinMult: Record<string, number> = {
      Economy: 1,
      "Premium Economy": 1.6,
      Business: 3.2,
      First: 5.5,
    };
    const mult = cabinMult[cabin ?? "Economy"] ?? 1;

    const seen = new Set<string>();
    const flights = (result.data as Array<Record<string, unknown>>)
      .map((f, i: number) => {
        const dep = f.departure as { scheduled?: string; estimated?: string; iata?: string } | undefined;
        const arr = f.arrival as { scheduled?: string; estimated?: string; iata?: string } | undefined;
        const flight = f.flight as { iata?: string; icao?: string } | undefined;
        const airline = f.airline as { name?: string; iata?: string } | undefined;

        const depIso = dep?.scheduled ?? dep?.estimated;
        const arrIso = arr?.scheduled ?? arr?.estimated;
        if (!depIso || !arrIso) return null;
        const depDate = new Date(depIso);
        const arrDate = new Date(arrIso);
        const durationMin = Math.max(30, Math.round((arrDate.getTime() - depDate.getTime()) / 60000));
        if (durationMin > 60 * 30) return null; // ignore multi-day anomalies

        const fmt = (d: Date) =>
          `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;

        const code = flight?.iata ?? flight?.icao ?? `FL${i}`;
        if (seen.has(code)) return null;
        seen.add(code);

        const basePrice = Math.round((180 + durationMin * 0.9) * mult);
        return {
          id: `live-${code}-${i}`,
          airline: airline?.name ?? "Scheduled carrier",
          code,
          from: dep?.iata ?? fromCode,
          to: arr?.iata ?? toCode,
          depart: fmt(depDate),
          arrive: fmt(arrDate),
          duration: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
          stops: "Direct",
          cabin: cabin ?? "Economy",
          price: basePrice,
          fareType: "Economy Semi-Flex",
          live: true,
          status: (f.flight_status as string) ?? "scheduled",
        };
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ flights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    // Never hard-fail — client will fall back to indicative offers.
    return new Response(JSON.stringify({ flights: [], warning: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
