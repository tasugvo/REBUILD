export function createRebuildSidebar({ elements, pieces, copy, onPlacePiece, onComplete }) {
  const placedIds = new Set();

  function updateScrollFade() {
    const scroller = elements.rebuildScrollArea;
    if (!scroller) return;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const topFade = scroller.scrollTop > 4 ? '28px' : '0px';
    const bottomFade = maxScroll > 4 && scroller.scrollTop < maxScroll - 4 ? '34px' : '0px';
    scroller.style.setProperty('--fade-top', topFade);
    scroller.style.setProperty('--fade-bottom', bottomFade);
  }

  function updateProgress() {
    const total = pieces.length;
    const done = placedIds.size;
    if (elements.rebuildProgressBadge) {
      elements.rebuildProgressBadge.textContent = `${done} / ${total}`;
    }
    const unlocked = done >= total;
    if (elements.finishRebuildBtn) {
      elements.finishRebuildBtn.disabled = !unlocked;
      elements.finishRebuildBtn.classList.toggle('is-locked', !unlocked);
      elements.finishRebuildBtn.setAttribute(
        'title',
        unlocked ? copy.finishBtn : copy.lockedFinishBtn
      );
    }
  }

  function createPlusIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'acc-plus');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', 'M12 5v14M5 12h14');
    svg.appendChild(path);
    return svg;
  }

  function render() {
    const list = elements.rebuildAccordionList;
    if (!list) return;
    placedIds.clear();
    list.innerHTML = '';

    pieces.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'acc-item';
      row.dataset.pieceKey = item.id;

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'acc-trigger';
      trigger.setAttribute('aria-expanded', 'false');

      const main = document.createElement('span');
      main.className = 'acc-trigger-main';
      const dot = document.createElement('span');
      dot.className = 'acc-dot';
      const title = document.createElement('span');
      title.className = 'acc-title';
      title.textContent = item.title;
      main.append(dot, title);

      const right = document.createElement('span');
      right.className = 'acc-trigger-right';
      const kind = document.createElement('span');
      kind.className = 'acc-kind';
      kind.textContent = item.kind;
      right.append(kind, createPlusIcon());

      trigger.append(main, right);

      const panel = document.createElement('div');
      panel.className = 'acc-panel';
      const clip = document.createElement('div');
      clip.className = 'acc-panel-clip';
      const inner = document.createElement('div');
      inner.className = 'acc-panel-inner';

      const desc = document.createElement('p');
      desc.className = 'acc-disclaimer';
      desc.textContent = item.disclaimer;
      inner.appendChild(desc);

      if (item.image) {
        const img = document.createElement('img');
        img.className = 'acc-image';
        img.src = item.image;
        img.alt = item.title;
        img.loading = 'lazy';
        img.addEventListener('load', updateScrollFade);
        inner.appendChild(img);
      }

      clip.appendChild(inner);
      panel.appendChild(clip);
      row.append(trigger, panel);
      list.appendChild(row);

      trigger.addEventListener('click', () => {
        const wasOpen = row.classList.contains('is-open');
        list.querySelectorAll('.acc-item.is-open').forEach((other) => {
          if (other !== row) {
            other.classList.remove('is-open');
            other.querySelector('.acc-trigger')?.setAttribute('aria-expanded', 'false');
          }
        });

        const nextOpen = !wasOpen;
        row.classList.toggle('is-open', nextOpen);
        trigger.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');

        if (!placedIds.has(item.id)) {
          placedIds.add(item.id);
          row.classList.add('is-placed');
          onPlacePiece(item.pieceIds);
          updateProgress();
        }

        window.setTimeout(updateScrollFade, 220);
        window.setTimeout(updateScrollFade, 540);
      });
    });

    updateProgress();
    window.requestAnimationFrame(updateScrollFade);
  }

  if (elements.rebuildScrollArea) {
    elements.rebuildScrollArea.addEventListener('scroll', updateScrollFade, { passive: true });
  }
  window.addEventListener('resize', updateScrollFade);

  if (elements.finishRebuildBtn) {
    elements.finishRebuildBtn.setAttribute('aria-label', copy.finishBtn);
    elements.finishRebuildBtn.addEventListener('click', () => {
      if (placedIds.size < pieces.length) return;
      onComplete();
    });
  }

  return { render };
}
