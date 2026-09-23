import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Plane, ArrowRight, Radio, Loader2, Info } from "lucide-react";
import { airportLabel } from "@/data/flights";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { storeOffer, type SelectedOffer } from "@/lib/flightOffer";

interface ServerOffer extends SelectedOffer {
  live?: boolean;
}

const FlightsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const from = params.get("from") || "LUN";
  const to = params.get("to") || "JNB";
  const depart = params.get("depart") || format(new Date(), "yyyy-MM-dd");
  const ret = params.get("ret") || "";
  const cabin = params.get("cabin") || "Economy";
  const adults = parseInt(params.get("adults") || "1");
  const children = parseInt(params.get("children") || "0");
  const infants = parseInt(params.get("infants") || "0");
  const trip = params.get("trip") || "return";
  const totalPax = adults + children + infants;

  const [offers, setOffers] = useState<ServerOffer[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [sort, setSort] = useState<"price" | "duration" | "depart">("price");
  const [stopFilter, setStopFilter] = useState<"all" | "direct" | "1stop">("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotice(null);
    setOffers([]);
    supabase.functions
      .invoke("flight-search", {
        body: { from, to, depart, ret: ret || null, cabin, adults, children, infants },
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setNotice("Flight service is temporarily unavailable. Please try again shortly.");
          return;
        }
        const d = data as { flights?: ServerOffer[]; warning?: string; source?: string };
        setOffers(d?.flights ?? []);
        setSource(d?.source ?? "");
        if (d?.warning) setNotice(d.warning);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [from, to, depart, ret, cabin, adults, children, infants]);

  const filtered = useMemo(
    () =>
      offers
        .filter((o) =>
          stopFilter === "all" ? true : stopFilter === "direct" ? o.stops === "Direct" : o.stops !== "Direct",
        )
        .sort((a, b) => {
          if (sort === "price") return (a.price ?? Infinity) - (b.price ?? Infinity);
          if (sort === "depart") return a.depart.localeCompare(b.depart);
          return parseInt(a.duration) - parseInt(b.duration);
        }),
    [offers, sort, stopFilter],
  );

  const priced = filtered.filter((o) => o.priced).length;

  const select = (offer: ServerOffer) => {
    storeOffer(offer);
    const sp = new URLSearchParams(params);
    sp.set("offer", offer.id);
    navigate(`/checkout?${sp.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <div className="mb-6">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-primary">← Modify search</button>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {airportLabel(from)} <ArrowRight className="inline h-5 w-5 text-muted-foreground" /> {airportLabel(to)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(parseISO(depart), "EEE, dd MMM yyyy")}
            {ret && ` · Return ${format(parseISO(ret), "dd MMM yyyy")}`}
            {" · "}{totalPax} {totalPax === 1 ? "Traveler" : "Travelers"} · {cabin} · {trip === "return" ? "Round trip" : "One way"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-lg bg-card p-5 ring-1 ring-border">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stops</label>
              <div className="mt-2 space-y-2 text-sm">
                {([["all", "All flights"], ["direct", "Direct only"], ["1stop", "1 stop"]] as const).map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 text-foreground">
                    <input type="radio" name="stops" checked={stopFilter === v} onChange={() => setStopFilter(v)} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "price" | "duration" | "depart")}
                className="mt-2 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="price">Price (lowest)</option>
                <option value="duration">Duration</option>
                <option value="depart">Departure time</option>
              </select>
            </div>
          </aside>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {loading ? "Searching…" : `${filtered.length} results`}
                {priced > 0 && " · prices in USD per traveler"}
              </span>
              {loading ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking live availability…
                </span>
              ) : source === "live_fares" ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Radio className="h-3 w-3" /> Live fares
                </span>
              ) : source === "flight_information" ? (
                <span className="text-xs text-muted-foreground">Flight information — fares confirmed by our travel desk</span>
              ) : null}
            </div>

            {notice && !loading && (
              <div className="flex items-start gap-2 rounded-md bg-surface p-3 text-sm text-muted-foreground ring-1 ring-border">
                <Info className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="rounded-lg bg-card p-10 text-center ring-1 ring-border">
                <p className="text-sm text-muted-foreground">
                  No flights found for this route and date. Try a nearby date, or contact our travel desk and we'll source it for you.
                </p>
              </div>
            )}

            {filtered.map((r) => (
              <article key={r.id} className="grid grid-cols-12 items-center gap-4 rounded-lg bg-card px-5 py-5 ring-1 ring-border">
                <div className="col-span-12 flex items-center gap-3 sm:col-span-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{r.airline}</div>
                    <div className="text-xs text-muted-foreground">{r.code} · {r.fareType}</div>
                  </div>
                </div>
                <div className="col-span-12 flex items-center gap-4 sm:col-span-5">
                  <div>
                    <div className="text-base font-semibold text-foreground">{r.depart}</div>
                    <div className="text-xs text-muted-foreground">{r.from}</div>
                  </div>
                  <div className="flex flex-1 flex-col items-center">
                    <div className="text-[11px] text-muted-foreground">{r.duration}</div>
                    <div className="my-1 h-px w-full bg-border" />
                    <div className="text-[11px] text-muted-foreground">{r.stops}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-foreground">{r.arrive}</div>
                    <div className="text-xs text-muted-foreground">{r.to}</div>
                  </div>
                </div>
                <div className="col-span-7 sm:col-span-2 sm:text-right">
                  {r.priced && r.price != null ? (
                    <>
                      <div className="text-lg font-semibold text-foreground">${r.price * totalPax}</div>
                      <div className="text-xs text-muted-foreground">${r.price} × {totalPax}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-foreground">Fare on request</div>
                      <div className="text-xs text-muted-foreground">{r.status ?? "Schedule information"}</div>
                    </>
                  )}
                </div>
                <div className="col-span-5 flex justify-end sm:col-span-2">
                  <button
                    onClick={() => select(r)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                  >
                    {r.priced ? "Select" : "Request"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FlightsPage;
