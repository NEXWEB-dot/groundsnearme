/**
 * GroundsNearMe — Cookie & Storage Consent Banner
 * Ensures compliance with PECA 2016 and transparent storage practices.
 *
 * Robust implementation:
 *  - Matches the exact design: "DECLINE" & "ACCEPT & CONTINUE"
 *  - Dual persistence: localStorage + 1-year fallback cookie (survives webviews & quota limits)
 *  - Strict prevention: If user previously accepted/declined, banner is NEVER shown on refresh
 *  - Direct removal from DOM after smooth slide-down animation
 *  - Both .onclick and addEventListener wired for bulletproof interaction
 */

'use strict';

(function () {
  var CONSENT_KEY = 'gnm_cookie_consent';

  function getCookie(name) {
    try {
      var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    } catch (e) {
      return null;
    }
  }

  function hasConsent() {
    try {
      var ls = localStorage.getItem(CONSENT_KEY);
      if (ls) return true;
    } catch (e) {}
    try {
      var c = getCookie(CONSENT_KEY);
      if (c) return true;
    } catch (e) {}
    return false;
  }

  function saveConsent(val) {
    try {
      localStorage.setItem(CONSENT_KEY, val);
    } catch (e) {}
    try {
      // 1 year persistence fallback cookie
      document.cookie = CONSENT_KEY + '=' + encodeURIComponent(val) + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) {}
  }

  function hideAndRemove(banner) {
    if (!banner) return;
    banner.classList.add('hidden');
    banner.classList.remove('visible');
    banner.style.transform = 'translateY(110%)';
    banner.style.opacity = '0';
    banner.style.pointerEvents = 'none';

    setTimeout(function () {
      if (banner && banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
      var styles = document.getElementById('cookie-banner-styles');
      if (styles && styles.parentNode) {
        styles.parentNode.removeChild(styles);
      }
    }, 450);
  }

  function injectStyles() {
    if (document.getElementById('cookie-banner-styles')) return;
    var style = document.createElement('style');
    style.id = 'cookie-banner-styles';
    style.textContent =
      '#cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:#0d1a0f;color:#ffffff;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;box-shadow:0 -4px 24px rgba(0,0,0,0.35);transform:translateY(110%);transition:transform 0.4s cubic-bezier(0.22,1,0.36,1),opacity 0.3s ease;font-family:"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,sans-serif;font-size:0.875rem;line-height:1.6;box-sizing:border-box;}' +
      '#cookie-banner.visible{transform:translateY(0);}' +
      '#cookie-banner.hidden{transform:translateY(110%) !important;opacity:0 !important;pointer-events:none !important;}' +
      '#cookie-banner *{box-sizing:border-box;}' +
      '.cookie-text{font-size:0.875rem;color:rgba(255,255,255,0.88);line-height:1.6;flex:1;min-width:240px;margin:0;}' +
      '.cookie-text a{color:#4ade80;text-decoration:none;text-underline-offset:2px;font-weight:600;}' +
      '.cookie-text a:hover{text-decoration:underline;color:#86efac;}' +
      '.cookie-actions{display:flex;gap:12px;flex-shrink:0;flex-wrap:wrap;align-items:center;}' +
      '.cookie-btn-accept{background:#4ade80;color:#0d4a2c;border:none;font-family:inherit;font-weight:800;font-size:0.8125rem;letter-spacing:0.04em;text-transform:uppercase;padding:11px 22px;cursor:pointer;border-radius:3px;transition:all 0.2s ease;min-height:42px;display:inline-flex;align-items:center;justify-content:center;}' +
      '.cookie-btn-accept:hover{background:#22c55e;transform:translateY(-1px);box-shadow:0 4px 12px rgba(74,222,128,0.35);}' +
      '.cookie-btn-accept:focus-visible{outline:2px solid #4ade80;outline-offset:2px;}' +
      '.cookie-btn-decline{background:transparent;color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.3);font-family:inherit;font-weight:600;font-size:0.8125rem;letter-spacing:0.04em;text-transform:uppercase;padding:11px 22px;cursor:pointer;border-radius:3px;transition:all 0.2s ease;min-height:42px;display:inline-flex;align-items:center;justify-content:center;}' +
      '.cookie-btn-decline:hover{color:#ffffff;border-color:rgba(255,255,255,0.7);background:rgba(255,255,255,0.1);}' +
      '.cookie-btn-decline:focus-visible{outline:2px solid rgba(255,255,255,0.6);outline-offset:2px;}' +
      '@media(max-width:640px){#cookie-banner{padding:16px 20px;gap:14px;}.cookie-actions{width:100%;}.cookie-btn-accept,.cookie-btn-decline{flex:1;text-align:center;}}';
    document.head.appendChild(style);
  }

  function initCookieConsent() {
    // 1. If user already consented, immediately remove any stray banner and exit
    var existing = document.getElementById('cookie-banner');
    if (hasConsent()) {
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return;
    }

    // 2. Ensure body is ready
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', initCookieConsent);
      return;
    }

    injectStyles();

    var banner = existing;
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookie and storage notice');
      banner.setAttribute('aria-describedby', 'cookie-desc');
      banner.innerHTML =
        '<p class="cookie-text" id="cookie-desc">' +
          'We use browser storage (localStorage) to save your session and bookings on this device. We don\'t use advertising cookies or tracking pixels. ' +
          '<a href="cookies.html">Learn more in our Cookies Policy</a>.' +
        '</p>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="cookie-btn-decline" id="cookie-decline" aria-label="Decline non-essential storage">Decline</button>' +
          '<button type="button" class="cookie-btn-accept" id="cookie-accept" aria-label="Accept and continue to site">Accept &amp; Continue</button>' +
        '</div>';
      document.body.appendChild(banner);
    }

    var btnAccept = document.getElementById('cookie-accept');
    var btnDecline = document.getElementById('cookie-decline');

    function onAccept(e) {
      if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      }
      saveConsent('accepted');
      hideAndRemove(banner);
    }

    function onDecline(e) {
      if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      }
      saveConsent('declined');
      hideAndRemove(banner);
    }

    if (btnAccept) {
      btnAccept.onclick = onAccept;
      btnAccept.addEventListener('click', onAccept);
    }

    if (btnDecline) {
      btnDecline.onclick = onDecline;
      btnDecline.addEventListener('click', onDecline);
    }

    // Trigger slide-up animation
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (banner && banner.parentNode) {
          banner.classList.add('visible');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
