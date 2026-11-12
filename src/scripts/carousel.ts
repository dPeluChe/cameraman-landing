// Shared carousel behavior for Features and Testimonials.
// Vanilla instead of a React island: the whole thing is under 40 lines and the
// perf budget does not justify shipping the runtime for a fader.

function initCarousel(root: HTMLElement): void {
  const panels = [...root.querySelectorAll<HTMLElement>('[data-carousel-panel]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]')];
  if (panels.length < 2) return;

  const autoplay = Number(root.dataset.autoplay ?? 0);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer: number | undefined;

  const show = (next: number) => {
    index = (next + panels.length) % panels.length;
    panels.forEach((panel, i) => {
      panel.classList.toggle('opacity-0', i !== index);
      panel.classList.toggle('pointer-events-none', i !== index);
      panel.toggleAttribute('inert', i !== index);
      panel.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = undefined;
  };

  const start = () => {
    if (!autoplay || reduceMotion) return;
    stop();
    timer = window.setInterval(() => show(index + 1), autoplay);
  };

  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      show(i);
      start();
    }),
  );

  root.addEventListener('pointerenter', stop);
  root.addEventListener('pointerleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  show(0);
  start();
}

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(initCarousel);
