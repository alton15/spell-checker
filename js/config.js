// Game data verified against Data Dragon 16.22.1 and the LoL wiki (2026-11).
export const DDRAGON_VERSION = '16.22.1';
const DDRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn';

export const spellIconUrl = (iconFile) =>
  `${DDRAGON_CDN}/${DDRAGON_VERSION}/img/spell/${iconFile}`;
export const itemIconUrl = (itemId) =>
  `${DDRAGON_CDN}/${DDRAGON_VERSION}/img/item/${itemId}.png`;
export const COSMIC_INSIGHT_ICON =
  `${DDRAGON_CDN}/img/perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png`;

// cooldown: base seconds. null = not tracked (e.g. Smite uses charges).
export const SPELLS = Object.freeze({
  flash: { cooldown: 300, icon: 'SummonerFlash.png', name: { ko: '점멸', en: 'Flash' } },
  teleport: { cooldown: 300, icon: 'SummonerTeleport.png', name: { ko: '순간이동', en: 'Teleport' } },
  ignite: { cooldown: 180, icon: 'SummonerDot.png', name: { ko: '점화', en: 'Ignite' } },
  barrier: { cooldown: 180, icon: 'SummonerBarrier.png', name: { ko: '방어막', en: 'Barrier' } },
  exhaust: { cooldown: 240, icon: 'SummonerExhaust.png', name: { ko: '탈진', en: 'Exhaust' } },
  ghost: { cooldown: 240, icon: 'SummonerHaste.png', name: { ko: '유체화', en: 'Ghost' } },
  heal: { cooldown: 240, icon: 'SummonerHeal.png', name: { ko: '회복', en: 'Heal' } },
  cleanse: { cooldown: 240, icon: 'SummonerBoost.png', name: { ko: '정화', en: 'Cleanse' } },
  smite: { cooldown: null, icon: 'SummonerSmite.png', name: { ko: '강타', en: 'Smite' } }
});
export const SPELL_IDS = Object.freeze(Object.keys(SPELLS));

export const COSMIC_INSIGHT_HASTE = 18;

// Boots cycle in this order when tapped.
export const BOOTS = Object.freeze({
  none: { haste: 0, itemId: null },
  lucidity: { haste: 10, itemId: 3158 },
  crimson: { haste: 20, itemId: 3171 }
});
export const BOOTS_ORDER = Object.freeze(['none', 'lucidity', 'crimson']);

export const ROLES = Object.freeze(['top', 'jungle', 'mid', 'adc', 'support']);
export const DEFAULT_SPELLS = Object.freeze({
  top: ['flash', 'teleport'],
  jungle: ['flash', 'smite'],
  mid: ['flash', 'ignite'],
  adc: ['flash', 'heal'],
  support: ['flash', 'ignite']
});

export const WARNING_SECONDS = 10;
export const READY_HIGHLIGHT_MS = 3000;
export const TICK_MS = 250;
export const MAX_RESUME_MS = 3 * 60 * 60 * 1000;
export const MAX_GAME_SECONDS = 99 * 60 + 59;
