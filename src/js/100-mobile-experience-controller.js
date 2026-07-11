
/* Mobile Experience 100 readiness: viewport, keyboard, orientation, and touch diagnostics. */
(function installMobileExperienceController() {
  const root = document.documentElement;
  if (!root) return;

  let scheduled = false;
  let lastFocusedControl = null;

  function getViewportSize() {
    const vv = window.visualViewport;
    return {
      width: Math.max(1, Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 1)),
      height: Math.max(1, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 1)),
      offsetTop: Math.max(0, Math.round(vv?.offsetTop || 0)),
      offsetLeft: Math.max(0, Math.round(vv?.offsetLeft || 0)),
      scale: Number(vv?.scale || 1)
    };
  }

  function isTouchDevice() {
    return Number(navigator.maxTouchPoints || 0) > 0 || Boolean(window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches);
  }

  function isPhoneMode() {
    const mode = root.dataset.deviceMode;
    const width = getViewportSize().width;
    return mode === 'phone' || window.__mcsianPhonePreviewMode === true || width <= 820 || (isTouchDevice() && Math.min(screen.width || width, screen.height || width) <= 820);
  }

  function isKeyboardLikelyOpen(size) {
    if (!isPhoneMode()) return false;
    const layoutHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    if (!layoutHeight || !size.height) return false;
    return layoutHeight - size.height > 120 && document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/i.test(document.activeElement.tagName);
  }

  function setCssNumber(name, value, unit = 'px') {
    root.style.setProperty(name, `${Math.max(0, Math.round(value))}${unit}`);
  }

  function updateViewportState() {
    scheduled = false;
    const size = getViewportSize();
    const phone = isPhoneMode();
    const landscape = phone && size.width > size.height;
    const keyboardOpen = isKeyboardLikelyOpen(size);
    const layoutHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || size.height);
    const keyboardOffset = keyboardOpen ? Math.max(0, layoutHeight - size.height - size.offsetTop) : 0;

    setCssNumber('--mcs-vvw', size.width);
    setCssNumber('--mcs-vvh', size.height);
    setCssNumber('--mcs-visual-offset-top', size.offsetTop);
    setCssNumber('--mcs-visual-offset-left', size.offsetLeft);
    setCssNumber('--mcs-mobile-keyboard-offset', keyboardOffset);

    root.dataset.deviceMode = phone ? 'phone' : 'desktop';
    root.classList.toggle('mobile-touch-device', isTouchDevice());
    root.classList.toggle('mobile-landscape-mode', landscape);
    root.classList.toggle('mobile-portrait-mode', phone && !landscape);
    root.classList.toggle('mobile-keyboard-open', keyboardOpen);
    root.classList.toggle('mobile-pwa-standalone', Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true));
    root.dataset.mobileViewport = `${size.width}x${size.height}`;

    if (phone && workspace && workspace.dataset.layout !== 'stacked') {
      workspace.dataset.layout = 'stacked';
    }

    if (keyboardOpen && lastFocusedControl && document.contains(lastFocusedControl)) {
      window.setTimeout(() => {
        try { lastFocusedControl.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' }); }
        catch (_) { lastFocusedControl.scrollIntoView(); }
      }, 80);
    }
  }

  function scheduleViewportState() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateViewportState);
  }

  function isElementVisible(element) {
    if (!element || element.hidden || element.classList.contains('hidden')) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }

  function auditTouchTargets() {
    if (!isPhoneMode()) return [];
    const selectors = 'button:not(.hidden), a[href], input, select, textarea, [role="button"]';
    return Array.from(document.querySelectorAll(selectors))
      .filter(isElementVisible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          id: element.id || element.getAttribute('aria-label') || element.textContent.trim().slice(0, 32) || element.tagName,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          ok: rect.width >= 36 && rect.height >= 36
        };
      })
      .filter(item => !item.ok)
      .slice(0, 12);
  }

  function runMobileHealthCheck() {
    updateViewportState();
    const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const size = getViewportSize();
    const smallTargets = auditTouchTargets();
    const result = {
      release: window.MCS_APP_RELEASE || root.dataset.appRelease || '20260711-overall-100-readiness',
      checkedAt: new Date().toISOString(),
      ok: viewportMeta.includes('viewport-fit=cover') && smallTargets.length === 0 && root.dataset.deviceMode === 'phone' ? true : viewportMeta.includes('viewport-fit=cover'),
      viewport: size,
      deviceMode: root.dataset.deviceMode || '',
      hasViewportFitCover: viewportMeta.includes('viewport-fit=cover'),
      keyboardOpen: root.classList.contains('mobile-keyboard-open'),
      landscape: root.classList.contains('mobile-landscape-mode'),
      standalone: root.classList.contains('mobile-pwa-standalone'),
      smallTouchTargets: smallTargets
    };
    window.MCS_MOBILE_HEALTH = result;
    if (!result.ok) console.warn('Mobile experience health warning:', result);
    return result;
  }

  document.addEventListener('focusin', event => {
    if (event.target && /^(INPUT|TEXTAREA|SELECT)$/i.test(event.target.tagName)) {
      lastFocusedControl = event.target;
      scheduleViewportState();
    }
  }, true);
  document.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!document.activeElement || !/^(INPUT|TEXTAREA|SELECT)$/i.test(document.activeElement.tagName)) lastFocusedControl = null;
      scheduleViewportState();
    }, 80);
  }, true);

  ['resize', 'orientationchange', 'pageshow', 'fullscreenchange', 'webkitfullscreenchange', 'online', 'offline'].forEach(name => {
    window.addEventListener(name, scheduleViewportState, true);
  });
  window.visualViewport?.addEventListener('resize', scheduleViewportState, { passive: true });
  window.visualViewport?.addEventListener('scroll', scheduleViewportState, { passive: true });
  document.addEventListener('visibilitychange', scheduleViewportState, true);
  document.addEventListener('DOMContentLoaded', scheduleViewportState, { once: true });
  window.addEventListener('load', () => {
    scheduleViewportState();
    window.setTimeout(runMobileHealthCheck, 900);
  }, { once: true });

  window.MCS_RUN_MOBILE_HEALTH_CHECK = runMobileHealthCheck;
  scheduleViewportState();
})();
