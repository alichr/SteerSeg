(function () {
  // ---------- Video gallery ----------
  const videos = [
    { src: 'videos/reasonvos_002b4dce_exp6_wf0.30_overlay_with_expr.mp4', label: 'Sample 1' },
    { src: 'videos/reasonvos_0770ad03_exp0_wf0.30_overlay_with_expr.mp4', label: 'Sample 2' },
    { src: 'videos/reasonvos_08746283_exp0_wf0.30_overlay_with_expr.mp4', label: 'Sample 3' },
    { src: 'videos/reasonvos_50E06_exp0_wf0.30_overlay_with_expr.mp4',    label: 'Sample 4' },
    { src: 'videos/reasonvos_6eac00b5f389_exp0_wf0.30_overlay_with_expr.mp4', label: 'Sample 5' },
    { src: 'videos/reasonvos_7177T_exp0_wf0.30_overlay_with_expr.mp4',    label: 'Sample 6' },
    { src: 'videos/reasonvos_82_xz40b41FHfs_exp0_wf0.30_overlay_with_expr.mp4', label: 'Sample 7' },
    { src: 'videos/reasonvos_GQ341_exp0_wf0.30_overlay_with_expr.mp4',    label: 'Sample 8' },
  ];

  const grid = document.getElementById('video-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  // lucide: play
  const PLAY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

  function makeTile(item) {
    const tile = document.createElement('div');
    tile.className = 'video-tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', `Play ${item.label}`);

    const video = document.createElement('video');
    video.src = item.src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const overlay = document.createElement('div');
    overlay.className = 'play-overlay';
    const playIcon = document.createElement('div');
    playIcon.className = 'play-icon';
    playIcon.innerHTML = PLAY_SVG;
    overlay.appendChild(playIcon);

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.label;

    tile.appendChild(video);
    tile.appendChild(overlay);
    tile.appendChild(label);

    tile.addEventListener('mouseenter', () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
    tile.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });

    const open = () => openLightbox(item);
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });

    return tile;
  }

  function openLightbox(item) {
    lightboxVideo.src = item.src;
    if (lightboxCaption) lightboxCaption.textContent = item.label;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const p = lightboxVideo.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) closeLightbox();
  });

  if (grid) {
    videos.forEach((item) => grid.appendChild(makeTile(item)));
  }

  // ---------- Sticky-nav scroll state ----------
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Reveal-on-scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Copy BibTeX ----------
  const copyBtn = document.getElementById('copy-btn');
  const bibtexCode = document.getElementById('bibtex-code');
  if (copyBtn && bibtexCode) {
    const label = copyBtn.querySelector('.copy-label');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bibtexCode.innerText);
        copyBtn.classList.add('copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (label) label.textContent = 'Copy';
        }, 1800);
      } catch (err) {
        const range = document.createRange();
        range.selectNode(bibtexCode);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }
})();
