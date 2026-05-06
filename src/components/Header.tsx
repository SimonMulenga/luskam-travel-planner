import { Link } from "react-router-dom";
import logo from "@/assets/luskam-logo.jpeg";

const nav = [
  { label: "Flights", to: "/#search" },
  { label: "Hotels", to: "/#search" },
  { label: "Cars", to: "/#search" },
  { label: "Visa", to: "/visa" },
  { label: "About", to: "/#about" },
  { label: "Contact", to: "/#contact" },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Luskam Travel Agents" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-primary">Luskam Travel Agents</div>
            <div className="text-[11px] text-muted-foreground">Experts at Adventure</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="tel:+260773918145" className="hidden text-sm font-medium text-primary hover:underline md:block">+260 773 918 145</a>
          <Link to="/visa" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">Apply for visa</Link>
        </div>
      </div>
    </header>
  );
};
