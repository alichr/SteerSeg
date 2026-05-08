(function () {
  const videos = [
    'videos/reasonvos_002b4dce_exp6_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_0770ad03_exp0_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_08746283_exp0_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_50E06_exp0_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_6eac00b5f389_exp0_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_7177T_exp0_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_82_xz40b41FHfs_exp0_wf0.30_overlay_with_expr.mp4',
    'videos/reasonvos_GQ341_exp0_wf0.30_overlay_with_expr.mp4',
  ];

  const grid = document.getElementById('video-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxClose = document.getElementById('lightbox-close');

  function makeTile(src, idx) {
    const tile = document.createElement('div');
    tile.className = 'video-tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', `Play sample ${idx + 1}`);

    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const overlay = document.createElement('div');
    overlay.className = 'play-overlay';
    const playIcon = document.createElement('div');
    playIcon.className = 'play-icon';
    playIcon.innerHTML = '&#9654;';
    overlay.appendChild(playIcon);

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `Sample ${idx + 1}`;

    tile.appendChild(video);
    tile.appendChild(overlay);
    tile.appendChild(label);

    // Hover preview
    tile.addEventListener('mouseenter', () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
    tile.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });

    // Click to open
    const open = () => openLightbox(src);
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });

    return tile;
  }

  function openLightbox(src) {
    lightboxVideo.src = src;
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

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  videos.forEach((src, i) => grid.appendChild(makeTile(src, i)));
})();
