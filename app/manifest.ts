import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bece.asia",
    short_name: "bece.asia",
    description: "Public digital tools for productivity, learning, research, documents, and workflows.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fc",
    theme_color: "#001b4d",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
