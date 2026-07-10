import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SourceConfig = {
  owner: string;
  repo: string;
  defaultPath: string;
  basePath: string;
  mode: "raw" | "pages";
};

const sources: Record<string, SourceConfig> = {
  "tokomath-kids": { owner: "agung3956", repo: "tokomath-kids", defaultPath: "index.html", basePath: "", mode: "raw" },
  "nusantara-games": { owner: "agung3956", repo: "nusantara-games", defaultPath: "index.html", basePath: "", mode: "raw" },
  "family-mission": { owner: "agung3956", repo: "hadiah-anak", defaultPath: "public/index.html", basePath: "public/", mode: "raw" },
  "bintang-penjaga": { owner: "agung3956", repo: "bintang-penjaga", defaultPath: "index.html", basePath: "", mode: "pages" },
};

const personalNames = [
  "Agung Hermawan",
  "Agung",
  "Hermawan",
  "Andre",
  "Ibra",
  "Faris",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeText(value: string) {
  let next = value;
  for (const name of personalNames) {
    next = next.replace(new RegExp(escapeRegExp(name), "gi"), "Pengguna");
  }
  next = next
    .replace(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/gi, "")
    .replace(/window\.TOMBOL_HADIAH_API_URL\s*=\s*["'][^"']*["'];?/gi, 'window.TOMBOL_HADIAH_API_URL = "";');
  return next;
}

function contentType(path: string, upstream: string | null) {
  if (upstream) return upstream;
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".json") || path.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".mp3")) return "audio/mpeg";
  if (path.endsWith(".wav")) return "audio/wav";
  return "application/octet-stream";
}

function rewriteHtml(html: string, app: string, currentPath: string) {
  const prefix = `/api/community-source/${app}/`;
  const directory = currentPath.includes("/") ? currentPath.slice(0, currentPath.lastIndexOf("/") + 1) : "";
  const rewrite = (_match: string, attr: string, quote: string, url: string) => {
    if (/^(https?:|data:|mailto:|tel:|#|javascript:)/i.test(url)) return `${attr}=${quote}${url}${quote}`;
    const clean = url.replace(/^\.\//, "");
    const resolved = clean.startsWith("/") ? clean.slice(1) : `${directory}${clean}`;
    return `${attr}=${quote}${prefix}${resolved}${quote}`;
  };
  return html
    .replace(/(src|href)=(['"])([^'"]+)\2/gi, rewrite)
    .replace(/url\((['"]?)(?!https?:|data:)([^)'"\s]+)\1\)/gi, (_match, quote, url) => {
      const clean = String(url).replace(/^\.\//, "");
      const resolved = clean.startsWith("/") ? clean.slice(1) : `${directory}${clean}`;
      return `url(${quote}${prefix}${resolved}${quote})`;
    });
}

async function getUpstream(config: SourceConfig, path: string) {
  if (config.mode === "pages") {
    return `https://${config.owner}.github.io/${config.repo}/${path}`;
  }
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/main/${path}`;
}

export async function GET(_request: Request, context: { params: Promise<{ app: string; path?: string[] }> }) {
  const params = await context.params;
  const config = sources[params.app];
  if (!config) return NextResponse.json({ error: "Aplikasi tidak ditemukan." }, { status: 404 });

  const requested = params.path?.join("/") || config.defaultPath;
  const normalized = requested.includes("..") ? config.defaultPath : requested;
  const upstreamUrl = await getUpstream(config, normalized);

  try {
    const response = await fetch(upstreamUrl, {
      headers: { "user-agent": "bece.asia-community-app-proxy/1.0" },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return new NextResponse("Source app tidak dapat dimuat.", { status: response.status });
    }

    const type = contentType(normalized, response.headers.get("content-type"));
    const textual = /text|javascript|json|xml|svg/.test(type);
    if (!textual) {
      const data = await response.arrayBuffer();
      return new NextResponse(data, { headers: { "content-type": type, "cache-control": "public, max-age=300" } });
    }

    let text = sanitizeText(await response.text());
    if (type.includes("text/html")) text = rewriteHtml(text, params.app, normalized);
    return new NextResponse(text, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Source app tidak dapat dimuat.", { status: 502 });
  }
}
