import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Plane, ArrowRight } from "lucide-react";
import { generateFlights, airportLabel } from "@/data/flights";
import { format, parseISO } from "date-fns";

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

  const offers = useMemo(() => generateFlights(from, to, depart, cabin), [from, to, depart, cabin]);
  const [sort, setSort] = useState<"price" | "duration" | "depart">("price");
  const [stopFilter, setStopFilter] = useState<"all" | "direct" | "1stop">("all");

  const filtered = offers
    .filter((o) => (stopFilter === "all" ? true : stopFilter === "direct" ? o.stops === "Direct" : o.stops !== "Direct"))
    .sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "depart") return a.depart.localeCompare(b.depart);
      return parseInt(a.duration) - parseInt(b.duration);
    });

  const select = (id: string) => {
    const sp = new URLSearchParams(params);
    sp.set("offer", id);
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
            <div className="text-sm text-muted-foreground">{filtered.length} results · prices in USD per traveler</div>
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
                  <div className="text-lg font-semibold text-foreground">${r.price * totalPax}</div>
                  <div className="text-xs text-muted-foreground">${r.price} × {totalPax}</div>
                </div>
                <div className="col-span-5 flex justify-end sm:col-span-2">
                  <button
                    onClick={() => select(r.id)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                  >
                    Select
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
