# LoL Spell Checker

A lightweight web tool to track enemy summoner spell cooldowns in League of Legends.
Live at [spell.kkg-dev.com](https://spell.kkg-dev.com) (KR) and [/en/](https://spell.kkg-dev.com/en/).

## Features

- 5 enemy roles × 2 summoner spells, picked from the real spell list (Data Dragon icons)
- Summoner spell haste: Cosmic Insight (+18), boots cycle none → Lucidity (+10) → Crimson Lucidity (+20)
- Remaining cooldown + ETA (game time the spell is back)
- Tap the clock to type the in-game time (`12:34`, `1234`, `12`); ±1s / ±5s fine-tuning
- Last 10 seconds pulse; chime + vibration + highlight when a spell is back (mute toggle)
- Running game survives reloads (localStorage)
- Static cooldown table + FAQ for search engines; separate KR (`/`) and EN (`/en/`) pages

## Usage

1. Open [spell.kkg-dev.com](https://spell.kkg-dev.com) on a second monitor or your phone.
2. Press **Start** when the game starts. Opened it late? Tap the clock and type the in-game time (`12:34` / `1234`).
3. Pick each enemy's spells with **⇄**. Turn on **Insight** / boots when they have Cosmic Insight or Lucidity boots.
4. Tap a spell when the enemy uses it. **CD** = time left, **ETA** = game time it's back. It pulses for the last 10s and chimes when ready.
5. Press **End** after the game to reset.

### 사용법 (KR)

1. PC 세컨 모니터나 휴대폰에서 [spell.kkg-dev.com](https://spell.kkg-dev.com)을 엽니다.
2. 게임이 시작되면 **게임 시작**을 누릅니다. 늦게 켰다면 타이머를 눌러 인게임 시간(`12:34` / `1234`)을 입력합니다.
3. **⇄** 버튼으로 상대 스펠을 고르고, 우통 룬이나 명석함 신발이 있으면 **우통**·신발 버튼을 켭니다.
4. 상대가 스펠을 쓰면 해당 스펠을 누릅니다. **쿨** = 남은 시간, **활성** = 돌아오는 게임 시간. 10초 전부터 깜빡이고 돌아오면 알림음이 울립니다.
5. 게임이 끝나면 **게임 종료**로 초기화합니다.

## Development

No dependencies, no build step. ES modules need an HTTP server (opening the file directly won't work):

```bash
npm run serve   # python3 -m http.server 8080 → http://localhost:8080
npm test        # node --test (Node 20+)
```

```
index.html, en/index.html   pages (static SEO content lives here)
css/style.css
js/config.js                game data (spells, haste, Data Dragon version)
js/cooldown.js, time.js     pure calculation / parsing
js/state.js                 immutable state transitions
js/storage.js               localStorage persistence with validation
js/view-*.js, app.js        DOM and wiring
tests/                      unit tests + page checks (cooldown table must match the calculator)
```

### Updating for a new patch

1. Update cooldowns / haste in `js/config.js` (and `DDRAGON_VERSION`).
2. Update the cooldown table rows in both pages; `npm test` fails if any cell disagrees with the calculator.
3. Bump `<lastmod>` in `sitemap.xml`.

## Deployment

Cloudflare Pages serves the repo root as-is. `404.html` disables the SPA fallback so `robots.txt`, `sitemap.xml` and unknown paths return real files / 404s.

---

LoL Spell Checker isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
