import {
  ACT4_COPY,
  APP_CONFIG,
  DEVICE_NOTICE_COPY,
  GATE_COPY,
  INVITE_EVENT,
  NOTICE_COPY,
  PALETTE,
  RESTAURANTS
} from './content.js';
import { SoundEngine } from './sound.js';
import { ExperienceController } from './experience.js';

const sound = new SoundEngine();

const elements = {
  favicon: document.getElementById('app-favicon'),
  skyBg: document.getElementById('sky-bg'),
  canvas: document.getElementById('physics-canvas'),
  topBar: document.getElementById('top-bar'),
  actBadge: document.getElementById('act-badge'),
  actTitleSmall: document.getElementById('act-title-small'),
  muteBtn: document.getElementById('mute-btn'),
  iconSoundOn: document.getElementById('icon-sound-on'),
  iconSoundOff: document.getElementById('icon-sound-off'),
  instructionPill: document.getElementById('instruction-pill'),
  instructionText: document.getElementById('instruction-text'),
  memoryLayer: document.getElementById('memory-layer'),
  narrativeFooter: document.getElementById('narrative-footer'),
  narrativeQuote: document.getElementById('narrative-quote'),
  nextActBtn: document.getElementById('next-act-btn'),

  gateOverlay: document.getElementById('gate-overlay'),
  gatePlayStage: document.getElementById('gate-play-stage'),
  gatePlayBtn: document.getElementById('gate-play-btn'),
  gatePasswordStage: document.getElementById('gate-password-stage'),
  gatePasswordInput: document.getElementById('gate-password-input'),
  gateSubmitBtn: document.getElementById('gate-submit-btn'),
  gateError: document.getElementById('gate-error'),

  noticeOverlay: document.getElementById('notice-overlay'),
  noticeKicker: document.getElementById('notice-kicker'),
  noticeTitle: document.getElementById('notice-title'),
  noticeBody: document.getElementById('notice-body'),
  noticeTips: document.getElementById('notice-tips'),
  startBtn: document.getElementById('start-btn'),

  deviceOverlay: document.getElementById('device-overlay'),
  deviceKicker: document.getElementById('device-kicker'),
  deviceTitle: document.getElementById('device-title'),
  deviceBody: document.getElementById('device-body'),

  act4Overlay: document.getElementById('act4-overlay'),
  act4Card: document.getElementById('act4-card'),
  act4Badge: document.getElementById('act4-badge'),
  act4Title: document.getElementById('act4-title'),
  act4Letter: document.getElementById('act4-letter'),
  mysterySection: document.getElementById('mystery-section'),
  mysteryKicker: document.getElementById('mystery-kicker'),
  mysteryDesc: document.getElementById('mystery-desc'),
  choiceLabelA: document.getElementById('choice-label-a'),
  choiceLabelM: document.getElementById('choice-label-m'),
  inviteRevealSection: document.getElementById('invite-reveal-section'),
  chosenBadge: document.getElementById('chosen-badge'),
  restaurantName: document.getElementById('restaurant-name'),
  inviteDatetime: document.getElementById('invite-datetime'),
  restaurantAddress: document.getElementById('restaurant-address'),
  switchOptionBtn: document.getElementById('switch-option-btn'),
  gcalLink: document.getElementById('gcal-link'),
  gcalBtnLabel: document.getElementById('gcal-btn-label'),
  downloadIcsBtn: document.getElementById('download-ics-btn'),
  icsBtnLabel: document.getElementById('ics-btn-label'),
  choiceButtons: document.querySelectorAll('[data-restaurant-choice]')
};

let currentChosenLetter = null;

function hydrateContent() {
  document.title = APP_CONFIG.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${APP_CONFIG.title} — ${APP_CONFIG.description}`);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', PALETTE.baseBg);
  if (elements.favicon && APP_CONFIG.assets.favicon) {
    elements.favicon.setAttribute('href', APP_CONFIG.assets.favicon);
  }

  elements.gatePlayBtn.setAttribute('aria-label', GATE_COPY.playAriaLabel);
  elements.gatePasswordInput.setAttribute('placeholder', GATE_COPY.passwordPlaceholder);
  elements.gatePasswordInput.setAttribute('aria-label', GATE_COPY.passwordAriaLabel);
  elements.gateSubmitBtn.setAttribute('aria-label', GATE_COPY.submitAriaLabel);
  elements.gateError.textContent = GATE_COPY.wrongPasswordMessage;

  elements.noticeKicker.textContent = NOTICE_COPY.kicker;
  elements.noticeTitle.textContent = NOTICE_COPY.title;
  elements.noticeBody.textContent = NOTICE_COPY.body;
  elements.noticeTips.innerHTML = NOTICE_COPY.tips.map((tip) => `<li>• ${tip}</li>`).join('');
  elements.startBtn.textContent = NOTICE_COPY.cta;

  elements.deviceKicker.textContent = DEVICE_NOTICE_COPY.kicker;
  elements.deviceTitle.textContent = DEVICE_NOTICE_COPY.title;
  elements.deviceBody.textContent = DEVICE_NOTICE_COPY.body;

  elements.act4Badge.textContent = ACT4_COPY.badge;
  elements.act4Title.textContent = ACT4_COPY.title;
  elements.act4Letter.textContent = ACT4_COPY.letter;
  elements.mysteryKicker.textContent = ACT4_COPY.mysteryKicker;
  elements.mysteryDesc.textContent = ACT4_COPY.mysteryDesc;
  elements.choiceLabelA.textContent = `${ACT4_COPY.optionPrefix} ${RESTAURANTS.A.letter}`;
  elements.choiceLabelM.textContent = `${ACT4_COPY.optionPrefix} ${RESTAURANTS.M.letter}`;
  elements.gcalBtnLabel.textContent = ACT4_COPY.gcalBtn;
  elements.icsBtnLabel.textContent = ACT4_COPY.icsBtn;
  elements.inviteDatetime.innerHTML = `<strong>${INVITE_EVENT.dateLabel}</strong> às <strong>${INVITE_EVENT.timeLabel}</strong>`;
}

const ui = {
  setSky(background) {
    elements.skyBg.style.background = background;
  },

  updateHeader(badge, title, instruction) {
    elements.topBar.classList.remove('is-hidden');
    elements.actBadge.textContent = badge;
    elements.actTitleSmall.textContent = title;
    this.setInstruction(instruction);
  },

  setInstruction(instruction) {
    if (instruction) {
      elements.instructionText.textContent = instruction;
      elements.instructionPill.classList.remove('is-hidden');
    } else {
      this.hideInstruction();
    }
  },

  hideInstruction() {
    elements.instructionPill.classList.add('is-hidden');
  },

  hideNarrativeFooter() {
    elements.narrativeFooter.classList.add('is-hidden');
    elements.narrativeFooter.classList.remove('is-interactive');
  },

  showNarrativeFooter(quoteText, btnText, callback) {
    elements.narrativeQuote.textContent = `"${quoteText}"`;
    elements.nextActBtn.textContent = btnText;
    elements.nextActBtn.onclick = callback;
    elements.narrativeFooter.classList.remove('is-hidden');
    elements.narrativeFooter.classList.add('is-interactive');
  },

  triggerShake() {
    document.body.classList.remove('shake-effect');
    void document.body.offsetWidth;
    document.body.classList.add('shake-effect');
  },

  clearMemories() {
    elements.memoryLayer.innerHTML = '';
  },

  showFloatingMemory(x, y, text, viewportWidth) {
    const el = document.createElement('div');
    el.className = 'memory-toast';
    el.style.left = `${Math.max(80, Math.min(viewportWidth - 80, x))}px`;
    el.style.top = `${Math.max(90, y - 30)}px`;
    el.textContent = `✦ ${text}`;
    elements.memoryLayer.appendChild(el);
    window.setTimeout(() => el.remove(), 2650);
  }
};

function openAct4() {
  ui.hideNarrativeFooter();
  ui.hideInstruction();
  elements.topBar.classList.add('is-hidden');

  elements.act4Overlay.classList.remove('hidden');
  elements.act4Overlay.classList.add('is-open');

  window.requestAnimationFrame(() => {
    elements.act4Card.classList.add('is-visible');
  });
}

function selectRestaurant(letter) {
  const data = RESTAURANTS[letter];
  if (!data) return;

  currentChosenLetter = letter;
  sound.playWarmChime(1.1);

  elements.mysterySection.classList.add('hidden');
  elements.inviteRevealSection.classList.remove('hidden');

  elements.chosenBadge.textContent = `${ACT4_COPY.chosenPrefix} ${data.letter}`;
  elements.restaurantName.textContent = data.name;
  elements.restaurantAddress.textContent = data.address;
  elements.switchOptionBtn.textContent = `${ACT4_COPY.switchPrefix} ${data.otherLetter}`;

  const title = encodeURIComponent(`${INVITE_EVENT.summaryPrefix} — ${data.name}`);
  const details = encodeURIComponent(
    `${INVITE_EVENT.description}\n\nLocal: ${data.name}\nEndereço: ${data.address}`
  );
  const location = encodeURIComponent(`${data.name}, ${data.address}`);

  elements.gcalLink.href =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${title}&dates=${INVITE_EVENT.gcalDates}&details=${details}&location=${location}`;
}

function downloadICS() {
  if (!currentChosenLetter) return;
  const data = RESTAURANTS[currentChosenLetter];
  const escapedDesc = INVITE_EVENT.description.replace(/,/g, '\\,');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${INVITE_EVENT.icsProdid}`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${INVITE_EVENT.dtStart}`,
    `DTEND:${INVITE_EVENT.dtEnd}`,
    `SUMMARY:${INVITE_EVENT.summaryPrefix} — ${data.name}`,
    `LOCATION:${data.name}\\, ${data.address}`,
    `DESCRIPTION:${escapedDesc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `Convite_${data.name.replace(/\s+/g, '_')}_${INVITE_EVENT.fileDateSuffix}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function isUnsupportedDevice() {
  const ua = navigator.userAgent || '';
  const isIPhoneOrIPad =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isBelow720p = window.innerWidth < 960 || window.screen.height < 720;
  return isIPhoneOrIPad || isBelow720p;
}

function updateDeviceGuard() {
  elements.deviceOverlay.classList.toggle('hidden', !isUnsupportedDevice());
}

hydrateContent();
updateDeviceGuard();
window.addEventListener('resize', updateDeviceGuard);

const experience = new ExperienceController({
  canvas: elements.canvas,
  sound,
  ui,
  onCompleteAct3: openAct4
});

elements.gatePlayBtn.addEventListener('click', () => {
  sound.init();
  elements.gatePlayStage.classList.add('hidden');
  elements.gatePasswordStage.classList.remove('hidden');
  elements.gatePasswordInput.focus();
});

elements.gatePasswordInput.addEventListener('input', () => {
  elements.gatePasswordInput.classList.remove('is-error');
  elements.gateError.classList.add('hidden');
});

elements.gatePasswordStage.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = elements.gatePasswordInput.value.trim();

  if (value === APP_CONFIG.passcode) {
    sound.playWarmChime(1.0);
    elements.gateOverlay.classList.add('is-leaving');
    window.setTimeout(() => {
      elements.gateOverlay.classList.add('hidden');
      elements.noticeOverlay.classList.remove('hidden');
    }, 550);
  } else {
    elements.gatePasswordInput.classList.add('is-error');
    elements.gateError.classList.remove('hidden');
    elements.gatePasswordStage.classList.remove('shake-effect');
    void elements.gatePasswordStage.offsetWidth;
    elements.gatePasswordStage.classList.add('shake-effect');
    elements.gatePasswordInput.select();
  }
});

elements.muteBtn.addEventListener('click', () => {
  const muted = sound.toggleMute();
  elements.iconSoundOn.classList.toggle('hidden', muted);
  elements.iconSoundOff.classList.toggle('hidden', !muted);
});

elements.startBtn.addEventListener('click', () => {
  sound.init();
  sound.playWarmChime(1.0);

  elements.noticeOverlay.classList.add('is-leaving');
  window.setTimeout(() => elements.noticeOverlay.classList.add('hidden'), 700);

  experience.startAct1();
});

elements.choiceButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectRestaurant(btn.dataset.restaurantChoice);
  });
});

elements.switchOptionBtn.addEventListener('click', () => {
  if (!currentChosenLetter) return;
  selectRestaurant(currentChosenLetter === 'A' ? 'M' : 'A');
});

elements.downloadIcsBtn.addEventListener('click', downloadICS);

experience.start();
