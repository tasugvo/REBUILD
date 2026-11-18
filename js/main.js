import {
  ACT4_COPY,
  APP_CONFIG,
  DEVICE_NOTICE_COPY,
  GATE_COPY,
  NOTICE_COPY,
  PALETTE,
  PHASES_COPY,
  REBUILD_PIECES,
  RESTAURANTS
} from './config/content.js';
import { Scene3DController } from './scene/controller.js';
import { SoundEngine } from './services/sound.js';
import {
  clearLegacyRestaurantChoices,
  getPersistedRestaurantChoice,
  persistRestaurantChoice
} from './services/storage.js';
import { createAct4Controller } from './ui/act4.js';
import { getElements } from './ui/dom.js';
import { initDeviceGuard, initGate, initNotice } from './ui/gate.js';
import { createRebuildSidebar } from './ui/rebuildSidebar.js';

const elements = getElements();
const sound = new SoundEngine();

function applyDocumentMeta() {
  clearLegacyRestaurantChoices();
  document.title = APP_CONFIG.title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', APP_CONFIG.description);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', PALETTE.baseBg);

  if (elements.favicon && APP_CONFIG.assets.favicon) {
    elements.favicon.setAttribute('href', APP_CONFIG.assets.favicon);
  }

  elements.triggerStormBtn.setAttribute('aria-label', PHASES_COPY.observe.actionBtn);
  elements.triggerStormBtn.setAttribute('title', PHASES_COPY.observe.actionBtn);
}

function setPhaseUI(phaseKey) {
  elements.topBar.classList.remove('is-hidden');
  elements.phaseHud.classList.toggle('is-hidden', phaseKey === 'storm');
  elements.hudObserve.classList.toggle('hidden', phaseKey !== 'observe');
  elements.hudRebuild.classList.toggle('hidden', phaseKey !== 'rebuild');
  elements.rebuildSidebar?.classList.toggle('hidden', phaseKey !== 'rebuild');
}

const scene3d = new Scene3DController({
  canvas: elements.canvas,
  sound,
  callbacks: {
    onStormComplete: () => {
      scene3d.enterRecovery();
      elements.rebuildPromptOverlay.classList.remove('hidden');
    }
  }
});

const act4 = createAct4Controller({
  elements,
  copy: ACT4_COPY,
  restaurants: RESTAURANTS,
  quoteBtnLabel: PHASES_COPY.rebuild.quoteBtn,
  storage: {
    getChoice: getPersistedRestaurantChoice,
    setChoice: persistRestaurantChoice
  }
});

const rebuildSidebar = createRebuildSidebar({
  elements,
  pieces: REBUILD_PIECES,
  copy: PHASES_COPY.rebuild,
  onPlacePiece: (pieceIds) => scene3d.placeBlueprintPieces(pieceIds),
  onComplete: () => {
    elements.phaseHud.classList.add('is-hidden');
    elements.rebuildSidebar?.classList.add('hidden');

    const authorSuffix = PHASES_COPY.rebuild.quoteAuthor ? ` — ${PHASES_COPY.rebuild.quoteAuthor}` : '';
    elements.narrativeQuote.textContent = `"${PHASES_COPY.rebuild.quote}"${authorSuffix}`;
    elements.nextActBtn.setAttribute('aria-label', PHASES_COPY.rebuild.quoteBtn);
    elements.nextActBtn.setAttribute('title', PHASES_COPY.rebuild.quoteBtn);
    elements.nextActBtn.onclick = () => act4.open();

    elements.narrativeFooter.classList.remove('is-hidden');
    elements.narrativeFooter.classList.add('is-interactive');
  }
});

applyDocumentMeta();
initDeviceGuard(elements, DEVICE_NOTICE_COPY);
act4.init();

initGate(elements, {
  passcode: APP_CONFIG.passcode,
  copy: GATE_COPY,
  sound,
  onUnlock: () => elements.noticeOverlay.classList.remove('hidden')
});

initNotice(elements, {
  copy: NOTICE_COPY,
  sound,
  onStart: async () => {
    await scene3d.init();
    setPhaseUI('observe');
  }
});

elements.resetCameraBtn.addEventListener('click', () => {
  scene3d.resetCamera();
});

elements.muteBtn.addEventListener('click', () => {
  const muted = sound.toggleMute();
  elements.iconSoundOn.classList.toggle('hidden', muted);
  elements.iconSoundOff.classList.toggle('hidden', !muted);
});

elements.triggerStormBtn.addEventListener('click', () => {
  scene3d.startStorm();
  setPhaseUI('storm');
});

elements.rebuildYesBtn.addEventListener('click', () => {
  elements.rebuildPromptOverlay.classList.add('hidden');
  scene3d.enterRebuild();
  rebuildSidebar.render();
  setPhaseUI('rebuild');
});

elements.rebuildNoBtn.addEventListener('click', () => {
  scene3d.destroyFatal();
  sound.mute();
  document.documentElement.style.background = '#000000';
  document.body.style.background = '#000000';
  document.body.style.color = '#e5e7eb';
  document.body.style.fontFamily = 'monospace';
  document.body.style.padding = '12px';
  document.body.textContent = '.';
  window.setTimeout(() => {
    throw new Error('PANIC ERROR: Usuário recusou reconstruir a casa — página encerrada.');
  }, 0);
});
