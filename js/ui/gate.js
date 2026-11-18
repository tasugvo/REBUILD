export function isUnsupportedDevice() {
  const ua = navigator.userAgent || '';
  const isIPhoneOrIPad =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const physicalScreenHeight = window.screen.height * (window.devicePixelRatio || 1);
  const isBelow720p =
    window.innerWidth < 960 || Math.max(window.screen.height, physicalScreenHeight) < 720;
  return isIPhoneOrIPad || isBelow720p;
}

export function initDeviceGuard(elements, copy) {
  elements.deviceKicker.textContent = copy.kicker;
  elements.deviceTitle.textContent = copy.title;
  elements.deviceBody.textContent = copy.body;

  const update = () => {
    elements.deviceOverlay.classList.toggle('hidden', !isUnsupportedDevice());
  };
  update();
  window.addEventListener('resize', update);
}

export function initGate(elements, { passcode, copy, sound, onUnlock }) {
  elements.gatePlayBtn.setAttribute('aria-label', copy.playAriaLabel);
  elements.gatePasswordInput.setAttribute('placeholder', copy.passwordPlaceholder);
  elements.gatePasswordInput.setAttribute('aria-label', copy.passwordAriaLabel);
  elements.gateSubmitBtn.setAttribute('aria-label', copy.submitAriaLabel);
  elements.gateError.textContent = copy.wrongPasswordMessage;

  let unlocked = false;

  elements.gatePlayBtn.addEventListener('click', () => {
    sound.init();
    elements.gatePlayStage.classList.add('hidden');
    elements.gatePasswordStage.classList.remove('hidden');
    elements.gatePasswordInput.focus();
  });

  elements.gatePasswordInput.addEventListener('input', () => {
    elements.gatePasswordInput.classList.remove('is-error');
    elements.gatePasswordInput.setAttribute('aria-invalid', 'false');
    elements.gateError.classList.add('hidden');
  });

  elements.gatePasswordStage.addEventListener('submit', (e) => {
    e.preventDefault();
    if (unlocked) return;

    const value = elements.gatePasswordInput.value.trim();
    if (value === passcode) {
      unlocked = true;
      elements.gateOverlay.classList.add('is-leaving');
      window.setTimeout(() => {
        elements.gateOverlay.classList.add('hidden');
        onUnlock();
      }, 550);
      return;
    }

    elements.gatePasswordInput.classList.add('is-error');
    elements.gatePasswordInput.setAttribute('aria-invalid', 'true');
    elements.gateError.classList.remove('hidden');
    elements.gatePasswordStage.classList.remove('shake-effect');
    void elements.gatePasswordStage.offsetWidth;
    elements.gatePasswordStage.classList.add('shake-effect');
    elements.gatePasswordInput.select();
  });
}

export function initNotice(elements, { copy, sound, onStart }) {
  elements.noticeKicker.textContent = copy.kicker;
  elements.noticeKicker.classList.toggle('hidden', !copy.kicker);
  elements.noticeTitle.textContent = copy.title;
  elements.noticeBody.textContent = copy.body;
  elements.noticeBody.classList.toggle('hidden', !copy.body);

  elements.noticeTips.innerHTML = '';
  copy.tips.forEach((tip) => {
    const li = document.createElement('li');
    li.textContent = `• ${tip}`;
    elements.noticeTips.appendChild(li);
  });

  elements.startBtn.textContent = copy.cta;

  let starting = false;

  elements.startBtn.addEventListener('click', async () => {
    if (starting) return;
    starting = true;
    sound.init();

    if (elements.noticeError) {
      elements.noticeError.classList.add('hidden');
      elements.noticeError.textContent = '';
    }
    elements.startBtn.disabled = true;
    elements.startBtn.textContent = copy.loadingCta;
    elements.canvas.classList.remove('hidden');

    try {
      await onStart();
    } catch (err) {
      console.error('Erro ao inicializar cena 3D:', err);
      starting = false;
      elements.canvas.classList.add('hidden');
      elements.startBtn.disabled = false;
      elements.startBtn.textContent = copy.cta;
      if (elements.noticeError) {
        elements.noticeError.textContent = copy.loadError;
        elements.noticeError.classList.remove('hidden');
      }
      return;
    }

    elements.noticeOverlay.classList.add('is-leaving');
    window.setTimeout(() => elements.noticeOverlay.classList.add('hidden'), 650);
  });
}
