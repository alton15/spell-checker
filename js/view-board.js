import { SPELLS, BOOTS, COSMIC_INSIGHT_HASTE, COSMIC_INSIGHT_ICON, WARNING_SECONDS, spellIconUrl, itemIconUrl } from './config.js';
import { getElapsedSeconds, isGameRunning } from './state.js';
import { formatTime } from './time.js';
import { el, setText, setAttr } from './dom.js';

const ICON_SIZE = 64;
const SMALL_ICON_SIZE = 22;

function buildToggles(profileIndex, t) {
  const cosmic = el('button', {
    type: 'button', className: 'toggle', dataset: { action: 'cosmic', profile: profileIndex },
    'aria-pressed': 'false', title: `${t.cosmic} (+${COSMIC_INSIGHT_HASTE})`
  }, [
    el('img', { src: COSMIC_INSIGHT_ICON, alt: '', width: SMALL_ICON_SIZE, height: SMALL_ICON_SIZE, loading: 'lazy' }),
    el('span', { className: 'toggle-label', text: t.cosmic })
  ]);
  const boots = el('button', {
    type: 'button', className: 'toggle', dataset: { action: 'boots', profile: profileIndex }, title: t.bootsHint
  }, [
    el('img', { className: 'boots-icon', alt: '', width: SMALL_ICON_SIZE, height: SMALL_ICON_SIZE, hidden: true }),
    el('span', { className: 'toggle-label boots-label' })
  ]);
  return { node: el('div', { className: 'toggles' }, [cosmic, boots]), cosmic, boots };
}

function buildSpellSlot(profileIndex, spellIndex, t) {
  const data = { profile: profileIndex, spell: spellIndex };
  const icon = el('img', { className: 'spell-icon', alt: '', width: ICON_SIZE, height: ICON_SIZE });
  const name = el('span', { className: 'spell-name' });
  const remaining = el('span', { className: 'cd-remaining' });
  const eta = el('span', { className: 'cd-eta' });
  const button = el('button', { type: 'button', className: 'spell-btn', dataset: { action: 'use', ...data } }, [
    icon,
    el('span', { className: 'spell-overlay' }, [
      el('span', { className: 'cd-row' }, [el('span', { className: 'cd-label', text: t.cd }), remaining]),
      el('span', { className: 'cd-row' }, [el('span', { className: 'cd-label', text: t.eta }), eta])
    ]),
    name
  ]);
  const change = el('button', {
    type: 'button', className: 'spell-change', dataset: { action: 'pick', ...data },
    'aria-label': t.changeSpell, title: t.changeSpell, text: '⇄'
  });
  return { node: el('div', { className: 'spell-slot' }, [button, change]), button, icon, name, remaining, eta };
}

export function buildBoard(container, state, t) {
  const profiles = state.profiles.map((profile, profileIndex) => {
    const toggles = buildToggles(profileIndex, t);
    const slots = profile.spells.map((_, spellIndex) => buildSpellSlot(profileIndex, spellIndex, t));
    const node = el('section', { className: 'profile', 'aria-label': t.roles[profile.role] }, [
      el('h2', { className: 'profile-label', text: t.roles[profile.role] }),
      toggles.node,
      el('div', { className: 'spells' }, slots.map(s => s.node))
    ]);
    container.append(node);
    return { toggles, slots };
  });
  return { profiles };
}

function updateToggles({ cosmic, boots }, profile, t) {
  setAttr(cosmic, 'aria-pressed', String(profile.cosmicInsight));
  const bootsInfo = BOOTS[profile.boots];
  const bootsIcon = boots.querySelector('.boots-icon');
  boots.classList.toggle('is-on', profile.boots !== 'none');
  bootsIcon.hidden = bootsInfo.itemId === null;
  if (bootsInfo.itemId !== null) setAttr(bootsIcon, 'src', itemIconUrl(bootsInfo.itemId));
  const label = bootsInfo.haste ? `${t.boots[profile.boots]} +${bootsInfo.haste}` : t.boots.none;
  setText(boots.querySelector('.boots-label'), label);
}

function updateSlot(slot, spell, ctx) {
  const info = SPELLS[spell.id];
  const isTracked = info.cooldown !== null;
  const remaining = spell.endTime === null ? 0 : spell.endTime - ctx.elapsed;
  const isCooldown = remaining > 0;
  const { button } = slot;

  setAttr(slot.icon, 'src', spellIconUrl(info.icon));
  setText(slot.name, isTracked ? info.name[ctx.lang] : `${info.name[ctx.lang]} · ${ctx.t.untracked}`);
  button.disabled = !ctx.isRunning || !isTracked;
  button.classList.toggle('is-flash', spell.id === 'flash');
  button.classList.toggle('is-cooldown', isCooldown);
  button.classList.toggle('is-warning', isCooldown && remaining <= WARNING_SECONDS);
  button.classList.toggle('is-ready', ctx.isReadyFlash);
  if (isCooldown) {
    setText(slot.remaining, formatTime(remaining));
    setText(slot.eta, formatTime(spell.endTime));
  }
  const label = isCooldown
    ? `${info.name[ctx.lang]} ${ctx.t.cd} ${formatTime(remaining)}, ${ctx.t.eta} ${formatTime(spell.endTime)}`
    : info.name[ctx.lang];
  setAttr(button, 'aria-label', label);
}

/** Updates the existing board in place. readyUntil maps "p-s" keys to highlight end timestamps. */
export function updateBoard(board, state, now, ctx) {
  const elapsed = getElapsedSeconds(state, now);
  const isRunning = isGameRunning(state);
  state.profiles.forEach((profile, p) => {
    const view = board.profiles[p];
    updateToggles(view.toggles, profile, ctx.t);
    profile.spells.forEach((spell, s) => {
      const isReadyFlash = (ctx.readyUntil.get(`${p}-${s}`) ?? 0) > now;
      updateSlot(view.slots[s], spell, { ...ctx, elapsed, isRunning, isReadyFlash });
    });
  });
}
