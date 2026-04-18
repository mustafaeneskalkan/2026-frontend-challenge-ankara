# Jotform Frontend Challenge Project

## User Information
Please fill in your information after forking this repository:

- **Name**: Mustafa Enes Kalkan

## Project Description
Missing Podo: The Ankara Case — a small investigation dashboard built with the Next.js App Router.

It fetches submissions from multiple Jotform forms (Checkins, Messages, Sightings, Personal Notes, Anonymous Tips), normalizes them into a single timeline, and lets you:

- Browse people mentioned across records
- Search/filter by person, location, or content
- Open a record detail view and see linked records (shared people)

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Configure environment

Create `.env.local` in the project root:

```bash
JOTFORM_API_KEY=your_api_key_here
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

### 3) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

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