import { SPELLS, SPELL_IDS, spellIconUrl } from './config.js';
import { el } from './dom.js';

const ICON_SIZE = 48;

/** Modal grid for choosing a summoner spell. onPick(profileIndex, spellIndex, spellId). */
export function createSpellPicker(dialog, lang, t, onPick) {
  let target = null;
  const title = el('h2', { className: 'picker-title', id: 'picker-title' });
  const grid = el('div', { className: 'picker-grid' }, SPELL_IDS.map(id =>
    el('button', { type: 'button', className: 'picker-option', dataset: { spellId: id } }, [
      el('img', { src: spellIconUrl(SPELLS[id].icon), alt: '', width: ICON_SIZE, height: ICON_SIZE, loading: 'lazy' }),
      el('span', { text: SPELLS[id].name[lang] })
    ])));
  const close = el('button', { type: 'button', className: 'picker-close', text: t.close });
  dialog.setAttribute('aria-labelledby', 'picker-title');
  dialog.append(title, grid, close);

  grid.addEventListener('click', (e) => {
    const option = e.target.closest('.picker-option');
    if (!option || !target) return;
    onPick(target.profileIndex, target.spellIndex, option.dataset.spellId);
    dialog.close();
  });
  close.addEventListener('click', () => dialog.close());
  // Clicking the backdrop (the dialog element itself) closes it.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { target = null; });

  function open(profileIndex, spellIndex, roleName, currentId) {
    target = { profileIndex, spellIndex };
    title.textContent = t.pickerTitle(roleName, spellIndex + 1);
    grid.querySelectorAll('.picker-option').forEach(option => {
      option.setAttribute('aria-pressed', String(option.dataset.spellId === currentId));
    });
    dialog.showModal();
  }

  return { open };
}
