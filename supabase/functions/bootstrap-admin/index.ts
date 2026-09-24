import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async () => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const email = "luskamtravelagents@gmail.com";
  let userId: string | undefined;
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users.find((u) => (u.email ?? "").toLowerCase() === email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password: "Admin@2026", email_confirm: true });
    userId = existing.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email, password: "Admin@2026", email_confirm: true, user_metadata: { full_name: "Luskam Admin" },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    userId = data.user.id;
  }
  const { error: rErr } = await admin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  return new Response(JSON.stringify({ ok: !rErr, roleError: rErr?.message ?? null }));
});
