"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eraser,
  FileSpreadsheet,
  Filter,
  GitCompareArrows,
  HelpCircle,
  Layers3,
  Library,
  Lightbulb,
  Link2,
  Microscope,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
} from "lucide-react";

type ResearchType = "Desk Research" | "Qualitative" | "Quantitative" | "Mixed Methods" | "Policy Review" | "Market Research" | "Legal Review" | "Impact Study";
type Stage = "Idea" | "Scoping" | "Data Collection" | "Analysis" | "Drafting" | "Review" | "Publication";
type SourceType = "Journal" | "Book" | "Report" | "Dataset" | "Interview" | "Regulation" | "News" | "Website" | "Observation";
type Priority = "Low" | "Normal" | "High" | "Critical";
type Status = "Draft" | "Active" | "Need Review" | "At Risk" | "Completed";
type EvidenceStrength = "Weak" | "Moderate" | "Strong";
type Tone = "safe" | "warning" | "danger" | "neutral" | "prime";

type ResearchProject = {
  id: string;
  title: string;
  domain: string;
  researchType: ResearchType;
  stage: Stage;
  status: Status;
  priority: Priority;
  ownerLabel: string;
  researchQuestion: string;
  objective: string;
  hypothesis: string;
  methodology: string;
  scope: string;
  population: string;
  dataPlan: string;
  ethicalNote: string;
  dueDate: string;
  notes: string;
  createdAt: string;
};

type SourceItem = {
  id: string;
  projectId: string;
  title: string;
  sourceType: SourceType;
  author: string;
  year: string;
  url: string;
  summary: string;
  keyFinding: string;
  relevance: number;
  credibility: number;
  recency: number;
  biasRisk: number;
  tags: string;
  createdAt: string;
};

type EvidenceItem = {
  id: string;
  projectId: string;
  claim: string;
  evidence: string;
  sourceLabel: string;
  strength: EvidenceStrength;
  implication: string;
  contradiction: string;
  theme: string;
  createdAt: string;
};

type InsightItem = {
  id: string;
  projectId: string;
  title: string;
  finding: string;
  recommendation: string;
  confidence: number;
  riskNote: string;
  nextAction: string;
  createdAt: string;
};

type StoredData = {
  projects: ResearchProject[];
  sources: SourceItem[];
  evidence: EvidenceItem[];
  insights: InsightItem[];
};

type EnrichedProject = ResearchProject & {
  sourceCount: number;
  evidenceCount: number;
  insightCount: number;
  avgCredibility: number;
  avgRelevance: number;
  evidenceScore: number;
  readinessScore: number;
  gaps: string[];
  quickWin: string;
  overdue: boolean;
};

const STORAGE_KEY = "beceasia:general-research-workbench:v1";

const researchTypes: ResearchType[] = ["Desk Research", "Qualitative", "Quantitative", "Mixed Methods", "Policy Review", "Market Research", "Legal Review", "Impact Study"];
const stages: Stage[] = ["Idea", "Scoping", "Data Collection", "Analysis", "Drafting", "Review", "Publication"];
const statuses: Status[] = ["Draft", "Active", "Need Review", "At Risk", "Completed"];
const priorities: Priority[] = ["Low", "Normal", "High", "Critical"];
const sourceTypes: SourceType[] = ["Journal", "Book", "Report", "Dataset", "Interview", "Regulation", "News", "Website", "Observation"];
const strengths: EvidenceStrength[] = ["Weak", "Moderate", "Strong"];

const sampleProject: ResearchProject = {
  id: "sample-project-1",
  title: "Kajian Efektivitas Program Pendampingan Digital",
  domain: "Public innovation and learning",
  researchType: "Mixed Methods",
  stage: "Analysis",
  status: "Active",
  priority: "High",
  ownerLabel: "Research Lead",
  researchQuestion: "Faktor apa yang paling memengaruhi keberhasilan program pendampingan digital?",
  objective: "Mengidentifikasi faktor pendorong, hambatan, dan rekomendasi perbaikan program.",
  hypothesis: "Konsistensi mentor dan kualitas evidence peserta berpengaruh terhadap capaian akhir program.",
  methodology: "Desk review, wawancara semi-terstruktur, analisis dokumen, dan matriks tematik.",
  scope: "Program pembelajaran digital berbasis cohort dalam periode simulasi.",
  population: "Peserta, mentor, pengelola program, dan dokumen bukti kegiatan.",
  dataPlan: "Kumpulkan sumber sekunder, catatan wawancara, evidence program, dan ringkasan capaian per tahap.",
  ethicalNote: "Gunakan label anonim dan hindari data pribadi peserta.",
  dueDate: "",
  notes: "Contoh data publik untuk simulasi.",
  createdAt: new Date().toISOString(),
};

const sampleSources: SourceItem[] = [
  {
    id: "sample-source-1",
    projectId: "sample-project-1",
    title: "Program Evaluation Methods: Practical Guide",
    sourceType: "Report",
    author: "Public Reference",
    year: "2025",
    url: "https://example.com/program-evaluation",
    summary: "Panduan umum untuk menilai program berbasis output, outcome, dan bukti implementasi.",
    keyFinding: "Program yang memiliki indikator jelas dan evidence berkala lebih mudah dievaluasi.",
    relevance: 88,
    credibility: 82,
    recency: 75,
    biasRisk: 20,
    tags: "evaluation, program, evidence",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-source-2",
    projectId: "sample-project-1",
    title: "Interview Note - Mentor A",
    sourceType: "Interview",
    author: "Informant Label A",
    year: "2026",
    url: "",
    summary: "Mentor menilai peserta lebih cepat berkembang saat tugas mingguan dibuat kecil dan terukur.",
    keyFinding: "Weekly deliverables memperbaiki ritme pembelajaran dan kualitas bukti.",
    relevance: 92,
    credibility: 70,
    recency: 90,
    biasRisk: 35,
    tags: "interview, mentor, learning",
    createdAt: new Date().toISOString(),
  },
];

const sampleEvidence: EvidenceItem[] = [
  {
    id: "sample-evidence-1",
    projectId: "sample-project-1",
    claim: "Evidence mingguan meningkatkan keterlacakan progres.",
    evidence: "Log program menunjukkan peningkatan kepatuhan submit setelah format evidence disederhanakan.",
    sourceLabel: "Program log and mentor note",
    strength: "Strong",
    implication: "Dashboard monitoring perlu menampilkan evidence completion sebagai indikator utama.",
    contradiction: "Sebagian peserta tetap lambat saat jadwal mentoring tidak konsisten.",
    theme: "Evidence quality",
    createdAt: new Date().toISOString(),
  },
];

const sampleInsights: InsightItem[] = [
  {
    id: "sample-insight-1",
    projectId: "sample-project-1",
    title: "Evidence quality as leading indicator",
    finding: "Kualitas dan konsistensi bukti lebih cepat menunjukkan risiko program dibanding penilaian akhir.",
    recommendation: "Gunakan weekly evidence checklist dan review 15 menit per tim setiap minggu.",
    confidence: 78,
    riskNote: "Sampel masih terbatas dan perlu triangulasi dengan peserta.",
    nextAction: "Tambahkan wawancara peserta dan bandingkan dengan log tugas.",
    createdAt: new Date().toISOString(),
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function safeAverage(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function numberFromForm(form: FormData, key: string) {
  return clamp(Number(form.get(key) || 0));
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function strengthWeight(value: EvidenceStrength) {
  if (value === "Strong") return 100;
  if (value === "Moderate") return 65;
  return 35;
}

function readinessLevel(score: number) {
  if (score >= 85) return { label: "Publication Ready", tone: "prime" as Tone, badge: "bg-violet-50 text-violet-700 ring-violet-200" };
  if (score >= 70) return { label: "Strong Draft", tone: "safe" as Tone, badge: "bg-teal/10 text-teal ring-teal/20" };
  if (score >= 55) return { label: "Needs Triangulation", tone: "warning" as Tone, badge: "bg-amber-100 text-amber-700 ring-amber-200" };
  if (score >= 40) return { label: "Research Gap", tone: "warning" as Tone, badge: "bg-orange-100 text-orange-700 ring-orange-200" };
  return { label: "Concept Stage", tone: "danger" as Tone, badge: "bg-rose-100 text-rose-700 ring-rose-200" };
}

function buildGaps(project: ResearchProject, sources: SourceItem[], evidence: EvidenceItem[], insights: InsightItem[]) {
  const gaps: string[] = [];
  if (!project.researchQuestion.trim()) gaps.push("Research question");
  if (!project.methodology.trim()) gaps.push("Methodology");
  if (!project.scope.trim()) gaps.push("Scope boundary");
  if (sources.length < 3) gaps.push("Source diversity");
  if (evidence.length < 3) gaps.push("Evidence matrix");
  if (insights.length < 1) gaps.push("Synthesis insight");
  if (safeAverage(sources.map((item) => item.credibility)) < 65) gaps.push("Source credibility");
  if (sources.filter((item) => item.sourceType === "Interview" || item.sourceType === "Dataset" || item.sourceType === "Observation").length === 0) gaps.push("Primary or field signal");
  return gaps;
}

function buildQuickWin(gaps: string[]) {
  if (gaps.includes("Research question")) return "Rumuskan satu pertanyaan utama dan dua sub-pertanyaan yang bisa dijawab dengan data tersedia.";
  if (gaps.includes("Source diversity")) return "Tambahkan minimal satu sumber akademik, satu data resmi, dan satu sumber lapangan atau wawancara.";
  if (gaps.includes("Evidence matrix")) return "Ubah catatan sumber menjadi claim, evidence, contradiction, dan implication.";
  if (gaps.includes("Primary or field signal")) return "Tambahkan wawancara berlabel anonim atau observasi lapangan sebagai pembanding desk research.";
  if (gaps.includes("Synthesis insight")) return "Tulis satu temuan awal, rekomendasi, tingkat keyakinan, dan risiko bias.";
  return "Lanjutkan analisis dan siapkan outline laporan berbasis temuan utama.";
}

function enrichProject(project: ResearchProject, sources: SourceItem[], evidence: EvidenceItem[], insights: InsightItem[]): EnrichedProject {
  const projectSources = sources.filter((item) => item.projectId === project.id);
  const projectEvidence = evidence.filter((item) => item.projectId === project.id);
  const projectInsights = insights.filter((item) => item.projectId === project.id);
  const avgCredibility = safeAverage(projectSources.map((item) => item.credibility));
  const avgRelevance = safeAverage(projectSources.map((item) => item.relevance));
  const evidenceScore = safeAverage(projectEvidence.map((item) => strengthWeight(item.strength)));
  const structureScore = [project.researchQuestion, project.objective, project.methodology, project.scope, project.dataPlan].filter((item) => item.trim()).length * 12;
  const readinessScore = Math.round(clamp(
    avgCredibility * 0.22 +
    avgRelevance * 0.18 +
    evidenceScore * 0.22 +
    Math.min(100, projectSources.length * 18) * 0.12 +
    Math.min(100, projectEvidence.length * 16) * 0.12 +
    Math.min(100, projectInsights.length * 28) * 0.08 +
    structureScore * 0.06,
  ));
  const gaps = buildGaps(project, projectSources, projectEvidence, projectInsights);
  return {
    ...project,
    sourceCount: projectSources.length,
    evidenceCount: projectEvidence.length,
    insightCount: projectInsights.length,
    avgCredibility,
    avgRelevance,
    evidenceScore,
    readinessScore,
    gaps,
    quickWin: buildQuickWin(gaps),
    overdue: Boolean(project.dueDate && project.dueDate < todayIso() && project.status !== "Completed"),
  };
}

function buildBrief(project: EnrichedProject, sources: SourceItem[], evidence: EvidenceItem[], insights: InsightItem[]) {
  const projectSources = sources.filter((item) => item.projectId === project.id);
  const projectEvidence = evidence.filter((item) => item.projectId === project.id);
  const projectInsights = insights.filter((item) => item.projectId === project.id);
  return [
    `Research: ${project.title}`,
    `Domain: ${project.domain}`,
    `Type: ${project.researchType}`,
    `Stage: ${project.stage}`,
    `Research question: ${project.researchQuestion || "Not set"}`,
    `Readiness: ${project.readinessScore} - ${readinessLevel(project.readinessScore).label}`,
    `Sources: ${projectSources.length}, Evidence: ${projectEvidence.length}, Insights: ${projectInsights.length}`,
    `Main gaps: ${project.gaps.join(", ") || "No major gap"}`,
    `Quick win: ${project.quickWin}`,
    `Latest insight: ${projectInsights[0]?.finding || "No insight yet"}`,
  ].join("\n");
}

function buildMarkdown(project: EnrichedProject, sources: SourceItem[], evidence: EvidenceItem[], insights: InsightItem[]) {
  const projectSources = sources.filter((item) => item.projectId === project.id);
  const projectEvidence = evidence.filter((item) => item.projectId === project.id);
  const projectInsights = insights.filter((item) => item.projectId === project.id);
  return `# ${project.title}\n\n## Research brief\n\n- Domain: ${project.domain}\n- Type: ${project.researchType}\n- Stage: ${project.stage}\n- Readiness: ${project.readinessScore} (${readinessLevel(project.readinessScore).label})\n\n## Research question\n\n${project.researchQuestion || "Not set"}\n\n## Objective\n\n${project.objective || "Not set"}\n\n## Methodology\n\n${project.methodology || "Not set"}\n\n## Scope\n\n${project.scope || "Not set"}\n\n## Evidence matrix\n\n${projectEvidence.map((item, index) => `${index + 1}. **${item.claim}**\n   - Evidence: ${item.evidence}\n   - Strength: ${item.strength}\n   - Implication: ${item.implication}\n   - Contradiction: ${item.contradiction || "-"}`).join("\n\n") || "No evidence yet."}\n\n## Sources\n\n${projectSources.map((item, index) => `${index + 1}. ${item.title} (${item.sourceType}, ${item.year || "n.d."}) - ${item.keyFinding || item.summary}`).join("\n") || "No sources yet."}\n\n## Insights\n\n${projectInsights.map((item, index) => `${index + 1}. **${item.title}**\n   - Finding: ${item.finding}\n   - Recommendation: ${item.recommendation}\n   - Confidence: ${item.confidence}`).join("\n\n") || "No insights yet."}\n`;
}

export function ResearchWorkbenchClient() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setProjects(Array.isArray(parsed.projects) ? parsed.projects : []);
        setSources(Array.isArray(parsed.sources) ? parsed.sources : []);
        setEvidence(Array.isArray(parsed.evidence) ? parsed.evidence : []);
        setInsights(Array.isArray(parsed.insights) ? parsed.insights : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, sources, evidence, insights }));
  }, [loaded, projects, sources, evidence, insights]);

  const enriched = useMemo(() => projects.map((project) => enrichProject(project, sources, evidence, insights)), [projects, sources, evidence, insights]);
  const selected = enriched.find((item) => item.id === selectedId) ?? enriched[0];
  const selectedSources = selected ? sources.filter((item) => item.projectId === selected.id) : [];
  const selectedEvidence = selected ? evidence.filter((item) => item.projectId === selected.id) : [];
  const selectedInsights = selected ? insights.filter((item) => item.projectId === selected.id) : [];

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((project) => {
      const text = `${project.title} ${project.domain} ${project.researchQuestion} ${project.ownerLabel}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || project.researchType === filter || project.stage === filter || project.status === filter || project.priority === filter || readinessLevel(project.readinessScore).label === filter;
      return matchText && matchFilter;
    });
  }, [enriched, query, filter]);

  const summary = useMemo(() => {
    const total = enriched.length;
    const avg = safeAverage(enriched.map((item) => item.readinessScore));
    const active = enriched.filter((item) => item.status === "Active" || item.status === "Need Review").length;
    const atRisk = enriched.filter((item) => item.status === "At Risk" || item.overdue || item.readinessScore < 55).length;
    const sourceTotal = sources.length;
    const evidenceTotal = evidence.length;
    const topGap = total === 0 ? "-" : [
      ["Research question", enriched.filter((item) => item.gaps.includes("Research question")).length],
      ["Source diversity", enriched.filter((item) => item.gaps.includes("Source diversity")).length],
      ["Evidence matrix", enriched.filter((item) => item.gaps.includes("Evidence matrix")).length],
      ["Synthesis insight", enriched.filter((item) => item.gaps.includes("Synthesis insight")).length],
    ].sort((a, b) => Number(b[1]) - Number(a[1]))[0][0] as string;
    return { total, avg, active, atRisk, sourceTotal, evidenceTotal, topGap };
  }, [enriched, sources.length, evidence.length]);

  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const project: ResearchProject = {
      id: crypto.randomUUID(),
      title: textFromForm(form, "title") || "Untitled Research",
      domain: textFromForm(form, "domain") || "General research",
      researchType: textFromForm(form, "researchType") as ResearchType,
      stage: textFromForm(form, "stage") as Stage,
      status: textFromForm(form, "status") as Status,
      priority: textFromForm(form, "priority") as Priority,
      ownerLabel: textFromForm(form, "ownerLabel") || "Researcher",
      researchQuestion: textFromForm(form, "researchQuestion"),
      objective: textFromForm(form, "objective"),
      hypothesis: textFromForm(form, "hypothesis"),
      methodology: textFromForm(form, "methodology"),
      scope: textFromForm(form, "scope"),
      population: textFromForm(form, "population"),
      dataPlan: textFromForm(form, "dataPlan"),
      ethicalNote: textFromForm(form, "ethicalNote"),
      dueDate: textFromForm(form, "dueDate"),
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };
    setProjects((previous) => [project, ...previous]);
    setSelectedId(project.id);
    event.currentTarget.reset();
  }

  function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const item: SourceItem = {
      id: crypto.randomUUID(),
      projectId: selected.id,
      title: textFromForm(form, "title") || "Untitled source",
      sourceType: textFromForm(form, "sourceType") as SourceType,
      author: textFromForm(form, "author"),
      year: textFromForm(form, "year"),
      url: textFromForm(form, "url"),
      summary: textFromForm(form, "summary"),
      keyFinding: textFromForm(form, "keyFinding"),
      relevance: numberFromForm(form, "relevance"),
      credibility: numberFromForm(form, "credibility"),
      recency: numberFromForm(form, "recency"),
      biasRisk: numberFromForm(form, "biasRisk"),
      tags: textFromForm(form, "tags"),
      createdAt: new Date().toISOString(),
    };
    setSources((previous) => [item, ...previous]);
    event.currentTarget.reset();
  }

  function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const item: EvidenceItem = {
      id: crypto.randomUUID(),
      projectId: selected.id,
      claim: textFromForm(form, "claim") || "Claim belum diisi",
      evidence: textFromForm(form, "evidence"),
      sourceLabel: textFromForm(form, "sourceLabel"),
      strength: textFromForm(form, "strength") as EvidenceStrength,
      implication: textFromForm(form, "implication"),
      contradiction: textFromForm(form, "contradiction"),
      theme: textFromForm(form, "theme"),
      createdAt: new Date().toISOString(),
    };
    setEvidence((previous) => [item, ...previous]);
    event.currentTarget.reset();
  }

  function addInsight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const item: InsightItem = {
      id: crypto.randomUUID(),
      projectId: selected.id,
      title: textFromForm(form, "title") || "Insight baru",
      finding: textFromForm(form, "finding"),
      recommendation: textFromForm(form, "recommendation"),
      confidence: numberFromForm(form, "confidence"),
      riskNote: textFromForm(form, "riskNote"),
      nextAction: textFromForm(form, "nextAction"),
      createdAt: new Date().toISOString(),
    };
    setInsights((previous) => [item, ...previous]);
    event.currentTarget.reset();
  }

  function updateProject(id: string, patch: Partial<ResearchProject>) {
    setProjects((previous) => previous.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeProject(id: string) {
    setProjects((previous) => previous.filter((item) => item.id !== id));
    setSources((previous) => previous.filter((item) => item.projectId !== id));
    setEvidence((previous) => previous.filter((item) => item.projectId !== id));
    setInsights((previous) => previous.filter((item) => item.projectId !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function removeSource(id: string) {
    setSources((previous) => previous.filter((item) => item.id !== id));
  }

  function removeEvidence(id: string) {
    setEvidence((previous) => previous.filter((item) => item.id !== id));
  }

  function removeInsight(id: string) {
    setInsights((previous) => previous.filter((item) => item.id !== id));
  }

  function loadSample() {
    setProjects([sampleProject]);
    setSources(sampleSources);
    setEvidence(sampleEvidence);
    setInsights(sampleInsights);
    setSelectedId(sampleProject.id);
  }

  function clearWorkspace() {
    setProjects([]);
    setSources([]);
    setEvidence([]);
    setInsights([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ projects, sources, evidence, insights }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "research-workbench-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Title", "Domain", "Type", "Stage", "Status", "Readiness", "Sources", "Evidence", "Insights", "Gaps", "Quick Win"];
    const rows = enriched.map((item) => [
      item.title,
      item.domain,
      item.researchType,
      item.stage,
      item.status,
      String(item.readinessScore),
      String(item.sourceCount),
      String(item.evidenceCount),
      String(item.insightCount),
      item.gaps.join(" | "),
      item.quickWin,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "research-workbench-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportMarkdown() {
    if (!selected) return;
    const blob = new Blob([buildMarkdown(selected, sources, evidence, insights)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "research"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setProjects(Array.isArray(parsed.projects) ? parsed.projects : []);
        setSources(Array.isArray(parsed.sources) ? parsed.sources : []);
        setEvidence(Array.isArray(parsed.evidence) ? parsed.evidence : []);
        setInsights(Array.isArray(parsed.insights) ? parsed.insights : []);
      } catch {
        alert("File JSON tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  }

  async function copyBrief() {
    if (!selected) return;
    await navigator.clipboard.writeText(buildBrief(selected, sources, evidence, insights));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Research Operations</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">Research Workbench</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace umum untuk kajian dan penelitian: susun pertanyaan riset, kelola sumber, bangun evidence matrix, catat insight, cek gap, dan ekspor draft ringkasan penelitian.
              </p>
            </div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700">General Research</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Fokus" value="Kajian & Penelitian" />
            <InfoCard label="Metode" value="Desk · Field · Mixed" />
            <InfoCard label="Output" value="Brief · Matrix · Markdown" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Tool ini bersifat umum dan public-safe. Data tersimpan lokal di browser. Gunakan label anonim untuk narasumber dan hindari memasukkan data rahasia, data pribadi, atau dokumen internal yang belum layak publik.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <MetricCard icon={ClipboardList} label="Projects" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={GaugeIcon} label="Avg readiness" value={`${summary.avg}`} tone={summary.avg >= 70 ? "safe" : summary.avg >= 55 ? "warning" : "danger"} />
          <MetricCard icon={BookOpenCheck} label="Sources" value={`${summary.sourceTotal}`} tone="prime" />
          <MetricCard icon={GitCompareArrows} label="Evidence" value={`${summary.evidenceTotal}`} tone="safe" />
          <MetricCard icon={Target} label="Active" value={`${summary.active}`} tone="neutral" />
          <MetricCard icon={Filter} label="At risk" value={`${summary.atRisk}`} tone={summary.atRisk === 0 ? "safe" : "danger"} />
          <MetricCard icon={Lightbulb} label="Top gap" value={summary.topGap} tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Research Command Center" icon={BrainCircuit}>
            {selected ? <CommandCenter project={selected} onUpdate={updateProject} onCopy={copyBrief} copied={copied} /> : <EmptyState title="Belum ada proyek riset" description="Tambahkan proyek atau muat contoh untuk melihat command center, gap, dan quick win." />}
          </Panel>
          <Panel title="Tambah proyek riset" icon={Plus}>
            <ProjectForm onSubmit={addProject} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <Panel title="Research Tools" icon={Microscope}>
            {selected ? (
              <ResearchTools
                sources={selectedSources}
                evidence={selectedEvidence}
                insights={selectedInsights}
                addSource={addSource}
                addEvidence={addEvidence}
                addInsight={addInsight}
                removeSource={removeSource}
                removeEvidence={removeEvidence}
                removeInsight={removeInsight}
              />
            ) : <EmptyState title="Pilih proyek" description="Pilih proyek riset untuk menambahkan sumber, evidence, dan insight." />}
          </Panel>

          <Panel title="Research Projects" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, domain, pertanyaan, owner" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                {researchTypes.map((item) => <option key={item}>{item}</option>)}
                {stages.map((item) => <option key={item}>{item}</option>)}
                {statuses.map((item) => <option key={item}>{item}</option>)}
                {priorities.map((item) => <option key={item}>{item}</option>)}
                <option>Publication Ready</option>
                <option>Strong Draft</option>
                <option>Needs Triangulation</option>
                <option>Research Gap</option>
              </select>
              <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2.5 text-sm font-bold text-white"><Layers3 size={16} /> Contoh</button>
              <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> JSON</button>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> CSV</button>
              <button onClick={exportMarkdown} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><Download size={16} /> Markdown</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200">
                <Upload size={16} /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
              </label>
              <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan</button>
            </div>
            {filtered.length === 0 ? <EmptyState title="Belum ada proyek" description="Tambahkan proyek riset baru atau klik Contoh untuk mencoba workflow kajian umum." /> : <ProjectTable projects={filtered} selectedId={selected?.id ?? null} onSelect={setSelectedId} onRemove={removeProject} />}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function CommandCenter({ project, onUpdate, onCopy, copied }: { project: EnrichedProject; onUpdate: (id: string, patch: Partial<ResearchProject>) => void; onCopy: () => void; copied: boolean }) {
  const level = readinessLevel(project.readinessScore);
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected research</p>
            <h2 className="mt-2 text-3xl font-black">{project.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{project.domain} · {project.researchType}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{project.readinessScore}</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">{level.label}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{project.researchQuestion || "Research question belum diisi."}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Quick win" value={project.quickWin} />
        <InfoPill label="Gap utama" value={project.gaps[0] ?? "Tidak ada gap besar"} />
        <InfoPill label="Evidence score" value={`${project.evidenceScore}`} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Methodology</p>
        <p className="mt-2">{project.methodology || "Belum ada metodologi."}</p>
        <p className="mt-4 font-black text-navy">Data plan</p>
        <p className="mt-2">{project.dataPlan || "Belum ada rencana data."}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Stage" value={project.stage} options={stages} onChange={(value) => onUpdate(project.id, { stage: value })} />
        <InlineSelect label="Status" value={project.status} options={statuses} onChange={(value) => onUpdate(project.id, { status: value })} />
      </div>
      <button onClick={onCopy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Sparkles size={18} /> {copied ? "Brief tersalin" : "Salin research brief"}
      </button>
    </div>
  );
}

function ProjectForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="title" label="Judul kajian" placeholder="Judul umum penelitian" />
        <TextInput name="domain" label="Domain/topik" placeholder="Contoh: ekonomi, kebijakan, layanan, pasar" />
        <SelectText name="researchType" label="Jenis riset" options={researchTypes} defaultValue="Desk Research" />
        <SelectText name="stage" label="Stage" options={stages} defaultValue="Idea" />
        <SelectText name="status" label="Status" options={statuses} defaultValue="Draft" />
        <SelectText name="priority" label="Prioritas" options={priorities} defaultValue="Normal" />
        <TextInput name="ownerLabel" label="Owner/peneliti" placeholder="Gunakan label aman" />
        <TextInput name="dueDate" label="Target review" type="date" />
      </div>
      <TextArea name="researchQuestion" label="Research question" placeholder="Pertanyaan utama yang ingin dijawab" />
      <TextArea name="objective" label="Tujuan" placeholder="Tujuan kajian atau penelitian" />
      <TextArea name="hypothesis" label="Hipotesis/asumsi awal" placeholder="Boleh kosong untuk penelitian eksploratif" />
      <TextArea name="methodology" label="Metodologi" placeholder="Desk review, wawancara, survei, dataset, observasi, analisis hukum, dll." />
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="scope" label="Ruang lingkup" placeholder="Batasan topik, waktu, tempat, populasi, atau data" />
        <TextArea name="population" label="Populasi/narasumber/data" placeholder="Sumber informasi atau unit analisis" />
      </div>
      <TextArea name="dataPlan" label="Rencana data" placeholder="Data apa yang dibutuhkan dan bagaimana memvalidasinya" />
      <TextArea name="ethicalNote" label="Catatan etika dan privasi" placeholder="Anonimisasi, consent, data sensitif, konflik kepentingan" />
      <TextArea name="notes" label="Catatan" placeholder="Catatan aman untuk publik" />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah proyek
      </button>
    </form>
  );
}

function ResearchTools({ sources, evidence, insights, addSource, addEvidence, addInsight, removeSource, removeEvidence, removeInsight }: { sources: SourceItem[]; evidence: EvidenceItem[]; insights: InsightItem[]; addSource: (event: FormEvent<HTMLFormElement>) => void; addEvidence: (event: FormEvent<HTMLFormElement>) => void; addInsight: (event: FormEvent<HTMLFormElement>) => void; removeSource: (id: string) => void; removeEvidence: (id: string) => void; removeInsight: (id: string) => void }) {
  const [tab, setTab] = useState<"sources" | "evidence" | "insights">("sources");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
        <TabButton active={tab === "sources"} onClick={() => setTab("sources")}>Sources</TabButton>
        <TabButton active={tab === "evidence"} onClick={() => setTab("evidence")}>Evidence</TabButton>
        <TabButton active={tab === "insights"} onClick={() => setTab("insights")}>Insights</TabButton>
      </div>
      {tab === "sources" ? <SourceTool sources={sources} onSubmit={addSource} onRemove={removeSource} /> : null}
      {tab === "evidence" ? <EvidenceTool evidence={evidence} onSubmit={addEvidence} onRemove={removeEvidence} /> : null}
      {tab === "insights" ? <InsightTool insights={insights} onSubmit={addInsight} onRemove={removeInsight} /> : null}
    </div>
  );
}

function SourceTool({ sources, onSubmit, onRemove }: { sources: SourceItem[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onRemove: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <TextInput name="title" label="Judul sumber" placeholder="Artikel, paper, laporan, dataset, wawancara" />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectText name="sourceType" label="Tipe" options={sourceTypes} defaultValue="Report" />
          <TextInput name="author" label="Penulis/sumber" placeholder="Label sumber" />
          <TextInput name="year" label="Tahun" placeholder="2026" />
          <TextInput name="url" label="URL" placeholder="https://..." />
        </div>
        <TextArea name="summary" label="Ringkasan" placeholder="Isi singkat sumber" />
        <TextArea name="keyFinding" label="Key finding" placeholder="Temuan penting dari sumber" />
        <div className="grid gap-3 md:grid-cols-4">
          <ScoreInput name="relevance" label="Relevance" defaultValue={70} />
          <ScoreInput name="credibility" label="Credibility" defaultValue={70} />
          <ScoreInput name="recency" label="Recency" defaultValue={70} />
          <ScoreInput name="biasRisk" label="Bias risk" defaultValue={25} />
        </div>
        <TextInput name="tags" label="Tags" placeholder="Pisahkan dengan koma" />
        <button type="submit" className="rounded-2xl bg-navy px-4 py-3 text-sm font-black text-white">Tambah sumber</button>
      </form>
      <ItemList items={sources.map((item) => ({ id: item.id, title: item.title, subtitle: `${item.sourceType} · ${item.author || "Unknown"} · relevance ${item.relevance}`, detail: item.keyFinding || item.summary }))} onRemove={onRemove} />
    </div>
  );
}

function EvidenceTool({ evidence, onSubmit, onRemove }: { evidence: EvidenceItem[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onRemove: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <TextArea name="claim" label="Claim/proposisi" placeholder="Pernyataan yang ingin dibuktikan" />
        <TextArea name="evidence" label="Evidence" placeholder="Bukti, data, kutipan ringkas, atau observasi" />
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput name="sourceLabel" label="Sumber bukti" placeholder="Label sumber" />
          <SelectText name="strength" label="Strength" options={strengths} defaultValue="Moderate" />
        </div>
        <TextInput name="theme" label="Tema/kode" placeholder="Tema analisis" />
        <TextArea name="implication" label="Implication" placeholder="Makna bukti terhadap kajian" />
        <TextArea name="contradiction" label="Contradiction" placeholder="Bukti pembanding atau anomali" />
        <button type="submit" className="rounded-2xl bg-navy px-4 py-3 text-sm font-black text-white">Tambah evidence</button>
      </form>
      <ItemList items={evidence.map((item) => ({ id: item.id, title: item.claim, subtitle: `${item.strength} · ${item.theme || "No theme"}`, detail: item.implication || item.evidence }))} onRemove={onRemove} />
    </div>
  );
}

function InsightTool({ insights, onSubmit, onRemove }: { insights: InsightItem[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onRemove: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <TextInput name="title" label="Judul insight" placeholder="Temuan utama" />
        <TextArea name="finding" label="Finding" placeholder="Apa temuan risetnya?" />
        <TextArea name="recommendation" label="Recommendation" placeholder="Rekomendasi berbasis temuan" />
        <ScoreInput name="confidence" label="Confidence" defaultValue={60} />
        <TextArea name="riskNote" label="Risk/bias note" placeholder="Keterbatasan, risiko bias, data lemah" />
        <TextArea name="nextAction" label="Next action" placeholder="Tindak lanjut analisis" />
        <button type="submit" className="rounded-2xl bg-navy px-4 py-3 text-sm font-black text-white">Tambah insight</button>
      </form>
      <ItemList items={insights.map((item) => ({ id: item.id, title: item.title, subtitle: `Confidence ${item.confidence}`, detail: item.recommendation || item.finding }))} onRemove={onRemove} />
    </div>
  );
}

function ProjectTable({ projects, selectedId, onSelect, onRemove }: { projects: EnrichedProject[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Research</th>
              <th className="px-4 py-3">Readiness</th>
              <th className="px-4 py-3">Assets</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {projects.map((project) => {
              const level = readinessLevel(project.readinessScore);
              return (
                <tr key={project.id} className={selectedId === project.id ? "bg-teal/5" : ""}>
                  <td className="px-4 py-4 align-top">
                    <button onClick={() => onSelect(project.id)} className="text-left">
                      <p className="font-black text-navy">{project.title}</p>
                      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{project.domain} · {project.researchType}</p>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top"><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${level.badge}`}>{project.readinessScore} · {level.label}</span></td>
                  <td className="px-4 py-4 align-top text-xs text-slate-600">{project.sourceCount} sources<br />{project.evidenceCount} evidence · {project.insightCount} insights</td>
                  <td className="px-4 py-4 align-top text-xs text-slate-600">{project.gaps.join(" | ") || "-"}</td>
                  <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{project.stage}</span></td>
                  <td className="px-4 py-4 align-top text-right"><button onClick={() => onRemove(project.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus proyek"><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemList({ items, onRemove }: { items: { id: string; title: string; subtitle: string; detail: string }[]; onRemove: (id: string) => void }) {
  if (items.length === 0) return <EmptyState title="Belum ada item" description="Tambahkan item baru untuk membangun database riset." />;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-navy">{item.title}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{item.subtitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail || "Tidak ada detail."}</p>
            </div>
            <button onClick={() => onRemove(item.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`rounded-xl px-3 py-2 text-xs font-black ${active ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}>{children}</button>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal/10 text-teal"><Icon size={20} /></div>
        <h2 className="text-xl font-black text-navy">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function GaugeIcon(props: { size?: number; className?: string }) {
  return <BarChart3 {...props} />;
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  const background = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "prime" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-navy";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${background}`}><Icon size={21} /></div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-navy">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 font-black text-navy">{value}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-navy">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <HelpCircle className="mx-auto text-slate-400" size={32} />
      <h3 className="mt-3 text-lg font-black text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function TextInput({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function TextArea({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea name={name} rows={3} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function SelectText<T extends string>({ name, label, options, defaultValue }: { name: string; label: string; options: readonly T[]; defaultValue?: T }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? options[0]} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function InlineSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold normal-case tracking-normal text-navy outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ScoreInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: number }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type="number" min="0" max="100" defaultValue={defaultValue} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}
