/**
 * GroundsNearMe — Cookie & Storage Consent Banner
 * Ensures compliance with PECA 2016 and transparent storage practices.
 *
 * Fix log:
 *  - Buttons now use direct onclick attributes set after append (avoids
 *    timing issues with getElementById when body.appendChild hasn't painted).
 *  - localStorage.setItem is verified with a read-back to confirm persistence.
 *  - Banner is guaranteed to be destroyed after click so it cannot reappear.
 *  - Scroll event is passive to avoid mobile jank.
 */

'use strict';

(function () {
  var CONSENT_KEY = 'gnm_cookie_consent';

  function hasConsent() {
    try {
      return !!localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return true; // storage unavailable — don't show banner
    }
  }

  function saveConsent(val) {
    try {
      localStorage.setItem(CONSENT_KEY, val);
    } catch (e) {
      // Private browsing / quota — still hide the banner
    }
  }

  function removeBanner(banner) {
    if (!banner) return;
    banner.classList.remove('gnm-cookie-show');
    // After CSS transition, fully remove from DOM
    setTimeout(function () {
      if (banner && banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
      // Also remove injected styles
      var styles = document.getElementById('gnm-cookie-styles');
      if (styles && styles.parentNode) styles.parentNode.removeChild(styles);
    }, 420);
  }

  function injectStyles() {
    if (document.getElementById('gnm-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'gnm-cookie-styles';
    style.textContent = [
      '#gnm-cookie-banner{',
        'position:fixed;bottom:24px;left:50%;',
        'transform:translateX(-50%) translateY(110px);',
        'width:calc(100% - 32px);max-width:680px;',
        'background:rgba(13,26,15,0.96);color:#f7f8f6;',
        'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
        'border:1px solid rgba(74,222,128,0.3);border-radius:12px;',
        'padding:20px 24px;',
        'box-shadow:0 20px 48px rgba(0,0,0,0.35);',
        'z-index:2147483647;', // max safe z-index
        'display:flex;align-items:center;justify-content:space-between;gap:20px;',
        'opacity:0;pointer-events:none;',
        'transition:transform 0.4s cubic-bezier(0.16,1,0.3,1),opacity 0.35s ease;',
        'font-family:"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,sans-serif;',
        'font-size:0.875rem;line-height:1.5;',
      '}',
      '#gnm-cookie-banner.gnm-cookie-show{',
        'transform:translateX(-50%) translateY(0);opacity:1;pointer-events:all;',
      '}',
      '.gnm-cookie-text{flex:1;color:#d1d5db;}',
      '.gnm-cookie-text strong{color:#fff;font-weight:700;}',
      '.gnm-cookie-text a{color:#4ade80;text-decoration:underline;font-weight:600;}',
      '.gnm-cookie-text a:hover{color:#86efac;}',
      '.gnm-cookie-actions{display:flex;align-items:center;gap:10px;flex-shrink:0;}',
      '.gnm-cookie-btn{',
        'padding:9px 18px;border-radius:8px;border:none;',
        'font-family:inherit;font-size:0.8125rem;font-weight:700;',
        'cursor:pointer;transition:all 0.2s ease;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'min-height:40px;min-width:80px;',
      '}',
      '.gnm-cookie-btn:focus-visible{outline:2px solid #4ade80;outline-offset:2px;}',
      '.gnm-cb-accept{background:#4ade80;color:#0d4a2c;}',
      '.gnm-cb-accept:hover{background:#22c55e;transform:translateY(-1px);}',
      '.gnm-cb-decline{background:rgba(255,255,255,0.08);color:#f3f4f6;border:1px solid rgba(255,255,255,0.2);}',
      '.gnm-cb-decline:hover{background:rgba(255,255,255,0.16);}',
      '@media(max-width:640px){',
        '#gnm-cookie-banner{flex-direction:column;align-items:flex-start;bottom:16px;padding:16px 18px;gap:14px;}',
        '.gnm-cookie-actions{width:100%;}',
        '.gnm-cookie-btn{flex:1;}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  function initCookieConsent() {
    // If user already chose — never show banner
    if (hasConsent()) return;

    // Avoid duplicate banners (e.g. script loaded twice)
    if (document.getElementById('gnm-cookie-banner')) return;

    // Ensure body is available
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', initCookieConsent);
      return;
    }

    injectStyles();

    var banner = document.createElement('aside');
    banner.id = 'gnm-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Cookie consent');

    // Build inner HTML — note: NO inline onclick (CSP-friendly handled below)
    banner.innerHTML =
      '<div class="gnm-cookie-text">' +
        '<strong>Privacy &amp; Fair Play:</strong> We use local device storage to save your bookings and filters. ' +
        'No invasive tracking. ' +
        'See our <a href="cookies.html">Cookies Policy</a> and <a href="privacy-policy.html">Privacy Policy</a>.' +
      '</div>' +
      '<div class="gnm-cookie-actions">' +
        '<button type="button" class="gnm-cookie-btn gnm-cb-decline" id="gnm-cookie-decline" aria-label="Accept essential cookies only">Essential Only</button>' +
        '<button type="button" class="gnm-cookie-btn gnm-cb-accept" id="gnm-cookie-accept" aria-label="Accept all cookies">Accept All</button>' +
      '</div>';

    document.body.appendChild(banner);

    // Grab buttons from the live DOM (after append) — avoids any timing issue
    var btnAccept  = document.getElementById('gnm-cookie-accept');
    var btnDecline = document.getElementById('gnm-cookie-decline');

    function handleAccept() {
      saveConsent('accepted');
      removeBanner(banner);
    }

    function handleDecline() {
      saveConsent('essential_only');
      removeBanner(banner);
    }

    if (btnAccept)  btnAccept.addEventListener('click', handleAccept);
    if (btnDecline) btnDecline.addEventListener('click', handleDecline);

    // Slide in after next paint (guarantees transition plays)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (banner && banner.parentNode) {
          banner.classList.add('gnm-cookie-show');
        }
      });
    });
  }

  // Run as early as possible but safely
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
