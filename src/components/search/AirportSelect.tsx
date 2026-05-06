import { useEffect, useRef, useState } from "react";
import { MapPin, Plane } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { findAirport, getAirport } from "@/data/airports";

interface Props {
  label: string;
  value: string; // IATA code
  onChange: (code: string) => void;
}

export const AirportSelect = ({ label, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const ap = getAirport(value);
  const list = findAirport(q);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="block w-full rounded-md bg-surface px-3.5 py-2.5 text-left ring-1 ring-border hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <div className="mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-semibold text-foreground">
              {ap ? `${ap.city} (${ap.code})` : "Select airport"}
            </span>
          </div>
          {ap && <div className="mt-0.5 truncate pl-6 text-[11px] text-muted-foreground">{ap.country}</div>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <div className="border-b border-border p-2">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="City, airport or country"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <ul className="max-h-72 overflow-auto py-1">
          {list.map((a) => (
            <li key={a.code}>
              <button
                type="button"
                onClick={() => {
                  onChange(a.code);
                  setOpen(false);
                  setQ("");
                }}
                className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-muted"
              >
                <Plane className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{a.city}</span>
                    <span className="shrink-0 text-xs font-mono text-muted-foreground">{a.code}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{a.name} · {a.country}</div>
                </div>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="px-3 py-4 text-sm text-muted-foreground">No matches</li>}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
