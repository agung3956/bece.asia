import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScrapeMode = "google-news" | "rss" | "urls";

type ScrapeRequest = {
  mode?: ScrapeMode;
  query?: string;
  rssUrl?: string;
  urls?: string[];
  limit?: number;
};

type ScrapedItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  excerpt: string;
};

const USER_AGENT = "Mozilla/5.0 (compatible; bece.asia PublicNewsMonitor/1.0; +https://www.bece.asia)";

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

function textBetween(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeEntities(stripTags(match?.[1] ?? ""));
}

function attrValue(block: string, attr: string) {
  const match = block.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
  return decodeEntities(match?.[1] ?? "");
}

function normalizeUrl(value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return "";
  }
}

function sourceFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown source";
  }
}

function parseGoogleNewsLink(value: string) {
  try {
    const url = new URL(value);
    const nested = url.searchParams.get("url");
    if (nested) return nested;
    return value;
  } catch {
    return value;
  }
}

function parseRss(xml: string, limit: number): ScrapedItem[] {
  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entryBlocks = itemBlocks.length > 0 ? itemBlocks : [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);

  return entryBlocks.slice(0, limit).map((block, index) => {
    const title = textBetween(block, "title") || `Untitled ${index + 1}`;
    const rawLink = textBetween(block, "link") || attrValue(block.match(/<link[^>]*>/i)?.[0] ?? "", "href");
    const url = normalizeUrl(parseGoogleNewsLink(rawLink));
    const pubDate = textBetween(block, "pubDate") || textBetween(block, "published") || textBetween(block, "updated");
    const description = textBetween(block, "description") || textBetween(block, "summary") || textBetween(block, "content");
    const source = textBetween(block, "source") || sourceFromUrl(url);

    return {
      id: `${Date.now()}-${index}-${title}`,
      title,
      source,
      url,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      excerpt: description,
    };
  });
}

function extractMeta(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(stripTags(match[1]));
  }
  return "";
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    next: { revalidate: 0 },
  });
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.text();
}

async function fetchArticle(url: string, index: number): Promise<ScrapedItem | null> {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;
  try {
    const html = await fetchText(normalized);
    const title = extractMeta(html, "og:title") || textBetween(html, "title") || sourceFromUrl(normalized);
    const excerpt = extractMeta(html, "og:description") || extractMeta(html, "description") || stripTags(html).slice(0, 260);
    return {
      id: `${Date.now()}-url-${index}`,
      title,
      source: sourceFromUrl(normalized),
      url: normalized,
      publishedAt: new Date().toISOString(),
      excerpt,
    };
  } catch {
    return {
      id: `${Date.now()}-url-${index}`,
      title: sourceFromUrl(normalized),
      source: sourceFromUrl(normalized),
      url: normalized,
      publishedAt: new Date().toISOString(),
      excerpt: "Konten halaman tidak dapat dibaca otomatis. Simpan URL untuk dianalisis manual.",
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScrapeRequest;
    const mode = body.mode ?? "google-news";
    const limit = Math.min(Math.max(Number(body.limit || 20), 1), 50);

    if (mode === "google-news") {
      const query = (body.query ?? "").trim();
      if (!query) return NextResponse.json({ error: "Query wajib diisi." }, { status: 400 });
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
      const xml = await fetchText(url);
      return NextResponse.json({ items: parseRss(xml, limit), sourceUrl: url });
    }

    if (mode === "rss") {
      const rssUrl = normalizeUrl(body.rssUrl ?? "");
      if (!rssUrl) return NextResponse.json({ error: "RSS URL tidak valid." }, { status: 400 });
      const xml = await fetchText(rssUrl);
      return NextResponse.json({ items: parseRss(xml, limit), sourceUrl: rssUrl });
    }

    const urls = (body.urls ?? []).map(normalizeUrl).filter(Boolean).slice(0, limit);
    if (urls.length === 0) return NextResponse.json({ error: "Daftar URL kosong." }, { status: 400 });
    const items = (await Promise.all(urls.map(fetchArticle))).filter((item): item is ScrapedItem => Boolean(item));
    return NextResponse.json({ items, sourceUrl: "manual-url-list" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Scraping gagal." }, { status: 500 });
  }
}
