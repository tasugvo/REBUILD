# Concreto & Madeira

Experiência interativa estática em HTML, CSS e JavaScript (ES Modules), utilizando Matter.js 0.19.0 e Web Audio API.

## Estrutura do projeto

- `index.html` — Estrutura da página e metadados
- `css/styles.css` — Estilos, tokens visuais e responsividade
- `js/content.js` — Centralização de todos os textos (copy), senha, memórias, dados dos restaurantes e apontamentos de assets
- `js/sound.js` — Síntese de áudio via Web Audio API
- `js/experience.js` — Simulação física (Matter.js) e renderização em Canvas HiDPI
- `js/main.js` — Orquestração da interface, escolha do convite e geração de `.ics`
- `assets/favicon.svg` — Ícone da aplicação
- `vercel.json` — Configuração de site estático e headers para Vercel

## Rodar localmente

Por usar ES Modules (`type="module"`), sirva a pasta por HTTP:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Publicar na Vercel

1. Suba esta pasta para um repositório Git (ou use `npx vercel` diretamente na raiz).
2. Na Vercel, importe o projeto como **Other** (site estático), sem comando de build e com diretório de saída na raiz (`.`).
3. Faça o deploy.
