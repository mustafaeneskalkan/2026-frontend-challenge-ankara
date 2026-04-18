# Jotform Frontend Challenge Project

## User Information
Please fill in your information after forking this repository:

- **Name**: Mustafa Enes Kalkan

## Project Description
Missing Podo: The Ankara Case — a small investigation dashboard built with the **Next.js App Router** (React Server Components + Client Components).

### Tech stack & choices

#### Framework
- **Next.js (App Router)**: chosen to keep the app “backend-driven” while still being a single deployable frontend.
	- Server-side data fetching from Jotform (API key lives in environment variables, not in client code)
	- Built-in caching + revalidation to reduce external API calls
	- File-system routing for pages like `/people/[name]` and `/messages/[chat]`
	- Clean split between Server Components (data boundary) and Client Components (search, map, interactive panels)
- **React**: component model for UI + hooks for client interactions.
- **TypeScript**: type safety for the normalized event model and UI state.

#### External libraries
- **Fuse.js**: fuzzy search for the global header search (categorized results across People / Messages / Sightings / Checkings).
- **Leaflet + React-Leaflet**: interactive map rendering for records with usable coordinates.
- **Tailwind CSS (via PostCSS)**: utility-first styling with dark mode support.
- **ESLint + eslint-config-next**: code quality and Next.js best practices.

### What it does
It pulls submissions from multiple Jotform forms (Checkins, Messages, Sightings, Personal Notes, Anonymous Tips), normalizes them into a single investigation timeline, and provides a UI to explore the data.

### Data pipeline
- Fetches from the Jotform REST API (`/form/{id}/submissions`) per source.
- Maps every submission into a single normalized event model:
	- `timestampMs` + `timestampText`
	- `people[]` (deduped / normalized names)
	- `location` + optional `coordinates`
	- `content` (free text) + optional `reliability` (e.g. urgency/confidence)
- Merges all sources into one array and sorts newest-first to form the “global timeline”.
- Uses Next.js caching with revalidation (default ~5 minutes) so data stays reasonably fresh without repeatedly hitting the external API. Configure via `JOTFORM_REVALIDATE_SECONDS` (seconds).

### UI features
- **Investigation dashboard**: record list + record detail panel; “linked records” are computed by shared people across events.
- **Map view**: shows records with usable coordinates using Leaflet.
- **People**: browse all mentioned people and open a person page with their timeline + map.
- **Messages**: groups message submissions into chat threads and opens a thread view.
- **Global header search** (Fuse.js): categorized results across **People**, **Messages**, **Sightings**, and **Checkings**; People + Messages results deep-link to their pages.

> Note: If `JOTFORM_API_KEY` is not set, the app will not load any records.

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Configure environment

Create `.env` in the project root.

You can start from the provided example file:

```bash
cp .env.example .env
```

```powershell
Copy-Item .env.example .env
```

Then set your API key:

```bash
JOTFORM_API_KEY=your_api_key_here

# Optional: override fetch cache revalidation time (seconds)
JOTFORM_REVALIDATE_SECONDS=300
```

The app fetches data from:

`https://api.jotform.com/form/{{formID}}/submissions?apiKey={{apiKey}}&limit=1000`

Form IDs:

- Checkins: `261065067494966`
- Messages: `261065765723966`
- Sightings: `261065244786967`
- Personal Notes: `261065509008958`
- Anonymous Tips: `261065875889981`

If `JOTFORM_API_KEY` is not set, the app will not load any records.

### 3) Run the app

#### Development

```bash
npm run dev
```

Then open http://localhost:3000.

#### Production

```bash
npm run build
npm run start
```

# 🚀 Challenge Duyurusu

## 📅 Tarih ve Saat
Cumartesi günü başlama saatinden itibaren üç saattir.

## 🎯 Challenge Konsepti
Bu challenge'da, size özel hazırlanmış bir senaryo üzerine web uygulaması geliştirmeniz istenecektir. Challenge başlangıcında senaryo detayları paylaşılacaktır.Katılımcılar, verilen GitHub reposunu fork ederek kendi geliştirme ortamlarını oluşturacaklardır.

## 📦 GitHub Reposu
Challenge için kullanılacak repo: https://github.com/cemjotform/2026-frontend-challenge-ankara

## 🛠️ Hazırlık Süreci
1. GitHub reposunu fork edin
2. Tercih ettiğiniz framework ile geliştirme ortamınızı hazırlayın
3. Hazırladığınız setup'ı fork ettiğiniz repoya gönderin

## 💡 Önemli Notlar
- Katılımcılar kendi tercih ettikleri framework'leri kullanabilirler