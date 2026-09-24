import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.string().trim().email().max(255);

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) return toast.error("Please enter a valid email address");
    setBusy(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.toLowerCase() });
    setBusy(false);
    if (error && error.code !== "23505") return toast.error("Could not subscribe. Please try again.");
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="mt-3 flex max-w-xs gap-2">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
        className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <button disabled={busy} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {busy ? "…" : "Subscribe"}
      </button>
    </form>
  );
};
