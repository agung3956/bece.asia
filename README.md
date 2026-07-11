# bece.asia

Public digital tools for trade, documents, learning, research, and everyday workflows.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react

## Language

- English default at `/`
- Bahasa Indonesia at `/id`

## Local development

```bash
npm install
npm run dev
npm run build
```

## Data editing

Edit app catalog data in `data/apps.ts`. App entries must contain only public-safe descriptions, neutral sample data, and links owned by `bece.asia`.

Edit bilingual UI copy in `data/i18n.ts`.

## Privacy audit

```bash
npm run privacy:audit
npm run privacy:audit:strict
```

The strict audit fails when high-risk identity, contact, source-provenance, or secret patterns are detected.

## Disclaimer

bece.asia is an independent utility portal for productivity, learning, research, and workflow experiments. It is not an official institutional website and does not replace official systems, procedures, or regulations.
