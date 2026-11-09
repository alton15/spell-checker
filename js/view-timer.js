import { parseGameTime, formatTime } from './time.js';

/**
 * Turns the timer display into an editable field.
 * onSubmit(seconds) is called with a valid game time; invalid input keeps the field open.
 */
export function createTimerEditor({ display, form, input, error }, t, onSubmit) {
  const close = () => {
    form.hidden = true;
    display.hidden = false;
    input.removeAttribute('aria-invalid');
    error.textContent = '';
  };

  display.addEventListener('click', () => {
    input.value = display.textContent === formatTime(0) ? '' : display.textContent;
    display.hidden = true;
    form.hidden = false;
    input.focus();
    input.select();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const seconds = parseGameTime(input.value);
    if (seconds === null) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = t.timeInvalid;
      return;
    }
    close();
    onSubmit(seconds);
    display.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      display.focus();
    }
  });

  // Tapping elsewhere: apply if valid, otherwise discard.
  input.addEventListener('blur', () => {
    if (form.hidden) return;
    const seconds = parseGameTime(input.value);
    close();
    if (seconds !== null) onSubmit(seconds);
  });
}
