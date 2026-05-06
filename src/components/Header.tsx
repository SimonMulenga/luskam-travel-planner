import logo from "@/assets/luskam-logo.jpeg";

const nav = [
  { label: "Flights", href: "#flights" },
  { label: "Hotels", href: "#hotels" },
  { label: "Cars", href: "#cars" },
  { label: "Visa", href: "#visa" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Luskam Travel Agents" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-primary">Luskam Travel Agents</div>
            <div className="text-[11px] text-muted-foreground">Experts at Adventure</div>
          </div>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="hidden text-sm font-medium text-primary hover:underline md:block">+260 773 918 145</a>
          <a href="#account" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">Sign in</a>
        </div>
      </div>
    </header>
  );
};
