export function createAct4Controller({ elements, copy, restaurants, quoteBtnLabel, storage }) {
  let targetProgress = 0;
  let displayedProgress = 0;
  let scrollRaf = 0;
  let activeMusicIndex = 0;
  let musicCardEls = [];
  let musicDotEls = [];

  function renderLetter() {
    if (!elements.act4Letter) return;
    const raw = copy.letter;
    const paragraphs = Array.isArray(raw)
      ? raw.map((item) => String(item).trim()).filter(Boolean)
      : String(raw).split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);

    elements.act4Letter.innerHTML = '';
    paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      elements.act4Letter.appendChild(p);
    });
  }

  function applyScrollProgressUI(progress) {
    const clamped = Math.min(1, Math.max(0, progress));
    if (elements.act4ScrollFill) {
      elements.act4ScrollFill.style.setProperty('--scroll-progress', clamped.toFixed(4));
    }
    if (elements.act4ScrollPct) {
      elements.act4ScrollPct.textContent = `${Math.round(clamped * 100)}%`;
    }
    if (elements.act4ScrollProgress) {
      elements.act4ScrollProgress.classList.toggle('is-complete', clamped >= 0.995);
    }
  }

  function tickScrollProgress() {
    scrollRaf = 0;
    const diff = targetProgress - displayedProgress;
    if (Math.abs(diff) < 0.002) {
      displayedProgress = targetProgress;
      applyScrollProgressUI(displayedProgress);
      return;
    }
    displayedProgress += diff * 0.22;
    applyScrollProgressUI(displayedProgress);
    scrollRaf = window.requestAnimationFrame(tickScrollProgress);
  }

  function syncScrollProgress(immediate = false) {
    const scroller = elements.act4LetterScroll;
    if (!scroller) return;

    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const isScrollable = maxScroll > 2;
    const topFade = isScrollable && scroller.scrollTop > 4 ? '28px' : '0px';
    const bottomFade = isScrollable && scroller.scrollTop < maxScroll - 4 ? '36px' : '0px';
    scroller.style.setProperty('--fade-top', topFade);
    scroller.style.setProperty('--fade-bottom', bottomFade);

    targetProgress = isScrollable ? Math.min(1, Math.max(0, scroller.scrollTop / maxScroll)) : 1;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (immediate || reduceMotion) {
      if (scrollRaf) {
        window.cancelAnimationFrame(scrollRaf);
        scrollRaf = 0;
      }
      displayedProgress = targetProgress;
      applyScrollProgressUI(displayedProgress);
      return;
    }

    if (!scrollRaf) {
      scrollRaf = window.requestAnimationFrame(tickScrollProgress);
    }
  }

  function setActiveMusicSlide(index) {
    const count = musicCardEls.length;
    if (!count) return;
    activeMusicIndex = ((index % count) + count) % count;

    musicCardEls.forEach((card, i) => {
      let state = 'hidden';
      if (i === activeMusicIndex) {
        state = 'active';
      } else if (count === 2) {
        state = i < activeMusicIndex ? 'prev' : 'next';
      } else {
        const diff = ((i - activeMusicIndex) % count + count) % count;
        if (diff === 1) state = 'next';
        else if (diff === count - 1) state = 'prev';
      }
      card.dataset.state = state;
      card.setAttribute('aria-hidden', state === 'active' ? 'false' : 'true');
    });

    musicDotEls.forEach((dot, i) => {
      const active = i === activeMusicIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  async function renderMusicTracks() {
    const grid = elements.musicQrGrid;
    if (!grid) return;

    const tracks = Array.isArray(copy.musicTracks) ? copy.musicTracks : [];
    grid.innerHTML = '';
    if (elements.musicDots) elements.musicDots.innerHTML = '';
    musicCardEls = [];
    musicDotEls = [];

    let qrLib = null;
    const needsGeneratedQr = tracks.some((t) => !t.qrImage && t.spotifyUrl);
    if (needsGeneratedQr) {
      try {
        const mod = await import('https://esm.sh/qrcode@1.5.4');
        qrLib = mod.default || mod;
      } catch {
        qrLib = null;
      }
    }

    for (const [idx, track] of tracks.entries()) {
      const card = document.createElement(track.spotifyUrl ? 'a' : 'div');
      card.className = 'music-qr-card';
      if (track.spotifyUrl) {
        card.href = track.spotifyUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.setAttribute('aria-label', `${track.title} no Spotify`);
      }

      card.addEventListener('click', (event) => {
        if (idx !== activeMusicIndex) {
          event.preventDefault();
          setActiveMusicSlide(idx);
        }
      });

      const title = document.createElement('h3');
      title.className = 'font-serif-poetic music-qr-title';
      title.textContent = track.title;

      const frame = document.createElement('div');
      frame.className = 'music-qr-frame';

      if (track.qrImage) {
        const img = document.createElement('img');
        img.src = track.qrImage;
        img.alt = `QR Code Spotify — ${track.title}`;
        img.loading = 'lazy';
        img.draggable = false;
        frame.appendChild(img);
      } else if (qrLib && track.spotifyUrl) {
        try {
          const svgStr = await qrLib.toString(track.spotifyUrl, {
            type: 'svg',
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#0b0e10', light: '#f8fafc' }
          });
          const svgDoc = new DOMParser().parseFromString(svgStr, 'image/svg+xml');
          const svgEl = svgDoc.querySelector('svg');
          if (svgEl) {
            svgEl.setAttribute('aria-hidden', 'true');
            frame.appendChild(document.importNode(svgEl, true));
          }
        } catch {
          const fallback = document.createElement('span');
          fallback.className = 'music-qr-fallback';
          fallback.textContent = 'Spotify';
          frame.appendChild(fallback);
        }
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'music-qr-fallback';
        fallback.textContent = 'Spotify';
        frame.appendChild(fallback);
      }

      card.append(title, frame);
      grid.appendChild(card);
      musicCardEls.push(card);

      if (elements.musicDots) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'music-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', track.title);
        dot.addEventListener('click', () => setActiveMusicSlide(idx));
        elements.musicDots.appendChild(dot);
        musicDotEls.push(dot);
      }
    }

    setActiveMusicSlide(0);
  }

  function selectRestaurant(letter, { persist = true } = {}) {
    const lockedLetter = storage.getChoice(restaurants) || letter;
    const data = restaurants[lockedLetter];
    if (!data) return;

    if (persist) {
      storage.setChoice(lockedLetter, restaurants);
    }

    elements.mysterySection.classList.add('hidden');
    elements.inviteRevealSection.classList.remove('hidden');

    elements.chosenBadge.textContent = `${copy.chosenPrefix} ${data.letter}`;
    elements.restaurantName.textContent = data.name;
    if (elements.inviteNote) elements.inviteNote.textContent = copy.inviteNote;
    elements.inviteDatetime.textContent = copy.inviteDateChoice;
    elements.restaurantAddress.textContent = data.address;
  }

  function openMysteryStep() {
    elements.act4LetterStep?.classList.add('hidden');
    elements.act4MusicStep?.classList.add('hidden');
    if (elements.act4Card) {
      elements.act4Card.classList.remove('is-music-step');
      elements.act4Card.classList.add('is-invite-step');
    }
    elements.act4InviteStep?.classList.remove('hidden');

    const savedChoice = storage.getChoice(restaurants);
    if (savedChoice) {
      selectRestaurant(savedChoice, { persist: false });
      return;
    }

    elements.mysterySection?.classList.remove('hidden');
    elements.inviteRevealSection?.classList.add('hidden');
  }

  function openMusicStep() {
    elements.act4LetterStep?.classList.add('hidden');
    elements.act4InviteStep?.classList.add('hidden');
    if (elements.act4Card) {
      elements.act4Card.classList.remove('is-invite-step');
      elements.act4Card.classList.add('is-music-step');
    }
    setActiveMusicSlide(0);
    elements.act4MusicStep?.classList.remove('hidden');
  }

  function backToLetterStep() {
    elements.act4InviteStep?.classList.add('hidden');
    elements.act4MusicStep?.classList.add('hidden');
    elements.act4Card?.classList.remove('is-invite-step', 'is-music-step');
    elements.act4LetterStep?.classList.remove('hidden');
    window.requestAnimationFrame(() => syncScrollProgress(true));
  }

  function open() {
    elements.phaseHud.classList.add('is-hidden');
    elements.rebuildSidebar?.classList.add('hidden');
    elements.narrativeFooter.classList.add('is-hidden');
    elements.narrativeFooter.classList.remove('is-interactive');
    elements.topBar.classList.add('is-hidden');

    elements.act4Card?.classList.remove('is-invite-step', 'is-music-step');
    elements.act4LetterStep?.classList.remove('hidden');
    elements.act4MusicStep?.classList.add('hidden');
    elements.act4InviteStep?.classList.add('hidden');
    elements.mysterySection?.classList.remove('hidden');
    elements.inviteRevealSection?.classList.add('hidden');
    if (elements.act4LetterScroll) elements.act4LetterScroll.scrollTop = 0;

    elements.act4Overlay.classList.remove('hidden');
    elements.act4Overlay.classList.add('is-open');

    window.requestAnimationFrame(() => {
      elements.act4Card.classList.add('is-visible');
      syncScrollProgress(true);
    });
  }

  function init() {
    renderLetter();
    renderMusicTracks();
    if (elements.openMysteryBtn) {
      elements.openMysteryBtn.setAttribute('aria-label', quoteBtnLabel);
      elements.openMysteryBtn.setAttribute('title', quoteBtnLabel);
      elements.openMysteryBtn.addEventListener('click', openMysteryStep);
    }
    elements.mysteryDesc.textContent = copy.mysteryDesc;
    if (elements.inviteNote) elements.inviteNote.textContent = copy.inviteNote;
    elements.inviteDatetime.textContent = copy.inviteDateChoice;

    elements.act4LetterScroll?.addEventListener('scroll', () => syncScrollProgress(false), { passive: true });
    window.addEventListener('resize', () => {
      if (elements.act4Overlay && !elements.act4Overlay.classList.contains('hidden')) {
        syncScrollProgress(true);
      }
    });

    elements.openMusicBtn?.addEventListener('click', openMusicStep);
    elements.backToLetterBtn?.addEventListener('click', backToLetterStep);
    elements.backFromMusicBtn?.addEventListener('click', backToLetterStep);
    elements.musicPrevBtn?.addEventListener('click', () => setActiveMusicSlide(activeMusicIndex - 1));
    elements.musicNextBtn?.addEventListener('click', () => setActiveMusicSlide(activeMusicIndex + 1));

    if (elements.musicQrGrid) {
      let swipeStartX = null;
      elements.musicQrGrid.addEventListener('pointerdown', (event) => {
        swipeStartX = event.clientX;
      });
      elements.musicQrGrid.addEventListener('pointerup', (event) => {
        if (swipeStartX === null) return;
        const dx = event.clientX - swipeStartX;
        swipeStartX = null;
        if (Math.abs(dx) >= 36) {
          setActiveMusicSlide(activeMusicIndex + (dx < 0 ? 1 : -1));
        }
      });
      elements.musicQrGrid.addEventListener('pointercancel', () => {
        swipeStartX = null;
      });
    }

    window.addEventListener('keydown', (event) => {
      if (!elements.act4MusicStep || elements.act4MusicStep.classList.contains('hidden')) return;
      if (event.key === 'ArrowLeft') setActiveMusicSlide(activeMusicIndex - 1);
      if (event.key === 'ArrowRight') setActiveMusicSlide(activeMusicIndex + 1);
    });

    elements.choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        selectRestaurant(btn.dataset.restaurantChoice);
      });
    });
  }

  return { init, open };
}
