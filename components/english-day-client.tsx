"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Download,
  Eraser,
  FileSpreadsheet,
  Flame,
  GraduationCap,
  HelpCircle,
  Layers3,
  Library,
  Lightbulb,
  Mic2,
  PlayCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Upload,
  XCircle,
} from "lucide-react";

type LessonType = "Conversation" | "Speaking" | "Grammar" | "Review";
type Difficulty = "Beginner" | "Elementary" | "Intermediate";
type QuestionType = "multiple-choice" | "speaking-prompt" | "translation" | "sentence-builder";
type Tone = "safe" | "warning" | "danger" | "neutral" | "prime";

type Lesson = {
  id: string;
  track: string;
  title: string;
  type: LessonType;
  difficulty: Difficulty;
  day?: number;
  focus: string;
  expressions: string[];
};

type Question = {
  id: string;
  lessonId: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  points: number;
};

type Attempt = {
  id: string;
  questionId: string;
  lessonId: string;
  correct: boolean;
  userAnswer: string;
  createdAt: string;
};

type Reflection = {
  id: string;
  lessonId: string;
  note: string;
  confidence: number;
  createdAt: string;
};

type StoredData = {
  attempts: Attempt[];
  reflections: Reflection[];
  customQuestions: Question[];
};

const STORAGE_KEY = "beceasia:english-day-public:v1";

const lessons: Lesson[] = [
  { id: "intro", track: "Speak English in 120 Days", title: "Introducing Yourself and Others", type: "Conversation", difficulty: "Beginner", day: 1, focus: "Greeting, leave-taking, self introduction, and introducing others.", expressions: ["Hello. My name is ...", "Nice to meet you.", "This is my friend ...", "What do you do?"] },
  { id: "activities", track: "Speak English in 120 Days", title: "My Activities", type: "Conversation", difficulty: "Beginner", day: 2, focus: "Daily routines and simple present sentences.", expressions: ["I usually ...", "I go to ...", "I do not ...", "Do you often ...?"] },
  { id: "professions", track: "Speak English in 120 Days", title: "Professions", type: "Conversation", difficulty: "Beginner", day: 3, focus: "Talking about jobs, roles, and workplaces.", expressions: ["I work as a ...", "She works in ...", "What is your job?", "He is responsible for ..."] },
  { id: "hotel", track: "Speak English in 120 Days", title: "Hotel Phone Call", type: "Conversation", difficulty: "Elementary", day: 4, focus: "Booking, asking availability, and polite requests.", expressions: ["I would like to book ...", "Do you have any rooms available?", "Could you repeat that?", "May I have your name?"] },
  { id: "transportation", track: "Speak English in 120 Days", title: "Transportation", type: "Conversation", difficulty: "Elementary", day: 5, focus: "Asking routes, tickets, schedules, and travel options.", expressions: ["How can I get to ...?", "Where is the station?", "How much is the ticket?", "What time does it leave?"] },
  { id: "tv", track: "Speak English in 120 Days", title: "TV Program", type: "Conversation", difficulty: "Elementary", day: 6, focus: "Preferences, opinions, and entertainment.", expressions: ["I like watching ...", "My favorite program is ...", "What do you think about ...?", "It is interesting because ..."] },
  { id: "money", track: "Speak English in 120 Days", title: "Money", type: "Conversation", difficulty: "Elementary", day: 7, focus: "Prices, payment, saving, and simple transactions.", expressions: ["How much does it cost?", "I would like to pay by ...", "That is too expensive.", "Can I get a discount?"] },
  { id: "love", track: "Speak English in 120 Days", title: "Love and Relationships", type: "Conversation", difficulty: "Elementary", day: 8, focus: "Feelings, relationships, and personal opinions.", expressions: ["I care about ...", "I feel ...", "In my opinion ...", "A good relationship needs ..."] },
  { id: "internet", track: "Speak English in 120 Days", title: "Internet and Social Media", type: "Conversation", difficulty: "Elementary", day: 9, focus: "Online habits, benefits, and risks.", expressions: ["I use social media to ...", "The internet helps me ...", "I rarely post ...", "We should be careful with ..."] },
  { id: "holiday", track: "Speak English in 120 Days", title: "Holiday", type: "Conversation", difficulty: "Elementary", day: 10, focus: "Planning trips, describing places, and past experiences.", expressions: ["I went to ...", "I would like to visit ...", "The place was ...", "My favorite holiday was ..."] },
  { id: "health", track: "Speak English in 120 Days", title: "Health", type: "Conversation", difficulty: "Elementary", day: 11, focus: "Symptoms, advice, and healthy habits.", expressions: ["I have a headache.", "You should rest.", "I need to see a doctor.", "How do you feel?"] },
  { id: "food", track: "Speak English in 120 Days", title: "Food", type: "Conversation", difficulty: "Beginner", day: 14, focus: "Ordering food, taste, ingredients, and preferences.", expressions: ["I would like to order ...", "It tastes ...", "My favorite food is ...", "Can I have the menu?"] },
  { id: "feelings", track: "Speak English in 120 Days", title: "Feelings", type: "Conversation", difficulty: "Beginner", day: 15, focus: "Describing emotions and reasons.", expressions: ["I feel happy because ...", "I am worried about ...", "That makes me excited.", "How are you feeling?"] },
  { id: "family", track: "Speak English in 120 Days", title: "Family", type: "Conversation", difficulty: "Beginner", day: 17, focus: "Family members, routines, and descriptions.", expressions: ["I have ... siblings.", "My father works as ...", "We usually ...", "My family likes ..."] },
  { id: "job", track: "Speak English in 120 Days", title: "Job", type: "Conversation", difficulty: "Elementary", day: 19, focus: "Work tasks, interviews, and career goals.", expressions: ["I am good at ...", "I have experience in ...", "My responsibility is ...", "I want to improve ..."] },
  { id: "world", track: "Speak English in 120 Days", title: "Our World", type: "Conversation", difficulty: "Intermediate", day: 20, focus: "Environment, society, and global issues.", expressions: ["We should protect ...", "One problem is ...", "In many countries ...", "The solution is ..."] },
  { id: "speaking-1", track: "Jago Speaking 40 Hari", title: "Daily Speaking Drill 1", type: "Speaking", difficulty: "Beginner", day: 1, focus: "Short self-introduction with clear voice.", expressions: ["My name is ...", "I am from ...", "I work as ...", "In my free time, I ..."] },
  { id: "speaking-10", track: "Jago Speaking 40 Hari", title: "Daily Speaking Drill 10", type: "Speaking", difficulty: "Elementary", day: 10, focus: "Describe a routine or habit in one minute.", expressions: ["Every morning, I ...", "After that, I ...", "I usually ...", "Finally, I ..."] },
  { id: "speaking-20", track: "Jago Speaking 40 Hari", title: "Daily Speaking Drill 20", type: "Speaking", difficulty: "Elementary", day: 20, focus: "Explain an opinion and give reasons.", expressions: ["I think ...", "The reason is ...", "For example ...", "That is why ..."] },
  { id: "speaking-40", track: "Jago Speaking 40 Hari", title: "Daily Speaking Drill 40", type: "Speaking", difficulty: "Intermediate", day: 40, focus: "Final speaking review and personal presentation.", expressions: ["Today I want to talk about ...", "First ...", "Second ...", "In conclusion ..."] },
  { id: "pronoun", track: "Easy Grammar", title: "Pronoun", type: "Grammar", difficulty: "Beginner", focus: "Subject, object, and possessive pronouns.", expressions: ["I / me / my", "he / him / his", "she / her / her", "they / them / their"] },
  { id: "tenses", track: "Easy Grammar", title: "Tenses", type: "Grammar", difficulty: "Elementary", focus: "Positive, negative, and interrogative sentence patterns.", expressions: ["I work.", "I do not work.", "Do you work?", "She works."] },
  { id: "past", track: "Easy Grammar", title: "Past Tenses", type: "Grammar", difficulty: "Elementary", focus: "Simple past forms and past time markers.", expressions: ["I went ...", "I did not go ...", "Did you go ...?", "yesterday / last week"] },
  { id: "future", track: "Easy Grammar", title: "Future Tenses", type: "Grammar", difficulty: "Elementary", focus: "Future plans and predictions.", expressions: ["I will ...", "I am going to ...", "Will you ...?", "tomorrow / next week"] },
  { id: "sva", track: "Easy Grammar", title: "Subject Verb Agreement", type: "Grammar", difficulty: "Elementary", focus: "Matching subject and verb forms.", expressions: ["He works.", "They work.", "She does not ...", "Do they ...?"] },
  { id: "comparison", track: "Easy Grammar", title: "Comparison Degree", type: "Grammar", difficulty: "Elementary", focus: "Comparative and superlative adjectives.", expressions: ["bigger than", "more interesting than", "the best", "the most useful"] },
  { id: "article", track: "Easy Grammar", title: "Article", type: "Grammar", difficulty: "Beginner", focus: "Using a, an, and the.", expressions: ["a book", "an apple", "the station", "a useful tool"] },
  { id: "modals", track: "Easy Grammar", title: "Modals", type: "Grammar", difficulty: "Elementary", focus: "Ability, advice, permission, and obligation.", expressions: ["can", "should", "must", "may"] },
  { id: "conditional", track: "Easy Grammar", title: "Conditional If", type: "Grammar", difficulty: "Intermediate", focus: "Conditional sentences for real and imagined situations.", expressions: ["If I have time ...", "If I were ...", "If it rains ...", "I would ..."] },
  { id: "passive", track: "Easy Grammar", title: "Passive Voice", type: "Grammar", difficulty: "Intermediate", focus: "Object-focused sentences.", expressions: ["The report is prepared.", "The file was sent.", "The lesson will be reviewed.", "It is used for ..."] },
];

const baseQuestions: Question[] = [
  { id: "q-intro-1", lessonId: "intro", type: "multiple-choice", prompt: "Which expression is best for introducing yourself?", options: ["My name is Rina.", "This are Rina.", "You name is Rina.", "I name Rina."], answer: "My name is Rina.", explanation: "Use 'My name is ...' or 'I am ...' for self-introduction.", points: 10 },
  { id: "q-intro-2", lessonId: "intro", type: "multiple-choice", prompt: "Choose the correct reply: 'Nice to meet you.'", options: ["Nice to meet you, too.", "I am 27.", "This is my colleague.", "Good night yesterday."], answer: "Nice to meet you, too.", explanation: "The natural reply is 'Nice to meet you, too.'", points: 10 },
  { id: "q-intro-3", lessonId: "intro", type: "speaking-prompt", prompt: "Introduce yourself in 30 seconds. Mention your name, origin, work/study, and hobby.", answer: "sample", explanation: "A good answer uses greeting, name, background, and one personal detail.", points: 15 },
  { id: "q-activities-1", lessonId: "activities", type: "sentence-builder", prompt: "Build a sentence using: usually / I / coffee / drink / morning / in the", answer: "I usually drink coffee in the morning.", explanation: "Frequency adverb usually comes before the main verb.", points: 15 },
  { id: "q-professions-1", lessonId: "professions", type: "multiple-choice", prompt: "Which sentence talks about a job correctly?", options: ["I work as a teacher.", "I work teacher as.", "I am work as teacher.", "I working as a teacher."], answer: "I work as a teacher.", explanation: "Use 'work as a/an + job'.", points: 10 },
  { id: "q-hotel-1", lessonId: "hotel", type: "multiple-choice", prompt: "Which sentence is polite for booking a room?", options: ["I would like to book a room.", "Give me room now.", "I want room fast.", "Room you have?"], answer: "I would like to book a room.", explanation: "'I would like to ...' is a polite request pattern.", points: 10 },
  { id: "q-transport-1", lessonId: "transportation", type: "multiple-choice", prompt: "How do you ask for directions to a station?", options: ["How can I get to the station?", "How station I get?", "Where I to station?", "Station how much?"], answer: "How can I get to the station?", explanation: "Use 'How can I get to ...?' for directions.", points: 10 },
  { id: "q-money-1", lessonId: "money", type: "multiple-choice", prompt: "Choose the correct question about price.", options: ["How much does it cost?", "How many it cost?", "How cost it?", "How much is cost it?"], answer: "How much does it cost?", explanation: "Use 'How much does it cost?' to ask price.", points: 10 },
  { id: "q-health-1", lessonId: "health", type: "translation", prompt: "Translate: Saya sakit kepala.", answer: "I have a headache.", explanation: "For common symptoms, use 'I have a ...'.", points: 15 },
  { id: "q-food-1", lessonId: "food", type: "speaking-prompt", prompt: "Describe your favorite food. Mention taste, ingredients, and when you usually eat it.", answer: "sample", explanation: "Use expressions like 'It tastes ...', 'It is made from ...', and 'I usually eat it ...'.", points: 15 },
  { id: "q-feelings-1", lessonId: "feelings", type: "multiple-choice", prompt: "Which sentence explains a feeling and a reason?", options: ["I feel happy because I passed the test.", "I happy because passed.", "I am feel happy.", "Happy I test."], answer: "I feel happy because I passed the test.", explanation: "Use 'I feel + adjective + because + reason'.", points: 10 },
  { id: "q-job-1", lessonId: "job", type: "speaking-prompt", prompt: "Talk for one minute about your job or dream job. Mention responsibility, skill, and goal.", answer: "sample", explanation: "A strong answer uses role, task, skill, and future goal.", points: 15 },
  { id: "q-pronoun-1", lessonId: "pronoun", type: "multiple-choice", prompt: "Choose the correct pronoun: 'Rina is my friend. ___ is kind.'", options: ["She", "He", "They", "It"], answer: "She", explanation: "Use 'she' for a female subject.", points: 10 },
  { id: "q-tenses-1", lessonId: "tenses", type: "multiple-choice", prompt: "Choose the correct negative sentence.", options: ["I do not work on Sunday.", "I not work on Sunday.", "I does not work on Sunday.", "I am not work on Sunday."], answer: "I do not work on Sunday.", explanation: "Use 'do not + base verb' for I/you/we/they.", points: 10 },
  { id: "q-past-1", lessonId: "past", type: "multiple-choice", prompt: "Choose the correct simple past sentence.", options: ["I went to the market yesterday.", "I go to the market yesterday.", "I goed to the market yesterday.", "I going yesterday."], answer: "I went to the market yesterday.", explanation: "The past form of 'go' is 'went'.", points: 10 },
  { id: "q-future-1", lessonId: "future", type: "sentence-builder", prompt: "Build a future sentence using: tomorrow / will / study / I / English", answer: "I will study English tomorrow.", explanation: "Use subject + will + base verb + time expression.", points: 15 },
  { id: "q-sva-1", lessonId: "sva", type: "multiple-choice", prompt: "Choose the correct sentence.", options: ["She works every day.", "She work every day.", "They works every day.", "He working every day."], answer: "She works every day.", explanation: "Add -s/-es to verbs for he/she/it in simple present.", points: 10 },
  { id: "q-comparison-1", lessonId: "comparison", type: "multiple-choice", prompt: "Choose the correct comparison.", options: ["This lesson is easier than the last one.", "This lesson is more easy than the last one.", "This lesson is easiest than the last one.", "This lesson easier from last."], answer: "This lesson is easier than the last one.", explanation: "Use comparative adjective + than.", points: 10 },
  { id: "q-article-1", lessonId: "article", type: "multiple-choice", prompt: "Choose the correct article: '___ apple a day keeps the doctor away.'", options: ["An", "A", "The", "No article"], answer: "An", explanation: "Use 'an' before a vowel sound.", points: 10 },
  { id: "q-modals-1", lessonId: "modals", type: "multiple-choice", prompt: "Which sentence gives advice?", options: ["You should practice every day.", "You can practice yesterday.", "You must to practice.", "You may practicing."], answer: "You should practice every day.", explanation: "Use 'should + base verb' for advice.", points: 10 },
  { id: "q-conditional-1", lessonId: "conditional", type: "multiple-choice", prompt: "Choose the correct first conditional sentence.", options: ["If it rains, I will stay home.", "If it rain, I will stay home.", "If it rains, I stay will home.", "If it raining, I will home."], answer: "If it rains, I will stay home.", explanation: "First conditional: if + simple present, will + base verb.", points: 10 },
  { id: "q-passive-1", lessonId: "passive", type: "multiple-choice", prompt: "Choose the passive sentence.", options: ["The report was prepared yesterday.", "The report prepared yesterday.", "The report was prepare yesterday.", "The report is prepare yesterday."], answer: "The report was prepared yesterday.", explanation: "Passive voice uses be + past participle.", points: 10 },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function toneClass(tone: Tone) {
  if (tone === "safe") return "bg-teal/10 text-teal ring-teal/20";
  if (tone === "danger") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (tone === "warning") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (tone === "prime") return "bg-violet-50 text-violet-700 ring-violet-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function isCorrect(question: Question, answer: string) {
  if (question.type === "speaking-prompt") return answer.trim().split(/\s+/).filter(Boolean).length >= 12;
  return normalize(answer) === normalize(question.answer);
}

export function EnglishDayClient() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("intro");
  const [selectedQuestionId, setSelectedQuestionId] = useState("q-intro-1");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setAttempts(Array.isArray(parsed.attempts) ? parsed.attempts : []);
        setReflections(Array.isArray(parsed.reflections) ? parsed.reflections : []);
        setCustomQuestions(Array.isArray(parsed.customQuestions) ? parsed.customQuestions : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ attempts, reflections, customQuestions }));
  }, [loaded, attempts, reflections, customQuestions]);

  const questions = useMemo(() => [...baseQuestions, ...customQuestions], [customQuestions]);
  const selectedLesson = lessons.find((item) => item.id === selectedLessonId) ?? lessons[0];
  const lessonQuestions = questions.filter((item) => item.lessonId === selectedLesson.id);
  const selectedQuestion = questions.find((item) => item.id === selectedQuestionId) ?? lessonQuestions[0] ?? questions[0];

  useEffect(() => {
    const first = questions.find((item) => item.lessonId === selectedLessonId);
    if (first && !questions.some((item) => item.id === selectedQuestionId && item.lessonId === selectedLessonId)) {
      setSelectedQuestionId(first.id);
      setAnswer("");
      setFeedback("");
    }
  }, [selectedLessonId, selectedQuestionId, questions]);

  const filteredLessons = useMemo(() => {
    const keyword = query.toLowerCase();
    return lessons.filter((lesson) => {
      const text = `${lesson.title} ${lesson.track} ${lesson.focus} ${lesson.expressions.join(" ")}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || lesson.type === filter || lesson.track === filter || lesson.difficulty === filter;
      return matchText && matchFilter;
    });
  }, [query, filter]);

  const summary = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((item) => item.correct).length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const xp = attempts.reduce((sum, item) => {
      const q = questions.find((question) => question.id === item.questionId);
      return sum + (item.correct ? q?.points ?? 10 : 2);
    }, 0);
    const completedLessons = lessons.filter((lesson) => questions.filter((q) => q.lessonId === lesson.id).some((q) => attempts.some((a) => a.questionId === q.id && a.correct))).length;
    const today = new Date().toISOString().split("T")[0];
    const todayAttempts = attempts.filter((item) => item.createdAt.startsWith(today)).length;
    const weakLesson = lessons.map((lesson) => {
      const related = attempts.filter((attempt) => attempt.lessonId === lesson.id);
      const score = related.length ? Math.round((related.filter((attempt) => attempt.correct).length / related.length) * 100) : 100;
      return { title: lesson.title, score, total: related.length };
    }).filter((item) => item.total > 0).sort((a, b) => a.score - b.score)[0]?.title ?? "-";
    return { total, correct, accuracy, xp, completedLessons, todayAttempts, weakLesson };
  }, [attempts, questions]);

  function submitAnswer(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!selectedQuestion) return;
    const correct = isCorrect(selectedQuestion, answer);
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      questionId: selectedQuestion.id,
      lessonId: selectedQuestion.lessonId,
      correct,
      userAnswer: answer.trim(),
      createdAt: new Date().toISOString(),
    };
    setAttempts((previous) => [attempt, ...previous]);
    setFeedback(correct ? `Benar. ${selectedQuestion.explanation}` : `Perlu latihan. Jawaban acuan: ${selectedQuestion.answer}. ${selectedQuestion.explanation}`);
  }

  function nextQuestion() {
    const list = lessonQuestions.length > 0 ? lessonQuestions : questions;
    const index = list.findIndex((item) => item.id === selectedQuestion?.id);
    const next = list[(index + 1) % list.length];
    if (next) {
      setSelectedQuestionId(next.id);
      setAnswer("");
      setFeedback("");
    }
  }

  function addReflection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const note = String(form.get("note") || "").trim();
    const confidence = Math.min(100, Math.max(0, Number(form.get("confidence") || 50)));
    if (!note) return;
    setReflections((previous) => [{ id: crypto.randomUUID(), lessonId: selectedLesson.id, note, confidence, createdAt: new Date().toISOString() }, ...previous]);
    event.currentTarget.reset();
  }

  function addCustomQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const prompt = String(form.get("prompt") || "").trim();
    const answerText = String(form.get("answer") || "").trim();
    if (!prompt || !answerText) return;
    const item: Question = {
      id: crypto.randomUUID(),
      lessonId: selectedLesson.id,
      type: "translation",
      prompt,
      answer: answerText,
      explanation: String(form.get("explanation") || "Custom practice question.").trim(),
      points: 15,
    };
    setCustomQuestions((previous) => [item, ...previous]);
    setSelectedQuestionId(item.id);
    event.currentTarget.reset();
  }

  function loadSampleProgress() {
    const sampleAttempts: Attempt[] = baseQuestions.slice(0, 6).map((question, index) => ({
      id: `sample-${index}`,
      questionId: question.id,
      lessonId: question.lessonId,
      correct: index % 4 !== 0,
      userAnswer: question.answer,
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    }));
    setAttempts(sampleAttempts);
    setReflections([{ id: "sample-reflection", lessonId: "intro", note: "I can introduce myself, but I need to speak more naturally.", confidence: 68, createdAt: new Date().toISOString() }]);
  }

  function exportJson() {
    downloadBlob(new Blob([JSON.stringify({ attempts, reflections, customQuestions }, null, 2)], { type: "application/json" }), "english-day-progress.json");
  }

  function exportCsv() {
    const header = ["Date", "Lesson", "Question", "Correct", "Answer"];
    const rows = attempts.map((attempt) => {
      const lesson = lessons.find((item) => item.id === attempt.lessonId);
      const question = questions.find((item) => item.id === attempt.questionId);
      return [attempt.createdAt, lesson?.title ?? attempt.lessonId, question?.prompt ?? attempt.questionId, attempt.correct ? "Yes" : "No", attempt.userAnswer];
    });
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "english-day-recap.csv");
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setAttempts(Array.isArray(parsed.attempts) ? parsed.attempts : []);
        setReflections(Array.isArray(parsed.reflections) ? parsed.reflections : []);
        setCustomQuestions(Array.isArray(parsed.customQuestions) ? parsed.customQuestions : []);
      } catch {
        alert("File JSON tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  }

  function clearWorkspace() {
    setAttempts([]);
    setReflections([]);
    setCustomQuestions([]);
    setFeedback("");
    setAnswer("");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header />

        <div className="grid gap-4 lg:grid-cols-7">
          <MetricCard icon={Flame} label="XP" value={`${summary.xp}`} tone="prime" />
          <MetricCard icon={ClipboardList} label="Attempts" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={CheckCircle2} label="Correct" value={`${summary.correct}`} tone="safe" />
          <MetricCard icon={Target} label="Accuracy" value={`${summary.accuracy}%`} tone={summary.accuracy >= 70 ? "safe" : summary.accuracy >= 50 ? "warning" : "danger"} />
          <MetricCard icon={Trophy} label="Lessons" value={`${summary.completedLessons}/${lessons.length}`} tone="prime" />
          <MetricCard icon={Star} label="Today" value={`${summary.todayAttempts}`} tone="neutral" />
          <MetricCard icon={Lightbulb} label="Weak area" value={summary.weakLesson} tone="warning" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Panel title="Lesson Navigator" icon={Library}>
            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari lesson, track, expression" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                <option>Conversation</option>
                <option>Speaking</option>
                <option>Grammar</option>
                <option>Beginner</option>
                <option>Elementary</option>
                <option>Intermediate</option>
                <option>Speak English in 120 Days</option>
                <option>Jago Speaking 40 Hari</option>
                <option>Easy Grammar</option>
              </select>
            </div>
            <LessonList lessons={filteredLessons} selectedId={selectedLesson.id} onSelect={(id) => { setSelectedLessonId(id); setFeedback(""); setAnswer(""); }} />
          </Panel>

          <Panel title="Practice Arena" icon={BrainCircuit}>
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <LessonBrief lesson={selectedLesson} questionCount={lessonQuestions.length} />
              <QuestionCard question={selectedQuestion} answer={answer} setAnswer={setAnswer} onSubmit={submitAnswer} onNext={nextQuestion} feedback={feedback} setSelectedQuestionId={setSelectedQuestionId} lessonQuestions={lessonQuestions} />
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Reflection and Custom Questions" icon={Mic2}>
            <div className="grid gap-5 lg:grid-cols-2">
              <ReflectionForm onSubmit={addReflection} />
              <CustomQuestionForm onSubmit={addCustomQuestion} />
            </div>
            <ReflectionList reflections={reflections.filter((item) => item.lessonId === selectedLesson.id)} />
          </Panel>

          <Panel title="Progress Workspace" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <button onClick={loadSampleProgress} className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2.5 text-sm font-bold text-white"><Layers3 size={16} /> Contoh</button>
              <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> JSON</button>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> CSV</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><Upload size={16} /> Import<input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} /></label>
              <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan</button>
            </div>
            <AttemptTable attempts={attempts} questions={questions} />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">English Learning Lab</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">English Day</h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">Aplikasi latihan bahasa Inggris umum berbasis lesson map, kuis, speaking prompt, grammar drill, reflection note, dan progress tracker. Materi disusun dari struktur folder pembelajaran: conversation, 40-day speaking sprint, dan easy grammar.</p>
        </div>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700">Public Learning Tool</span>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <InfoCard label="Track" value="Conversation · Speaking · Grammar" />
        <InfoCard label="Mode" value="Quiz · Prompt · Reflection" />
        <InfoCard label="Storage" value="Local browser only" />
      </div>
      <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} /><p>Versi ini dibuat public-safe. Tidak memakai identitas kantor, data pegawai, logo resmi, atau data internal. Progress tersimpan lokal di browser dan tidak dikirim ke server.</p></div>
      </div>
    </div>
  );
}

function LessonList({ lessons, selectedId, onSelect }: { lessons: Lesson[]; selectedId: string; onSelect: (id: string) => void }) {
  if (lessons.length === 0) return <EmptyState title="Tidak ada lesson" description="Ubah kata kunci pencarian atau filter." />;
  return <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">{lessons.map((lesson) => <button key={lesson.id} onClick={() => onSelect(lesson.id)} className={`w-full rounded-3xl border p-4 text-left transition ${selectedId === lesson.id ? "border-teal bg-teal/5" : "border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-black text-navy">{lesson.title}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{lesson.track} {lesson.day ? `· Day ${lesson.day}` : ""}</p><p className="mt-2 text-sm leading-6 text-slate-600">{lesson.focus}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${toneClass(lesson.type === "Grammar" ? "prime" : lesson.type === "Speaking" ? "warning" : "safe")}`}>{lesson.type}</span></div></button>)}</div>;
}

function LessonBrief({ lesson, questionCount }: { lesson: Lesson; questionCount: number }) {
  return <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected lesson</p><h2 className="mt-2 text-3xl font-black">{lesson.title}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{lesson.track} · {lesson.type} · {lesson.difficulty}</p><p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{lesson.focus}</p><div className="mt-5 flex flex-wrap gap-2">{lesson.expressions.map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{item}</span>)}</div><p className="mt-5 text-sm font-bold text-teal">{questionCount} question(s) available</p></div>;
}

function QuestionCard({ question, answer, setAnswer, onSubmit, onNext, feedback, setSelectedQuestionId, lessonQuestions }: { question: Question; answer: string; setAnswer: (value: string) => void; onSubmit: (event?: FormEvent<HTMLFormElement>) => void; onNext: () => void; feedback: string; setSelectedQuestionId: (id: string) => void; lessonQuestions: Question[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">{lessonQuestions.map((item) => <button key={item.id} onClick={() => { setSelectedQuestionId(item.id); setAnswer(""); }} className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${item.id === question.id ? toneClass("prime") : toneClass("neutral")}`}>{item.type}</button>)}</div>
      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Question</p><h3 className="mt-2 text-xl font-black leading-snug text-navy">{question.prompt}</h3></div><span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-black text-teal ring-1 ring-teal/20">{question.points} XP</span></div>
        {question.options ? <div className="mt-5 grid gap-2">{question.options.map((option) => <button type="button" key={option} onClick={() => setAnswer(option)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold ${answer === option ? "border-teal bg-teal/5 text-navy" : "border-slate-200 bg-slate-50 text-slate-700"}`}>{option}</button>)}</div> : <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} placeholder={question.type === "speaking-prompt" ? "Tulis script singkat atau poin jawaban speaking di sini." : "Tulis jawaban Anda di sini."} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal/20 focus:ring-4" />}
        {feedback ? <p className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${feedback.startsWith("Benar") ? "bg-teal/10 text-teal" : "bg-amber-50 text-amber-700"}`}>{feedback}</p> : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white"><PlayCircle size={18} /> Cek jawaban</button><button type="button" onClick={onNext} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-navy ring-1 ring-slate-200"><Sparkles size={18} /> Soal berikutnya</button></div>
      </form>
    </div>
  );
}

function ReflectionForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"><p className="font-black text-navy">Reflection note</p><textarea name="note" rows={4} placeholder="Apa yang sudah lancar? Apa yang masih sulit?" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal/20 focus:ring-4" /><label className="text-sm font-semibold text-slate-700">Confidence<input name="confidence" type="number" min="0" max="100" defaultValue={60} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" /></label><button type="submit" className="rounded-2xl bg-teal px-4 py-3 text-sm font-black text-white">Simpan reflection</button></form>;
}

function CustomQuestionForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"><p className="font-black text-navy">Tambah soal sendiri</p><input name="prompt" placeholder="Pertanyaan atau instruksi" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal/20 focus:ring-4" /><input name="answer" placeholder="Jawaban acuan" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal/20 focus:ring-4" /><textarea name="explanation" rows={3} placeholder="Penjelasan singkat" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal/20 focus:ring-4" /><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-4 py-3 text-sm font-black text-white"><Plus size={17} /> Tambah soal</button></form>;
}

function ReflectionList({ reflections }: { reflections: Reflection[] }) {
  if (reflections.length === 0) return <div className="mt-5"><EmptyState title="Belum ada reflection" description="Tulis catatan singkat setelah latihan untuk melihat progres belajar." /></div>;
  return <div className="mt-5 space-y-3">{reflections.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm leading-6 text-slate-700">{item.note}</p><p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Confidence {item.confidence}%</p></div>)}</div>;
}

function AttemptTable({ attempts, questions }: { attempts: Attempt[]; questions: Question[] }) {
  if (attempts.length === 0) return <EmptyState title="Belum ada attempt" description="Kerjakan kuis untuk mulai mengisi riwayat progress." />;
  return <div className="overflow-hidden rounded-3xl border border-slate-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400"><tr><th className="px-4 py-3">Question</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Answer</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{attempts.slice(0, 20).map((attempt) => { const question = questions.find((item) => item.id === attempt.questionId); return <tr key={attempt.id}><td className="px-4 py-4 align-top font-bold text-navy">{question?.prompt ?? attempt.questionId}</td><td className="px-4 py-4 align-top">{attempt.correct ? <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-3 py-1 text-xs font-black text-teal"><CheckCircle2 size={14} /> Correct</span> : <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"><XCircle size={14} /> Review</span>}</td><td className="px-4 py-4 align-top text-xs text-slate-600">{attempt.userAnswer || "-"}</td><td className="px-4 py-4 align-top text-xs text-slate-500">{new Date(attempt.createdAt).toLocaleString("id-ID")}</td></tr>; })}</tbody></table></div></div>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal/10 text-teal"><Icon size={20} /></div><h2 className="text-xl font-black text-navy">{title}</h2></div>{children}</div>;
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  const background = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "prime" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-navy";
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${background}`}><Icon size={21} /></div><p className="mt-4 text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-xl font-black text-navy">{value}</p></div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p><p className="mt-2 font-black text-navy">{value}</p></div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><HelpCircle className="mx-auto text-slate-400" size={32} /><h3 className="mt-3 text-lg font-black text-navy">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p></div>;
}
