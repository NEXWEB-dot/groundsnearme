/**
 * GroundsNearMe — Cookie & Storage Consent Banner
 * Ensures compliance with PECA 2016, GDPR standards, and transparent storage practices.
 */

'use strict';

(function() {
  const CONSENT_KEY = 'gnm_cookie_consent';

  function initCookieConsent() {
    try {
      if (localStorage.getItem(CONSENT_KEY)) {
        return; // User has already made a choice
      }
    } catch (e) {
      return; // LocalStorage unavailable
    }

    // Check if banner already in DOM
    if (document.getElementById('gnm-cookie-banner')) return;

    // Inject styles
    const style = document.createElement('style');
    style.id = 'gnm-cookie-styles';
    style.textContent = `
      #gnm-cookie-banner {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(120px);
        width: calc(100% - 32px);
        max-width: 680px;
        background: rgba(13, 26, 15, 0.95);
        color: #f7f8f6;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(74, 222, 128, 0.3);
        border-radius: 12px;
        padding: 20px 24px;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        opacity: 0;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      #gnm-cookie-banner.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      .gnm-cookie-text {
        flex: 1;
        color: #d1d5db;
      }
      .gnm-cookie-text strong {
        color: #ffffff;
        font-weight: 700;
      }
      .gnm-cookie-text a {
        color: #4ade80;
        text-decoration: underline;
        font-weight: 600;
      }
      .gnm-cookie-text a:hover {
        color: #86efac;
      }
      .gnm-cookie-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .gnm-cookie-btn {
        padding: 9px 16px;
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
      }
      .gnm-cookie-btn:focus-visible {
        outline: 2px solid #4ade80;
        outline-offset: 2px;
      }
      .gnm-cookie-btn-primary {
        background: #4ade80;
        color: #0d4a2c;
      }
      .gnm-cookie-btn-primary:hover {
        background: #22c55e;
        transform: translateY(-1px);
      }
      .gnm-cookie-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #f3f4f6;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .gnm-cookie-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.16);
      }
      @media(max-width: 640px) {
        #gnm-cookie-banner {
          flex-direction: column;
          align-items: flex-start;
          bottom: 16px;
          padding: 16px 18px;
          gap: 14px;
        }
        .gnm-cookie-actions {
          width: 100%;
        }
        .gnm-cookie-btn {
          flex: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Create banner
    const banner = document.createElement('aside');
    banner.id = 'gnm-cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie and data privacy choices');
    banner.innerHTML = `
      <div class="gnm-cookie-text">
        <strong>Privacy &amp; Fair Play:</strong> We use local device storage to preserve your ground bookings and match filters. No invasive tracking cookies. See our <a href="cookies.html">Cookies Policy</a> and <a href="privacy-policy.html">Privacy Policy</a>.
      </div>
      <div class="gnm-cookie-actions">
        <button type="button" class="gnm-cookie-btn gnm-cookie-btn-secondary" id="gnm-cookie-decline">Essential Only</button>
        <button type="button" class="gnm-cookie-btn gnm-cookie-btn-primary" id="gnm-cookie-accept">Accept All</button>
      </div>
    `;

    document.body.appendChild(banner);

    // Trigger animation after append
    setTimeout(() => {
      banner.classList.add('show');
    }, 100);

    function handleChoice(val) {
      try {
        localStorage.setItem(CONSENT_KEY, val);
      } catch (e) {}
      banner.classList.remove('show');
      setTimeout(() => {
        banner.remove();
      }, 400);
    }

    document.getElementById('gnm-cookie-accept').addEventListener('click', () => handleChoice('accepted'));
    document.getElementById('gnm-cookie-decline').addEventListener('click', () => handleChoice('essential_only'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
