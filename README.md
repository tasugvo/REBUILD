# Concreto & Madeira — 3D

Experiência interativa tridimensional (3D) em tempo real com **Three.js** (`WebGLRenderer`, `OrbitControls`, `Raycaster`, materiais PBR) e **Rapier 3D** (`@dimforge/rapier3d-compat`), sem etapa de build.

## Arquitetura

- `index.html` — Estrutura semântica, preloads ESM e overlays
- `css/`
  - `tokens.css` — Tokens do design system (cores, tipografia, raios, curvas e z-index)
  - `base.css` — Reset, foco visível (`:focus-visible`), animações e `prefers-reduced-motion`
  - `components.css` — Botões, superfícies glass, top bar, HUD e banners
  - `sections.css` — Gate, sidebar de reconstrução, citação narrativa e Ato 4 (carta, carrossel, convite)
- `js/`
  - `main.js` — Ponto de entrada e orquestração das fases
  - `config/content.js` — Textos, senha, peças de reconstrução, músicas e restaurantes
  - `services/sound.js` — Síntese procedural de áudio (Web Audio API)
  - `services/storage.js` — Persistência da escolha final (`localStorage` + cookie)
  - `scene/textures.js` — Texturas PBR procedurais (concreto, madeira e terreno)
  - `scene/environment.js` — Terreno, vegetação com LOD, chuva e partículas de poeira
  - `scene/structures.js` — Construção física e visual das casas de concreto e madeira
  - `scene/controller.js` — Motor 3D, loop físico Rapier 3D, tempestade e reconstrução
  - `ui/dom.js`, `ui/gate.js`, `ui/rebuildSidebar.js`, `ui/act4.js` — Controladores de interface
- `assets/` — Favicon, imagens de memórias e QR codes Spotify
- `vercel.json` / `.vercelignore` / `robots.txt` — Configuração de deploy estático na Vercel

## Rodar localmente

```bash
python3 -m http.server 8080
```

Acesse `http://localhost:8080` em um notebook ou PC (mínimo 720p).

## Deploy na Vercel

Projeto estático sem etapa de build (Framework Preset: **Other**, Output Directory: `.`).

```bash
vercel --prod
```
