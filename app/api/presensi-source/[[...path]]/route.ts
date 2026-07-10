import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SOURCE_ORIGIN = "https://presensibcpapin.netlify.app";

const identityReplacements: Array<[RegExp, string]> = [
  [/Bea\s*Cukai\s*Pangkal\s*Pinang/gi, "Attendance Workspace"],
  [/Bea\s*Cukai\s*Pangkalpinang/gi, "Attendance Workspace"],
  [/KPPBC\s*TMP\s*C\s*Pangkal\s*Pinang/gi, "Attendance Workspace"],
  [/KPPBC\s*TMP\s*C\s*Pangkalpinang/gi, "Attendance Workspace"],
  [/Kantor\s+Bea\s+Cukai[^<\n]*/gi, "Attendance Workspace"],
  [/Direktorat\s+Jenderal\s+Bea\s+dan\s+Cukai/gi, "Public Attendance Workspace"],
  [/Kementerian\s+Keuangan/gi, "Public Workspace"],
  [/\bDJBC\b/gi, "Workspace"],
  [/\bBC\s*Pangkalpinang\b/gi, "Attendance Workspace"],
  [/\bBC\s*Pangkal\s*Pinang\b/gi, "Attendance Workspace"],
  [/presensibcpapin/gi, "attendance-workspace"],
  [/bcpapin/gi, "workspace"],
];

function sanitizeText(value: string) {
  let next = value;
  for (const [pattern, replacement] of identityReplacements) next = next.replace(pattern, replacement);
  next = next
    .replace(/[A-Z0-9._%+-]+@(?:beacukai|kemenkeu)\.go\.id/gi, "sample@example.com")
    .replace(/https?:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/gi, "")
    .replace(/https?:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+[^"'\s<]*/gi, "");
  return next;
}

function contentType(path: string, upstream: string | null) {
  const clean = path.toLowerCase().split("?")[0].split("#")[0];
  if (clean.endsWith(".html") || clean.endsWith(".htm") || clean === "") return "text/html; charset=utf-8";
  if (clean.endsWith(".js") || clean.endsWith(".mjs")) return "application/javascript; charset=utf-8";
  if (clean.endsWith(".css")) return "text/css; charset=utf-8";
  if (clean.endsWith(".json") || clean.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".ico")) return "image/x-icon";
  if (clean.endsWith(".woff2")) return "font/woff2";
  if (clean.endsWith(".woff")) return "font/woff";
  if (clean.endsWith(".ttf")) return "font/ttf";
  return upstream || "application/octet-stream";
}

function runtimeSanitizer() {
  return `<script>
+(function sanitizeAttendanceWorkspace(){
+  const identityPatterns = [
+    [/Bea\\s*Cukai\\s*Pangkal\\s*Pinang/gi, 'Attendance Workspace'],
+    [/Bea\\s*Cukai\\s*Pangkalpinang/gi, 'Attendance Workspace'],
+    [/KPPBC\\s*TMP\\s*C\\s*Pangkal\\s*Pinang/gi, 'Attendance Workspace'],
+    [/KPPBC\\s*TMP\\s*C\\s*Pangkalpinang/gi, 'Attendance Workspace'],
+    [/Direktorat\\s+Jenderal\\s+Bea\\s+dan\\s+Cukai/gi, 'Public Attendance Workspace'],
+    [/Kementerian\\s+Keuangan/gi, 'Public Workspace'],
+    [/\\bDJBC\\b/gi, 'Workspace'],
+    [/presensibcpapin/gi, 'attendance-workspace'],
+    [/bcpapin/gi, 'workspace']
+  ];
+
+  function replaceIdentity(text) {
+    return identityPatterns.reduce((value, pair) => value.replace(pair[0], pair[1]), text || '');
+  }
+
+  function cleanTextNodes(root) {
+    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
+    const nodes = [];
+    while (walker.nextNode()) nodes.push(walker.currentNode);
+    nodes.forEach(function(node){
+      if (node.parentElement && !['SCRIPT','STYLE','NOSCRIPT'].includes(node.parentElement.tagName)) {
+        node.nodeValue = replaceIdentity(node.nodeValue || '');
+      }
+    });
+  }
+
+  function sanitizeNameColumns() {
+    document.querySelectorAll('table').forEach(function(table){
+      const headers = Array.from(table.querySelectorAll('thead th, tr:first-child th, tr:first-child td'));
+      const nameIndex = headers.findIndex(function(cell){ return /^(nama|name|pegawai|petugas|karyawan|employee)$/i.test((cell.textContent || '').trim()); });
+      if (nameIndex < 0) return;
+      Array.from(table.querySelectorAll('tbody tr')).forEach(function(row, index){
+        const cells = row.querySelectorAll('td');
+        if (cells[nameIndex]) cells[nameIndex].textContent = 'Sample Name ' + (index + 1);
+      });
+    });
+
+    const selectors = [
+      '.employee-name','.staff-name','.user-name','.person-name','.nama-pegawai','.nama-petugas',
+      '[data-field="name"]','[data-field="nama"]','[data-name]','[data-employee-name]'
+    ];
+    let sequence = 0;
+    document.querySelectorAll(selectors.join(',')).forEach(function(element){
+      sequence += 1;
+      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.value = '';
+      else element.textContent = 'Sample Name ' + sequence;
+    });
+
+    document.querySelectorAll('input,textarea,select').forEach(function(field){
+      const key = ((field.getAttribute('name') || '') + ' ' + (field.id || '') + ' ' + (field.getAttribute('placeholder') || '')).toLowerCase();
+      if (/\\b(nama|name|pegawai|petugas|employee|staff)\\b/.test(key)) {
+        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = '';
+      }
+    });
+  }
+
+  function neutralizeImages() {
+    document.querySelectorAll('img').forEach(function(img){
+      const raw = ((img.getAttribute('src') || '') + ' ' + (img.getAttribute('alt') || '')).toLowerCase();
+      if (/beacukai|kemenkeu|djbc|logo[-_ ]?bc|bcpapin/.test(raw)) {
+        const badge = document.createElement('span');
+        badge.textContent = 'AW';
+        badge.style.cssText = 'display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:#001b4d;color:white;font:800 16px Inter,Arial,sans-serif;';
+        img.replaceWith(badge);
+      }
+    });
+  }
+
+  function run() {
+    cleanTextNodes(document.body);
+    sanitizeNameColumns();
+    neutralizeImages();
+    document.title = 'Attendance Workspace';
+  }
+
+  run();
+  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
+})();
+</script>`;
}

function rewriteHtml(html: string, currentPath: string) {
  const directory = currentPath.includes("/") ? currentPath.slice(0, currentPath.lastIndexOf("/") + 1) : "";
  const prefix = "/api/presensi-source/";
  const rewrite = (_match: string, attr: string, quote: string, url: string) => {
    if (/^(https?:|data:|mailto:|tel:|#|javascript:)/i.test(url)) return `${attr}=${quote}${url}${quote}`;
    const clean = url.replace(/^\.\//, "");
    const resolved = clean.startsWith("/") ? clean.slice(1) : `${directory}${clean}`;
    return `${attr}=${quote}${prefix}${resolved}${quote}`;
  };
  let output = html
    .replace(/(src|href)=(['"])([^'"]+)\2/gi, rewrite)
    .replace(/url\((['"]?)(?!https?:|data:)([^)'"\s]+)\1\)/gi, (_match, quote, url) => {
      const clean = String(url).replace(/^\.\//, "");
      const resolved = clean.startsWith("/") ? clean.slice(1) : `${directory}${clean}`;
      return `url(${quote}${prefix}${resolved}${quote})`;
    });
  const script = runtimeSanitizer();
  output = output.includes("</body>") ? output.replace("</body>", `${script}</body>`) : `${output}${script}`;
  return output;
}

export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const requested = params.path?.join("/") || "index.html";
  const normalized = requested.includes("..") ? "index.html" : requested;
  const upstreamUrl = `${SOURCE_ORIGIN}/${normalized}`;

  try {
    const response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: { "user-agent": "bece.asia-attendance-adapter/1.0" },
    });
    if (!response.ok) return new NextResponse("Source aplikasi tidak dapat dimuat.", { status: response.status });

    const type = contentType(normalized, response.headers.get("content-type"));
    const textual = /text|javascript|json|xml|svg/.test(type);
    const headers = {
      "content-type": type,
      "content-disposition": "inline",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex",
    };

    if (!textual) return new NextResponse(await response.arrayBuffer(), { headers });

    let text = sanitizeText(await response.text());
    if (type.includes("text/html")) text = rewriteHtml(text, normalized);
    return new NextResponse(text, { headers });
  } catch {
    return new NextResponse("Source aplikasi tidak dapat dimuat.", { status: 502 });
  }
}
