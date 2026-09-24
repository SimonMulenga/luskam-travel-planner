import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteContent = () => {
  const { data } = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("key, value");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
    },
    staleTime: 60_000,
  });
  const get = (key: string, fallback: string) => (data?.[key]?.trim() ? data[key] : fallback);
  return { content: data ?? {}, get };
};

/** Uploads a file to the site media store and returns a long-lived URL. */
export const uploadSiteImage = async (file: File, folder = "images") => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage
    .from("site-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (sErr || !data) throw sErr ?? new Error("Could not create image link");
  return data.signedUrl;
};
