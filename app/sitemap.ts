import type { MetadataRoute } from "next";
import { apps } from "@/data/apps";
import { businessToolsApps } from "@/data/business-tools-apps";
import { communityGamesApps } from "@/data/community-games-apps";
import { creativeBusinessApps } from "@/data/creative-business-apps";
import { attendanceApps } from "@/data/attendance-apps";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.bece.asia";
  const now = new Date();
  const core = ["", "/apps", "/utilities", "/roadmap", "/feedback", "/privacy", "/terms", "/disclaimer", "/data-policy"];
  const catalog = [...apps, ...businessToolsApps, ...creativeBusinessApps, ...communityGamesApps, ...attendanceApps];
  return [
    ...core.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...catalog.map((item) => ({ url: `${base}${item.url}`, lastModified: new Date(item.lastUpdated), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
