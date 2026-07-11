import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/"] },
    ],
    sitemap: "https://www.bece.asia/sitemap.xml",
    host: "https://www.bece.asia",
  };
}
