
    (() => {
      const items = document.querySelectorAll('.reveal');
      const glow = document.querySelector('.cursor-glow');
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Preserve the cursor glow for users with a mouse or trackpad.
      if (
        glow &&
        window.matchMedia('(hover:hover) and (pointer:fine)').matches &&
        !reducedMotion
      ) {
        window.addEventListener('pointermove', event => {
          glow.style.left = event.clientX + 'px';
          glow.style.top = event.clientY + 'px';
          glow.style.opacity = '1';
        }, { passive: true });
      }

      // Reveal content immediately when reduced motion is requested.
      if (reducedMotion || !('IntersectionObserver' in window)) {
        items.forEach(item => item.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -20px 0px'
      });

      items.forEach(item => observer.observe(item));
    })();
  