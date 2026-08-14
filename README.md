# Goodnight, Little Town

A cozy little browser game. It is late, and this tiny town needs to sleep: hold to **Shhh** the noise, toggle streetlights and windows, choose the weather, and learn each house's personality until every window is dark — for ten authored nights, ending with the whole town finally asleep. All graphics are SVG and all audio is synthesized in the browser; there are no asset files. Fully playable muted, on desktop or phone. A first playthrough takes 20–30 minutes.

**Play it:** https://jonborchardt.github.io/goodnight/

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

Dev conveniences: `?night=N` jumps to a night; `window.__game.state/.controls/.setSpeed` and `window.__audio` are exposed in dev builds.
