# AlgoSphere

AlgoSphere is a client-side DSA learning application built with React, TypeScript, Vite, Tailwind CSS, and React Router. It uses deterministic simulation steps to synchronize 2D SVG visualizations, explanations, variables, operation counts, and source-code highlighting.

## Run locally

```bash
npm install
npm run dev
```

## Implemented learning modules

The current interactive modules cover FIFO queues, stacks, bubble/insertion/selection/merge sort, linear/binary search, BFS, DFS, Dijkstra, Prim, Kadane's maximum-subarray algorithm, and Fibonacci dynamic programming. The catalog marks unfinished curriculum areas as planned rather than presenting them as working simulations.

The algorithm workspace supports Python, C++, and Java reference code, step navigation, playback speed, timelines, editable inputs, random inputs, local completion tracking, and operation counters.

## Checks

```bash
npm test
npm run lint
npm run build
```

## Vercel

This is a Vite single-page application. Use the Vite framework preset, `npm run build` as the build command, and `dist` as the output directory. `vercel.json` rewrites client-side routes to the application entry point so direct navigation and refreshes work.

The application currently requires no environment variables. `.env` files and `.vercel` deployment state are excluded from Git.