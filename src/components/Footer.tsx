import logo from "@/assets/luskam-logo.jpeg";

export const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border bg-background">
      <div className="container grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Luskam" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
            <div>
              <div className="text-sm font-semibold text-primary">Luskam Travel Agents</div>
              <div className="text-[11px] text-muted-foreground">Experts at Adventure</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Affordable. Reliable. Stress-free travel — flights, tours, accommodation and visa services.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Services</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#flights" className="hover:text-primary">Flights</a></li>
            <li><a href="#hotels" className="hover:text-primary">Hotels</a></li>
            <li><a href="#cars" className="hover:text-primary">Car rentals</a></li>
            <li><a href="#visa" className="hover:text-primary">Visa applications</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#about" className="hover:text-primary">About us</a></li>
            <li><a href="#contact" className="hover:text-primary">Contact</a></li>
            <li><a href="#" className="hover:text-primary">Terms</a></li>
            <li><a href="#" className="hover:text-primary">Privacy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>+260 773 918 145</li>
            <li>luskamtravelagents@gmail.com</li>
            <li>Lusaka, Zambia</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Luskam Travel Agents. All rights reserved.</p>
          <p>Registered travel agency · Zambia</p>
        </div>
      </div>
    </footer>
  );
};
