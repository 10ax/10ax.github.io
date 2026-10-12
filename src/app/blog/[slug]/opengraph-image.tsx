import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

// Required when `output: 'export'` is set in next.config.ts
export const dynamic = "force-static";

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? "Blog post";
  const date = post?.date ?? "";
  const tags = post?.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0f1116 0%, #08090b 100%)",
          color: "#e8eaed",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#3fbf94",
            fontSize: 28,
            fontFamily: "monospace",
          }}
        >
          $ cat ~/blog/{slug}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#fdfcfa",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 22,
                    fontFamily: "monospace",
                    color: "#e8eaed",
                    padding: "6px 14px",
                    border: "1px solid #0f1116",
                    borderRadius: 8,
                    background: "#050608",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#8b929c",
          }}
        >
          <span>Francesco Tenace · Blog</span>
          <span style={{ color: "#3fbf94", fontFamily: "monospace" }}>{date}</span>
        </div>
      </div>
    ),
    size,
  );
}
