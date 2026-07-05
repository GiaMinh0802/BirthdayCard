(() => {
  const $ = (selector) => document.querySelector(selector);
  const photos = window.BIRTHDAY_PHOTOS || [];
  const message = window.BIRTHDAY_MESSAGE || '';

  const openEnvelopeBtn = $('#openEnvelope');
  const hero = $('#hero');
  const birthdaySection = $('#birthdaySection');
  const albumSection = $('#albumSection');
  const typedText = $('#typedText');
  const replayTypingBtn = $('#replayTyping');
  const showAllBtn = $('#showAllBtn');
  const scrollAlbumBtn = $('#scrollAlbumBtn');
  const photoGrid = $('#photoGrid');
  const musicToggle = $('#musicToggle');
  const birthdayMusic = $('#birthdayMusic');
  const musicText = $('#musicText');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCaption = $('#lightboxCaption');
  const lightboxClose = $('#lightboxClose');
  const prevPhoto = $('#prevPhoto');
  const nextPhoto = $('#nextPhoto');
  const toast = $('#toast');

  let typingTimer = null;
  let typingRaf = null;
  let typingIndex = 0;
  let typingStartedAt = 0;
  let lastTypingScroll = 0;
  let currentPhotoIndex = 0;
  let hasOpened = false;
  let toastTimer = null;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3300);
  }

  function openCard() {
    if (hasOpened) return;
    hasOpened = true;
    openEnvelopeBtn.classList.add('opened');
    burstConfetti();
    tryPlaySoftly();
    setTimeout(() => {
      hero.classList.add('hidden');
      birthdaySection.classList.remove('hidden');
      albumSection.classList.remove('hidden');
      birthdaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      startTyping();
    }, 900);
  }

  openEnvelopeBtn.addEventListener('click', openCard);

  function startTyping() {
    clearInterval(typingTimer);
    cancelAnimationFrame(typingRaf);
    typingIndex = 0;
    typingStartedAt = 0;
    lastTypingScroll = 0;
    typedText.textContent = '';
    typedText.classList.remove('done');

    if (reducedMotionQuery.matches) {
      showAllMessage();
      return;
    }

    const charsPerSecond = window.matchMedia('(max-width: 620px)').matches ? 14 : 18;
    const typeFrame = (now) => {
      if (!typingStartedAt) typingStartedAt = now;
      const elapsed = (now - typingStartedAt) / 1000;
      const nextIndex = Math.min(message.length, Math.floor(elapsed * charsPerSecond));

      if (nextIndex !== typingIndex) {
        typingIndex = nextIndex;
        typedText.textContent = message.slice(0, typingIndex);
        if (now - lastTypingScroll > 180) {
          typedText.scrollTop = typedText.scrollHeight;
          lastTypingScroll = now;
        }
      }

      if (typingIndex >= message.length) {
        typedText.textContent = message;
        typedText.scrollTop = typedText.scrollHeight;
        typedText.classList.add('done');
        typingRaf = null;
        return;
      }

      typingRaf = requestAnimationFrame(typeFrame);
    };

    typingRaf = requestAnimationFrame(typeFrame);
  }

  function showAllMessage() {
    clearInterval(typingTimer);
    cancelAnimationFrame(typingRaf);
    typingRaf = null;
    typedText.textContent = message;
    typedText.classList.add('done');
    typedText.scrollTop = typedText.scrollHeight;
  }

  function scrollToLetterText() {
    typedText.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function replayTypingAndScroll() {
    startTyping();
    requestAnimationFrame(scrollToLetterText);
  }

  replayTypingBtn.addEventListener('click', replayTypingAndScroll);
  showAllBtn.addEventListener('click', showAllMessage);
  scrollAlbumBtn.addEventListener('click', () => albumSection.scrollIntoView({ behavior: 'smooth' }));

  async function tryPlaySoftly() {
    // Browser policies still require a user gesture; opening the envelope is that gesture.
    if (!birthdayMusic || !birthdayMusic.getAttribute('src')) return;
    birthdayMusic.volume = 0.1;
    try {
      await birthdayMusic.play();
      musicToggle.classList.add('playing');
      musicText.textContent = 'Tắt nhạc';
    } catch (error) {
      // No music file yet, or autoplay blocked. The user can add assets/music/birthday.mp3 later.
    }
  }

  musicToggle.addEventListener('click', async () => {
    if (birthdayMusic.paused) {
      try {
        birthdayMusic.volume = 0.1;
        await birthdayMusic.play();
        musicToggle.classList.add('playing');
        musicText.textContent = 'Tắt nhạc';
      } catch (error) {
        showToast('Hãy thêm file nhạc vào assets/music/birthday.mp3 nha ♪');
      }
    } else {
      birthdayMusic.pause();
      musicToggle.classList.remove('playing');
      musicText.textContent = 'Bật nhạc';
    }
  });

  function buildAlbum() {
    const captions = [
      'Em bé đáng yêu của Winnnnnn',
      'Một ngày thật xinh đẹppppp',
      'Công chúa của ai zạaaaaaaa',
      'Khoảnh khắc dịu dàng',
      'Nắng mềm bên em',
      'iu lốmmm',
      'Ôi Trân ở đâu BMT vậy, anh nhìn quen quá',
      'Bình yên trong mắt Na',
      'Nụ cười làm tim dịu lại',
      'Chu chu quoàiiiii~~~~~',
      'Cái đầu để ở đâu',
      'Em ghéc anh',
      'Anh Yêu Na 💗'
    ];
    photos.forEach((src, index) => {
      const button = document.createElement('button');
      button.className = 'photo-card tilt-card';
      button.type = 'button';
      button.dataset.caption = captions[index] || `Khoảnh khắc ${index + 1}`;
      button.setAttribute('aria-label', `Mở ảnh ${index + 1}`);

      const img = document.createElement('img');
      img.src = src;
      img.alt = captions[index] || `Ảnh ${index + 1}`;
      img.loading = index < 2 ? 'eager' : 'lazy';

      button.appendChild(img);
      button.addEventListener('click', () => openLightbox(index));
      photoGrid.appendChild(button);
    });
  }

  function openLightbox(index) {
    currentPhotoIndex = index;
    updateLightboxPhoto();
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function updateLightboxPhoto() {
    const caption = photoGrid.children[currentPhotoIndex]?.dataset.caption || `Khoảnh khắc ${currentPhotoIndex + 1}`;
    lightboxImg.src = photos[currentPhotoIndex];
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    lightboxCaption.textContent = '';
    document.body.style.overflow = '';
  }

  function changePhoto(step) {
    currentPhotoIndex = (currentPhotoIndex + step + photos.length) % photos.length;
    updateLightboxPhoto();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  prevPhoto.addEventListener('click', () => changePhoto(-1));
  nextPhoto.addEventListener('click', () => changePhoto(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') changePhoto(1);
    if (e.key === 'ArrowLeft') changePhoto(-1);
  });

  buildAlbum();

  // Gentle 3D tilt on devices that support hover.
  const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canTilt) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      let tiltFrame = null;
      let lastPointerEvent = null;

      const updateTilt = () => {
        if (!lastPointerEvent) {
          tiltFrame = null;
          return;
        }
        const rect = card.getBoundingClientRect();
        const x = (lastPointerEvent.clientX - rect.left) / rect.width - 0.5;
        const y = (lastPointerEvent.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 4.2).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
        tiltFrame = null;
      };

      card.addEventListener('mousemove', (e) => {
        lastPointerEvent = e;
        if (!tiltFrame) tiltFrame = requestAnimationFrame(updateTilt);
      });
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(tiltFrame);
        tiltFrame = null;
        lastPointerEvent = null;
        card.style.transform = '';
      });
    });
  }

  // Background canvas: stars, hearts, sparkles and falling flowers. requestAnimationFrame keeps it smooth.
  const skyCanvas = $('#skyCanvas');
  const skyCtx = skyCanvas.getContext('2d');
  const confettiCanvas = $('#confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const floaters = [];
  const confetti = [];
  const glyphs = ['♡', '✦', '✧', '❀', '✿', '✼'];
  let skyRaf = null;
  let confettiRaf = null;
  let resizeRaf = null;

  function resizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    [skyCanvas, confettiCanvas].forEach((canvas) => {
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    });
    skyCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    confettiCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function seedFloaters() {
    floaters.length = 0;
    if (reducedMotionQuery.matches) return;
    const baseDensity = window.matchMedia('(max-width: 620px)').matches ? 26000 : 19000;
    const total = Math.min(72, Math.max(28, Math.floor(W * H / baseDensity)));
    for (let i = 0; i < total; i++) {
      floaters.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: 10 + Math.random() * 26,
        vx: -8 + Math.random() * 16,
        size: 9 + Math.random() * 18,
        alpha: .18 + Math.random() * .48,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        rot: Math.random() * Math.PI * 2,
        spin: -0.7 + Math.random() * 1.4,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  function drawSky(now) {
    skyCtx.clearRect(0, 0, W, H);

    // Starry sky glow
    const gradient = skyCtx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, 'rgba(255,255,255,0.10)');
    gradient.addColorStop(.5, 'rgba(255,214,232,0.06)');
    gradient.addColorStop(1, 'rgba(184,244,223,0.08)');
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, W, H);

    for (const f of floaters) {
      f.twinkle += 0.018;
      const opacity = f.alpha * (0.62 + Math.sin(f.twinkle) * 0.38);
      skyCtx.save();
      skyCtx.globalAlpha = opacity;
      skyCtx.translate(f.x, f.y);
      skyCtx.rotate(f.rot);
      skyCtx.font = `${f.size}px Georgia, serif`;
      if (f.glyph === '♡') skyCtx.fillStyle = 'rgba(255, 116, 181, .9)';
      else if (f.glyph === '❀' || f.glyph === '✿' || f.glyph === '✼') skyCtx.fillStyle = 'rgba(255, 205, 226, .9)';
      else skyCtx.fillStyle = 'rgba(255,255,255,.95)';
      skyCtx.fillText(f.glyph, 0, 0);
      skyCtx.restore();
    }
  }

  let last = performance.now();
  function animateSky(now) {
    if (document.hidden || reducedMotionQuery.matches) {
      skyRaf = null;
      return;
    }
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    for (const f of floaters) {
      f.y += f.vy * dt;
      f.x += Math.sin(now * 0.0007 + f.twinkle) * 14 * dt + f.vx * dt;
      f.rot += f.spin * dt;
      if (f.y > H + 30) {
        f.y = -30;
        f.x = Math.random() * W;
      }
      if (f.x < -30) f.x = W + 30;
      if (f.x > W + 30) f.x = -30;
    }
    drawSky(now);
    skyRaf = requestAnimationFrame(animateSky);
  }

  function burstConfetti() {
    if (reducedMotionQuery.matches) return;
    const count = window.matchMedia('(max-width: 620px)').matches ? 130 : 210;
    const colors = ['#ff8fc4', '#d9c7ff', '#b8f4df', '#c8f2ff', '#fff8b8', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.16;
      const speed = 210 + Math.random() * 580;
      confetti.push({
        x: W / 2 + (Math.random() - .5) * 120,
        y: H * .42,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: 760 + Math.random() * 260,
        size: 5 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        spin: -9 + Math.random() * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.5 + Math.random() * 1.4,
        age: 0,
        shape: Math.random() > .75 ? 'heart' : 'rect'
      });
    }
    if (!confettiRaf) {
      lastConfetti = performance.now();
      confettiRaf = requestAnimationFrame(animateConfetti);
    }
  }

  let lastConfetti = performance.now();
  function animateConfetti(now) {
    if (!confetti.length || document.hidden) {
      confettiCtx.clearRect(0, 0, W, H);
      confettiRaf = null;
      return;
    }
    const dt = Math.min(0.032, (now - lastConfetti) / 1000);
    lastConfetti = now;
    confettiCtx.clearRect(0, 0, W, H);
    for (let i = confetti.length - 1; i >= 0; i--) {
      const p = confetti[i];
      p.age += dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      const alpha = Math.max(0, 1 - p.age / p.life);
      confettiCtx.save();
      confettiCtx.globalAlpha = alpha;
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'heart') {
        confettiCtx.font = `${p.size * 1.7}px serif`;
        confettiCtx.fillText('♥', -p.size / 2, p.size / 2);
      } else {
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .68);
      }
      confettiCtx.restore();
      if (p.age > p.life || p.y > H + 80) confetti.splice(i, 1);
    }
    confettiRaf = requestAnimationFrame(animateConfetti);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeCanvas();
      seedFloaters();
      drawSky(performance.now());
      resizeRaf = null;
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    last = performance.now();
    lastConfetti = performance.now();
    if (!reducedMotionQuery.matches && !skyRaf) skyRaf = requestAnimationFrame(animateSky);
    if (confetti.length && !confettiRaf) confettiRaf = requestAnimationFrame(animateConfetti);
  });
  resizeCanvas();
  seedFloaters();
  drawSky(performance.now());
  if (!reducedMotionQuery.matches) skyRaf = requestAnimationFrame(animateSky);
})();
