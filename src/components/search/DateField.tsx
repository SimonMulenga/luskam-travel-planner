import { Calendar as CalIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value?: Date;
  onChange: (d: Date | undefined) => void;
  minDate?: Date;
  disabled?: boolean;
}

export const DateField = ({ label, value, onChange, minDate, disabled }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "block w-full rounded-md bg-surface px-3.5 py-2.5 text-left ring-1 ring-border hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <div className="mt-1 flex items-center gap-2">
            <CalIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {value ? format(value, "EEE, dd MMM yyyy") : "Select date"}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(d) => (minDate ? d < minDate : d < new Date(new Date().setHours(0, 0, 0, 0)))}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};
