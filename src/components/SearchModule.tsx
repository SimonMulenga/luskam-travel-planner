import { useState } from "react";
import { Plane, Hotel, Car, Calendar, MapPin, Users, Search, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "flights" | "hotels" | "cars";

const tabs: { id: Tab; label: string; icon: typeof Plane }[] = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "cars", label: "Car Rentals", icon: Car },
];

const Field = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) => (
  <label className="block rounded-md bg-surface px-3.5 py-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/40">
    <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="w-full">{children}</div>
    </div>
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
  />
);

export const SearchModule = () => {
  const [tab, setTab] = useState<Tab>("flights");
  const [tripType, setTripType] = useState<"return" | "oneway" | "multi">("return");

  return (
    <section className="w-full">
      <div className="rounded-xl bg-card shadow-lg ring-1 ring-border">
        {/* Tabs */}
        <div role="tablist" className="flex border-b border-border">
          {tabs.map((t) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {active && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {tab === "flights" && (
            <>
              <div className="mb-4 flex flex-wrap gap-1 text-sm">
                {([
                  ["return", "Return"],
                  ["oneway", "One way"],
                  ["multi", "Multi-city"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setTripType(id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-medium transition-colors",
                      tripType === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <Field label="From" icon={MapPin}>
                    <Input placeholder="Lusaka (LUN)" defaultValue="Lusaka, Zambia" />
                  </Field>
                </div>
                <div className="hidden items-end justify-center md:flex md:col-span-[0.5]">
                  <button className="mb-3 rounded-full border border-border bg-background p-2 text-muted-foreground hover:text-primary" aria-label="Swap">
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="md:col-span-3">
                  <Field label="To" icon={MapPin}>
                    <Input placeholder="Destination" defaultValue="Dubai, UAE" />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Departure" icon={Calendar}>
                    <Input type="date" defaultValue="2026-05-20" />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Return" icon={Calendar}>
                    <Input type="date" defaultValue="2026-05-28" disabled={tripType === "oneway"} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Passengers" icon={Users}>
                    <Input defaultValue="1 Adult, Economy" />
                  </Field>
                </div>
              </div>
            </>
          )}

          {tab === "hotels" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <Field label="Destination" icon={MapPin}>
                  <Input placeholder="City, hotel, area" defaultValue="Cape Town, South Africa" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Check-in" icon={Calendar}>
                  <Input type="date" defaultValue="2026-06-10" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Check-out" icon={Calendar}>
                  <Input type="date" defaultValue="2026-06-14" />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="Guests & rooms" icon={Users}>
                  <Input defaultValue="2 Adults, 1 Room" />
                </Field>
              </div>
            </div>
          )}

          {tab === "cars" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-6">
                <Field label="Pick-up location" icon={MapPin}>
                  <Input placeholder="Airport or city" defaultValue="Kenneth Kaunda Intl. Airport" />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="Pick-up date & time" icon={Calendar}>
                  <Input type="datetime-local" defaultValue="2026-05-20T10:00" />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="Drop-off date & time" icon={Calendar}>
                  <Input type="datetime-local" defaultValue="2026-05-25T10:00" />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-[hsl(var(--accent-hover))]">
              <Search className="h-4 w-4" />
              {tab === "flights" ? "Search Flights" : tab === "hotels" ? "Search Hotels" : "Search Cars"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
