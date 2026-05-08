(function () {
  // Each clip's referring expression — drop the actual ReasonVOS query
  // text into `expression` to surface it under the tile and in the
  // lightbox. The video itself overlays the expression on every frame;
  // this just lets the page show it as text too.
  const VIDEOS = [
    { src: 'videos/reasonvos_002b4dce_exp6_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '01' },
    { src: 'videos/reasonvos_0770ad03_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '02' },
    { src: 'videos/reasonvos_08746283_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '03' },
    { src: 'videos/reasonvos_50E06_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '04' },
    { src: 'videos/reasonvos_6eac00b5f389_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '05' },
    { src: 'videos/reasonvos_7177T_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '06' },
    { src: 'videos/reasonvos_82_xz40b41FHfs_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '07' },
    { src: 'videos/reasonvos_GQ341_exp0_wf0.30_overlay_with_expr.mp4',
      expression: '', dataset: 'ReasonVOS', id: '08' },
  ];

  const PLAY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

  const grid = document.getElementById('video-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxExpr = document.getElementById('lightbox-expr');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentIndex = 0;
  let lastFocused = null;

  function quote(text) {
    return '“' + text + '”';
  }

  function makeTile(item, index) {
    const article = document.createElement('article');
    article.className = 'video-tile';

    const frame = document.createElement('div');
    frame.className = 'video-tile-frame';
    frame.setAttribute('role', 'button');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute(
      'aria-label',
      item.expression ? 'Play clip: ' + item.expression : 'Play clip ' + item.id
    );

    const video = document.createElement('video');
    video.dataset.src = item.src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    frame.appendChild(video);

    const icon = document.createElement('span');
    icon.className = 'video-tile-icon';
    icon.innerHTML = PLAY_SVG;
    frame.appendChild(icon);

    const meta = document.createElement('span');
    meta.className = 'video-tile-meta';
    meta.textContent = item.dataset + ' · ' + item.id;
    frame.appendChild(meta);

    article.appendChild(frame);

    if (item.expression) {
      const expr = document.createElement('p');
      expr.className = 'video-tile-expr';
      expr.textContent = quote(item.expression);
      article.appendChild(expr);
    }

    frame.addEventListener('mouseenter', () => {
      attachSrc(video);
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
    frame.addEventListener('mouseleave', () => {
      video.pause();
      try { video.currentTime = 0; } catch (e) {}
    });
    frame.addEventListener('click', () => openLightbox(index, frame));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index, frame);
      }
    });

    return { article: article, video: video };
  }

  function attachSrc(video) {
    if (!video.src && video.dataset.src) {
      video.src = video.dataset.src;
      video.preload = 'metadata';
    }
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
    if (lightboxExpr) {
      lightboxExpr.textContent = item.expression ? quote(item.expression) : '';
      lightboxExpr.style.display = item.expression ? '' : 'none';
    }
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
      grid.appendChild(built.article);
      tileVideos.push(built.video);
    });
  }

  // Lazy-load video sources when tiles enter the viewport so initial
  // page load doesn't fire eight metadata requests at once.
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
