(function () {
  // The referring expression is overlaid on every frame of each clip,
  // so the video carries the language by itself; only the dataset and
  // clip index need to live in HTML.
  const VIDEOS = [
    { src: 'videos/reasonvos_002b4dce_exp6_wf0.30_overlay_with_expr.mp4',    dataset: 'ReasonVOS', id: '01' },
    { src: 'videos/reasonvos_0770ad03_exp0_wf0.30_overlay_with_expr.mp4',    dataset: 'ReasonVOS', id: '02' },
    { src: 'videos/reasonvos_08746283_exp0_wf0.30_overlay_with_expr.mp4',    dataset: 'ReasonVOS', id: '03' },
    { src: 'videos/reasonvos_50E06_exp0_wf0.30_overlay_with_expr.mp4',       dataset: 'ReasonVOS', id: '04' },
    { src: 'videos/reasonvos_6eac00b5f389_exp0_wf0.30_overlay_with_expr.mp4', dataset: 'ReasonVOS', id: '05' },
    { src: 'videos/reasonvos_7177T_exp0_wf0.30_overlay_with_expr.mp4',       dataset: 'ReasonVOS', id: '06' },
    { src: 'videos/reasonvos_82_xz40b41FHfs_exp0_wf0.30_overlay_with_expr.mp4', dataset: 'ReasonVOS', id: '07' },
    { src: 'videos/reasonvos_GQ341_exp0_wf0.30_overlay_with_expr.mp4',       dataset: 'ReasonVOS', id: '08' },
  ];

  const PLAY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

  const grid = document.getElementById('video-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentIndex = 0;
  let lastFocused = null;

  function attachSrc(video) {
    if (!video.src && video.dataset.src) {
      video.src = video.dataset.src;
      video.preload = 'metadata';
    }
  }

  function makeTile(item, index) {
    const tile = document.createElement('div');
    tile.className = 'video-tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', 'Play ' + item.dataset + ' clip ' + item.id);

    const video = document.createElement('video');
    video.dataset.src = item.src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    tile.appendChild(video);

    const icon = document.createElement('span');
    icon.className = 'video-tile-icon';
    icon.innerHTML = PLAY_SVG;
    tile.appendChild(icon);

    const meta = document.createElement('span');
    meta.className = 'video-tile-meta';
    meta.textContent = item.dataset + ' · ' + item.id;
    tile.appendChild(meta);

    tile.addEventListener('mouseenter', () => {
      attachSrc(video);
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
    tile.addEventListener('mouseleave', () => {
      video.pause();
      try { video.currentTime = 0; } catch (e) {}
    });
    tile.addEventListener('click', () => openLightbox(index, tile));
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index, tile);
      }
    });

    return { tile: tile, video: video };
  }

  function openLightbox(index, originEl) {
    currentIndex = index;
    lastFocused = originEl || document.activeElement;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function renderLightbox() {
    const item = VIDEOS[currentIndex];
    lightboxVideo.src = item.src;
    if (lightboxMeta) {
      lightboxMeta.textContent =
        item.dataset + ' · clip ' + (currentIndex + 1) + ' of ' + VIDEOS.length;
    }
    const p = lightboxVideo.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + VIDEOS.length) % VIDEOS.length;
    renderLightbox();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => step(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => step(+1));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(+1);
  });

  const tileVideos = [];
  if (grid) {
    VIDEOS.forEach((item, i) => {
      const built = makeTile(item, i);
      grid.appendChild(built.tile);
      tileVideos.push(built.video);
    });
  }

  // Lazy-load video sources when tiles enter the viewport so initial
  // page load doesn't fire eight metadata requests at once. Loading
  // metadata renders the first frame as a poster — and since the
  // expression is burned in from frame 0, that's the thumbnail.
  if ('IntersectionObserver' in window && tileVideos.length) {
    const lazyIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          attachSrc(entry.target);
          lazyIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px' });
    tileVideos.forEach((v) => lazyIo.observe(v));
  } else {
    tileVideos.forEach((v) => attachSrc(v));
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
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealIo.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    reveals.forEach((el) => revealIo.observe(el));
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
