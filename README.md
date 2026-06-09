# Marble Jar

A small interactive 3D marble jar built with Next.js, React, TypeScript, and Three.js.

Add marbles one at a time and watch them drop into a jar with a lightweight custom physics simulation. The jar capacity is configurable, and the jar resizes so a full count visually feels full.

## Features

- 3D jar rendered with React Three Fiber
- Lightweight custom marble physics
- Procedural marble textures
- Adjustable jar capacity
- Keyboard shortcut: press Space to add a marble
- Local persistence with `localStorage`
- Docker-ready production build

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

Stop the container:

```bash
docker compose down
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build production app
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- Next.js
- React
- TypeScript
- Three.js
- React Three Fiber
- Tailwind CSS
