import { BOOTS, COSMIC_INSIGHT_HASTE } from './config.js';

export function getHaste({ cosmicInsight, boots }) {
  const cosmic = cosmicInsight ? COSMIC_INSIGHT_HASTE : 0;
  return cosmic + (BOOTS[boots]?.haste ?? 0);
}

export function calculateCooldown(baseCooldown, haste) {
  return Math.round(baseCooldown * (100 / (100 + haste)));
}
