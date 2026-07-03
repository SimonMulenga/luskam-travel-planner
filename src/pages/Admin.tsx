import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, type AppRole } from "@/hooks/useRoles";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Shield, Users, Package, TrendingUp, UserPlus, Trash2 } from "lucide-react";

interface Booking {
  id: string;
  user_id: string;
  type: string;
  reference: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  travel_date: string | null;
  created_at: string;
  details: Record<string, unknown>;
}

interface RoleRow {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
  full_name?: string;
}

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isAgent, loading: rolesLoading } = useRoles();
  const [tab, setTab] = useState<"bookings" | "team">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roleRows, setRoleRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: b } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setBookings((b ?? []) as Booking[]);

    if (isAdmin) {
      const { data: r } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
      const rows = (r ?? []) as RoleRow[];
      // Enrich with profile info
      const ids = [...new Set(rows.map((x) => x.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        const map = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
        rows.forEach((r) => (r.full_name = map.get(r.user_id) ?? undefined));
      }
      setRoleRows(rows);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !rolesLoading && (isAdmin || isAgent)) load();
  }, [authLoading, rolesLoading, isAdmin, isAgent]);

  if (authLoading || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin && !isAgent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Restricted</h1>
          <p className="mt-1 text-sm text-muted-foreground">You don't have access to the admin dashboard.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const filtered = bookings.filter(
    (b) => (statusFilter === "all" || b.status === statusFilter) && (typeFilter === "all" || b.type === typeFilter),
  );
  const revenue = filtered.reduce((s, b) => s + Number(b.total_amount), 0);
  const paidRevenue = filtered.filter((b) => b.payment_status === "paid").reduce((s, b) => s + Number(b.total_amount), 0);

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking updated");
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const updatePayment = async (id: string, payment_status: string) => {
    const { error } = await supabase.from("bookings").update({ payment_status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Payment updated");
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, payment_status } : b)));
  };

  const assignAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newAgentEmail.trim().toLowerCase();
    if (!email) return;
    setAssigning(true);
    try {
      // Look up user via profiles is not possible without auth admin; instead ask them to sign up first.
      // We use an RPC-less lookup: profiles table doesn't have email. So we query auth via a lightweight approach —
      // require the user to have a profile row that we can match by full_name is fragile. Instead, we ask the
      // director to have the agent sign up first, then we search by exact email using an edge admin function.
      // For now, we insert by asking the user to paste the user_id.
      // Simpler UX: try to find the user by scanning profiles.full_name won't work — use email match through a lookup edge fn.
      const { data, error } = await supabase.functions.invoke("assign-agent", { body: { email } });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast.success("Agent assigned");
      setNewAgentEmail("");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  const removeRole = async (id: string) => {
    if (!confirm("Remove this role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    setRoleRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin ? "Director access" : "Sales agent access"} · {bookings.length} bookings
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={<Package className="h-4 w-4" />} label="Total bookings" value={filtered.length.toString()} />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Booked value" value={`$${revenue.toLocaleString()}`} />
          <StatCard icon={<Users className="h-4 w-4" />} label="Paid" value={`$${paidRevenue.toLocaleString()}`} />
        </div>

        <div className="mt-8 flex gap-4 border-b border-border">
          <button
            onClick={() => setTab("bookings")}
            className={`border-b-2 px-1 pb-3 text-sm font-medium ${tab === "bookings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Bookings & Reservations
          </button>
          {isAdmin && (
            <button
              onClick={() => setTab("team")}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${tab === "team" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Team & Roles
            </button>
          )}
        </div>

        {tab === "bookings" && (
          <>
            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              >
                <option value="all">All types</option>
                <option value="flight">Flights</option>
                <option value="hotel">Hotels</option>
                <option value="car">Cars</option>
                <option value="visa">Visa</option>
                <option value="kakande">Kakande</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg bg-card ring-1 ring-border">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">No bookings match these filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Travel date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((b) => (
                        <tr key={b.id}>
                          <td className="px-4 py-3 font-mono text-xs text-foreground">{b.reference}</td>
                          <td className="px-4 py-3 capitalize text-foreground">{b.type}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {b.travel_date ? format(new Date(b.travel_date), "dd MMM yyyy") : "—"}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {b.currency} {Number(b.total_amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={b.status}
                              onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="completed">completed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={b.payment_status}
                              onChange={(e) => updatePayment(b.id, e.target.value)}
                              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                            >
                              <option value="pending">pending</option>
                              <option value="paid">paid</option>
                              <option value="refunded">refunded</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {format(new Date(b.created_at), "dd MMM, HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "team" && isAdmin && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={assignAgent} className="rounded-lg bg-card p-5 ring-1 ring-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserPlus className="h-4 w-4" /> Assign a sales agent
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The person must have already signed up on the site. Enter the email they used.
              </p>
              <input
                type="email"
                required
                value={newAgentEmail}
                onChange={(e) => setNewAgentEmail(e.target.value)}
                placeholder="agent@example.com"
                className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={assigning}
                className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {assigning ? "Assigning…" : "Grant agent access"}
              </button>
            </form>

            <div className="overflow-hidden rounded-lg bg-card ring-1 ring-border">
              <div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">Team members</div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Since</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roleRows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-foreground">{r.full_name ?? <span className="font-mono text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</span>}</td>
                      <td className="px-4 py-3 capitalize text-foreground">{r.role}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(r.created_at), "dd MMM yyyy")}</td>
                      <td className="px-4 py-3 text-right">
                        {r.role !== "admin" && (
                          <button
                            onClick={() => removeRole(r.id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            <Trash2 className="inline h-3.5 w-3.5" /> Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {roleRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No team members yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg bg-card p-5 ring-1 ring-border">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
      {icon} {label}
    </div>
    <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
  </div>
);

export default AdminPage;
