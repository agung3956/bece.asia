export const dynamic = "force-dynamic";

const SOURCE_URL = "https://raw.githubusercontent.com/webbcpapin/FrontDesk/main/index.html";

function replaceAllInsensitive(value: string, search: RegExp, replacement: string) {
  return value.replace(search, replacement);
}

function sanitizeFrontDesk(source: string) {
  let html = source;

  // Remove the injected browser-plugin spoofing script that is not needed for the app experience.
  html = html.replace(/<script type='text\/javascript'>\(function\(\) \{'use strict';[\s\S]*?<\/script>/i, "");

  const replacements: Array<[RegExp, string]> = [
    [/Frontdesk Premium - Bea Cukai Pangkalpinang/gi, "FrontDesk Premium"],
    [/Selamat\s+Datang\s+di\s+Layanan\s+Bea\s*Cukai/gi, "Selamat Datang di FrontDesk"],
    [/Layanan\s+Bea\s*Cukai/gi, "Layanan FrontDesk"],
    [/Bea\s*Cukai\s*Pangkal\s*Pinang/gi, "FrontDesk"],
    [/Bea\s*Cukai\s*Pangkalpinang/gi, "FrontDesk"],
    [/Bea\s*Cukai/gi, "FrontDesk"],
    [/KPPBC\s*TMP\s*C\s*Pangkal\s*Pinang/gi, "FrontDesk"],
    [/KPPBC\s*TMP\s*C\s*Pangkalpinang/gi, "FrontDesk"],
    [/Kantor\s+Bea\s+Cukai\s+Pangkal\s*Pinang/gi, "FrontDesk"],
    [/Kantor\s+Bea\s+Cukai\s+Pangkalpinang/gi, "FrontDesk"],
    [/Direktorat\s+Jenderal\s+Bea\s+dan\s+Cukai/gi, "Public Service Desk"],
    [/Kementerian\s+Keuangan/gi, "Public Service"],
    [/\bDJBC\b/gi, "Service Desk"],
    [/\bBC\s*Pangkalpinang\b/gi, "FrontDesk"],
    [/\bBC\s*Pangkal\s*Pinang\b/gi, "FrontDesk"],
    [/beacukai\.go\.id/gi, "example.com"],
  ];

  replacements.forEach(([pattern, replacement]) => {
    html = replaceAllInsensitive(html, pattern, replacement);
  });

  // Use neutral sample metrics instead of legacy operational figures.
  html = html.replace(/>571<\/g, ">120<");
  html = html.replace(/>90\.5<\/g, ">90<");
  html = html.replace(/>77<\/g, ">24<");
  html = html.replace(/>3<\/g, ">5<");
  html = html.replace(/IKM\s+SKM\s+T1\s+2026/gi, "SAMPLE SCORE");
  html = html.replace(/KONTEN\s+MEDIA\s+SOSIAL/gi, "SAMPLE CONTENT");
  html = html.replace(/TAMU\s+HARI\s+INI/gi, "SAMPLE VISIT");
  html = html.replace(/TOTAL\s+LAYANAN/gi, "SAMPLE SERVICE");

  // Replace the official-logo slot with a neutral FrontDesk monogram while preserving layout.
  html = html.replace(
    /<div class="logo">[\s\S]*?<\/div>\s*<div class="brand-text">/i,
    `<div class="logo"><span style="font-weight:900;font-size:1.25rem;letter-spacing:-0.08em;color:#0f172a;">FD</span></div><div class="brand-text">`,
  );

  // Remove direct Ngingetken cards/links when they appear as HTML blocks.
  html = html.replace(/<a[^>]*ngingetken[^>]*>[\s\S]*?<\/a>/gi, "");
  html = html.replace(/<button[^>]*ngingetken[^>]*>[\s\S]*?<\/button>/gi, "");
  html = html.replace(/<div[^>]*(?:service-card|app-card)[^>]*>[\s\S]{0,2200}?ngingetken[\s\S]{0,2200}?<\/div>\s*<\/div>/gi, "");
  html = html.replace(/ngingetken/gi, "");

  const runtimeSanitizer = `
<script>
(function sanitizeBeceFrontDesk(){
  var replacementMap = [
    [/Selamat\s+Datang\s+di\s+Layanan\s+Bea\s*Cukai/gi, 'Selamat Datang di FrontDesk'],
    [/Layanan\s+Bea\s*Cukai/gi, 'Layanan FrontDesk'],
    [/Bea\s*Cukai\s*Pangkal\s*Pinang/gi, 'FrontDesk'],
    [/Bea\s*Cukai\s*Pangkalpinang/gi, 'FrontDesk'],
    [/Bea\s*Cukai/gi, 'FrontDesk'],
    [/KPPBC\s*TMP\s*C\s*Pangkal\s*Pinang/gi, 'FrontDesk'],
    [/KPPBC\s*TMP\s*C\s*Pangkalpinang/gi, 'FrontDesk'],
    [/Direktorat\s+Jenderal\s+Bea\s+dan\s+Cukai/gi, 'Public Service Desk'],
    [/Kementerian\s+Keuangan/gi, 'Public Service'],
    [/\bDJBC\b/gi, 'Service Desk']
  ];

  function cleanTextNode(node) {
    var value = node.nodeValue || '';
    replacementMap.forEach(function(pair){ value = value.replace(pair[0], pair[1]); });
    if (/ngingetken/i.test(value)) value = '';
    node.nodeValue = value;
  }

  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) { cleanTextNode(node); return; }
    if (node.nodeType !== 1 || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    Array.prototype.slice.call(node.childNodes || []).forEach(walk);
  }

  function setSampleMetrics() {
    var samples = [
      ['dashTotalTamu', '5'],
      ['dashTamuHadir', '1'],
      ['dashTamuPulang', '4'],
      ['dashTotalBulan', '120'],
      ['dashTotalInfo', '120'],
      ['dashTotalKlinik', '12'],
      ['dashKlinikAktif', '5'],
      ['dashKlinikSelesai', '7'],
      ['dashKlinikUMKM', '10']
    ];
    samples.forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if (el) el.textContent = pair[1];
    });

    var statCards = Array.prototype.slice.call(document.querySelectorAll('.stat-item'));
    statCards.forEach(function(card){
      var label = card.querySelector('.label');
      var value = card.querySelector('.value');
      if (!label || !value) return;
      var text = (label.textContent || '').toLowerCase();
      if (text.includes('total layanan')) { label.textContent = 'Sample Service'; value.textContent = '120'; }
      if (text.includes('ikm') || text.includes('skm')) { label.textContent = 'Sample Score'; value.textContent = '90'; }
      if (text.includes('konten media sosial')) { label.textContent = 'Sample Content'; value.textContent = '24'; }
      if (text.includes('tamu hari ini')) { label.textContent = 'Sample Visit'; value.textContent = '5'; }
      if (text.includes('januari') || text.includes('februari') || text.includes('maret')) { value.textContent = '0'; }
    });
  }

  walk(document.body);
  setSampleMetrics();

  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function(img){
    var raw = ((img.getAttribute('src') || '') + ' ' + (img.getAttribute('alt') || '')).toLowerCase();
    if (raw.includes('logo') || raw.includes('beacukai') || raw.includes('kemenkeu') || raw.includes('djbc')) {
      var badge = document.createElement('span');
      badge.textContent = 'FD';
      badge.style.cssText = 'display:grid;place-items:center;width:45px;height:45px;border-radius:10px;background:linear-gradient(135deg,#d4af37,#f59e0b);color:#0f172a;font-weight:900;font-family:Inter,Arial,sans-serif;';
      img.replaceWith(badge);
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('.service-card,.app-card,a,button,[onclick],[href]')).forEach(function(el){
    var combined = ((el.textContent || '') + ' ' + (el.getAttribute('href') || '') + ' ' + (el.getAttribute('onclick') || '') + ' ' + (el.getAttribute('data-service') || '')).toLowerCase();
    if (combined.includes('ngingetken')) el.remove();
  });

  var title = document.querySelector('title');
  if (title) title.textContent = 'FrontDesk Premium';
})();
</script>`;

  if (html.includes("</body>")) {
    html = html.replace("</body>", `${runtimeSanitizer}\n</body>`);
  } else {
    html += runtimeSanitizer;
  }

  return html;
}

export async function GET() {
  try {
    const response = await fetch(SOURCE_URL, {
      cache: "no-store",
      headers: {
        accept: "text/html,text/plain,*/*",
        "user-agent": "bece.asia FrontDesk sanitized viewer",
      },
    });

    if (!response.ok) {
      throw new Error(`Source fetch failed: ${response.status}`);
    }

    const source = await response.text();
    const sanitized = sanitizeFrontDesk(source);

    return new Response(sanitized, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "x-robots-tag": "noindex",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FrontDesk</title><style>body{font-family:Inter,Arial,sans-serif;background:#0f172a;color:white;display:grid;place-items:center;min-height:100vh;margin:0}.card{max-width:560px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:24px;padding:32px;line-height:1.6}</style></head><body><div class="card"><h1>FrontDesk</h1><p>Source aplikasi belum dapat dimuat sementara.</p><p style="color:#94a3b8;font-size:14px">${message}</p></div></body></html>`,
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
}
