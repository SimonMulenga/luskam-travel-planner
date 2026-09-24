import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Post { id: string; slug: string; title: string; excerpt: string; body: string; cover_url: string | null; published_at: string | null; created_at: string }

const Blog = () => {
  const { slug } = useParams();
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    setPosts(null);
    let q = supabase.from("blog_posts").select("*").eq("published", true).order("published_at", { ascending: false });
    if (slug) q = q.eq("slug", slug);
    q.then(({ data }) => setPosts((data ?? []) as Post[]));
  }, [slug]);

  const date = (p: Post) => format(new Date(p.published_at ?? p.created_at), "dd MMM yyyy");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl py-12">
        {posts === null ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : slug ? (
          posts[0] ? (
            <article>
              <Link to="/blog" className="text-sm text-primary hover:underline">← All articles</Link>
              <h1 className="mt-4 text-3xl font-semibold text-primary sm:text-4xl">{posts[0].title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{date(posts[0])}</p>
              {posts[0].cover_url && <img src={posts[0].cover_url} alt="" className="mt-6 aspect-[16/9] w-full rounded-xl object-cover" />}
              <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
                {posts[0].body.split(/\n\s*\n/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
              </div>
            </article>
          ) : <p className="py-20 text-center text-muted-foreground">Article not found.</p>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-primary">Travel news & tips</h1>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {posts.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="overflow-hidden rounded-lg bg-card ring-1 ring-border transition-shadow hover:shadow-md">
                  {p.cover_url && <img src={p.cover_url} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />}
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">{date(p)}</p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
              {posts.length === 0 && <p className="text-muted-foreground">No articles yet — check back soon.</p>}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
