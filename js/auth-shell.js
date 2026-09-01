/**
 * GroundsNearMe — Account Shell & Header Authentication Component
 * Provides double-bezel account dropdown, profile modal, login/logout transitions,
 * and unified nav bar state management across the public website.
 */

'use strict';

const AuthShell = {
  init() {
    this.injectStyles();
    this.renderHeaderAuth();
    this.renderProfileModal();
    this.bindEvents();
  },

  injectStyles() {
    if (document.getElementById('gnm-auth-shell-styles')) return;

    const style = document.createElement('style');
    style.id = 'gnm-auth-shell-styles';
    style.textContent = `
      /* Account CTA & Nav Buttons */
      .nav-auth-group {
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
      }
      .btn-nav-login {
        font-size: 0.8125rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--white);
        text-decoration: none;
        padding: 8px 14px;
        transition: color 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      #nav-wrapper.scrolled .btn-nav-login {
        color: var(--muted);
      }
      #nav-wrapper.scrolled .btn-nav-login:hover {
        color: var(--emerald);
      }
      .btn-nav-register {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--lime);
        color: var(--emerald);
        border: 1px solid rgba(13, 74, 44, 0.15);
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 0.8125rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        text-decoration: none;
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .btn-nav-register:hover {
        background: var(--lime-dark);
        transform: translateY(-1px);
        color: var(--emerald);
      }

      /* Logged In Account Pill Button */
      .account-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 999px;
        padding: 4px 14px 4px 5px;
        color: var(--white);
        font-size: 0.8125rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        user-select: none;
      }
      #nav-wrapper.scrolled .account-pill-btn {
        background: var(--card-bg);
        border-color: var(--border);
        color: var(--ink);
      }
      .account-pill-btn:hover {
        background: rgba(255, 255, 255, 0.22);
        border-color: var(--white);
      }
      #nav-wrapper.scrolled .account-pill-btn:hover {
        background: #e2ede6;
        border-color: var(--emerald);
      }
      .account-avatar-mini {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--emerald);
        color: var(--lime);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .account-name-label {
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Double-Bezel Account Dropdown */
      .account-dropdown-wrap {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        width: 260px;
        z-index: 1500;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        pointer-events: none;
      }
      .account-dropdown-wrap.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        pointer-events: all;
      }
      .account-dropdown-outer {
        background: var(--card-bg);
        border: 1px solid var(--border);
        padding: 5px;
        border-radius: 0;
        box-shadow: 0 16px 40px -8px rgba(13, 26, 15, 0.16);
      }
      .account-dropdown-inner {
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
        padding: 16px 14px;
        border-radius: 0;
      }
      
      .account-user-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 8px;
      }
      .account-avatar-large {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--emerald);
        color: var(--lime);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 800;
        flex-shrink: 0;
      }
      .account-user-meta {
        min-width: 0;
        flex: 1;
      }
      .account-user-fullname {
        font-size: 0.875rem;
        font-weight: 800;
        color: var(--ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .account-user-phone {
        font-size: 0.725rem;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .account-menu-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .account-menu-item a, .account-menu-item button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        background: transparent;
        border: none;
        border-radius: 0;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--ink);
        cursor: pointer;
        text-decoration: none;
        transition: all 0.15s ease;
        text-align: left;
      }
      .account-menu-item a:hover, .account-menu-item button:hover {
        background: var(--card-bg);
        color: var(--emerald);
      }
      .account-menu-item i {
        font-size: 16px;
        color: var(--emerald);
      }
      .account-menu-item.danger a, .account-menu-item.danger button {
        color: #b91c1c;
      }
      .account-menu-item.danger i {
        color: #ef4444;
      }
      .account-menu-item.danger a:hover, .account-menu-item.danger button:hover {
        background: #fee2e2;
      }
      .account-menu-divider {
        height: 1px;
        background: var(--border);
        margin: 6px 0;
      }

      /* Mobile Drawer Account Box */
      .mobile-account-card {
        margin: 0 0 16px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        max-width: 440px;
      }
      .mobile-account-info {
        text-align: left;
        min-width: 0;
        flex: 1;
      }
      .mobile-account-name {
        color: var(--white);
        font-weight: 800;
        font-size: 0.95rem;
      }
      .mobile-account-phone {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.75rem;
      }

      /* Profile Modal */
      .profile-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(13, 26, 15, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2500;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.25s ease;
      }
      .profile-modal-backdrop.open {
        opacity: 1;
        visibility: visible;
      }
      .profile-modal-dialog {
        width: 100%;
        max-width: 440px;
        border-radius: 0;
        transform: translateY(20px);
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .profile-modal-backdrop.open .profile-modal-dialog {
        transform: translateY(0);
      }

      .profile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
      }
      .profile-title {
        font-family: 'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif;
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--ink);
      }
      .profile-close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--muted);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .profile-close-btn:hover { color: var(--ink); }

      /* Toast Notification */
      #auth-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--emerald);
        border-left: 4px solid var(--lime);
        color: var(--white);
        padding: 12px 20px;
        font-size: 0.8125rem;
        font-weight: 700;
        z-index: 3500;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }
      #auth-toast.show {
        transform: translateY(0);
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  },

  renderHeaderAuth() {
    const navCta = document.querySelector('.nav-cta');
    const user = typeof MockAuth !== 'undefined' ? MockAuth.getUser() : null;

    if (!navCta) return;

    if (user) {
      const initial = (user.name || 'P').charAt(0).toUpperCase();
      const firstName = (user.name || 'Player').split(' ')[0];

      navCta.innerHTML = `
        <div class="nav-auth-group">
          <button type="button" class="account-pill-btn" id="accountPillBtn" aria-label="Account menu" aria-expanded="false">
            <span class="account-avatar-mini">${initial}</span>
            <span class="account-name-label">${firstName}</span>
            <i class="ph-thin ph-caret-down" style="font-size:12px"></i>
          </button>

          <div class="account-dropdown-wrap" id="accountDropdown">
            <div class="account-dropdown-outer">
              <div class="account-dropdown-inner">
                <div class="account-user-header">
                  <div class="account-avatar-large">${initial}</div>
                  <div class="account-user-meta">
                    <div class="account-user-fullname">${user.name || 'Cricket Player'}</div>
                    <div class="account-user-phone">${user.phone || user.email || 'Verified Player'}</div>
                  </div>
                </div>

                <ul class="account-menu-list">
                  <li class="account-menu-item">
                    <a href="my-bookings.html">
                      <i class="ph-thin ph-calendar-check"></i>
                      <span>My Bookings</span>
                    </a>
                  </li>
                  <li class="account-menu-item">
                    <button type="button" onclick="AuthShell.openProfileModal()">
                      <i class="ph-thin ph-user"></i>
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li class="account-menu-item">
                    <a href="owner/index.html">
                      <i class="ph-thin ph-buildings"></i>
                      <span>Owner Portal</span>
                    </a>
                  </li>
                  <li class="account-menu-divider"></li>
                  <li class="account-menu-item danger">
                    <button type="button" onclick="AuthShell.handleLogout()">
                      <i class="ph-thin ph-sign-out"></i>
                      <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      navCta.innerHTML = `
        <div class="nav-auth-group">
          <a href="login.html" class="btn-nav-login">Log In</a>
          <a href="register.html" class="btn-nav-register">Create Account</a>
        </div>
      `;
    }

    // Update Mobile Nav Overlay
    this.updateMobileOverlay(user);
  },

  updateMobileOverlay(user) {
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    if (!mobileMenu) return;

    if (user) {
      const initial = (user.name || 'P').charAt(0).toUpperCase();
      let mobileHeaderCard = document.getElementById('mobileUserHeader');
      if (!mobileHeaderCard) {
        mobileHeaderCard = document.createElement('div');
        mobileHeaderCard.id = 'mobileUserHeader';
        mobileHeaderCard.className = 'mobile-account-card';
        mobileMenu.parentNode.insertBefore(mobileHeaderCard, mobileMenu);
      }
      mobileHeaderCard.innerHTML = `
        <div class="account-avatar-large">${initial}</div>
        <div class="mobile-account-info">
          <div class="mobile-account-name">${user.name || 'Player'}</div>
          <div class="mobile-account-phone">${user.phone || user.email || 'Verified Account'}</div>
        </div>
      `;

      mobileMenu.innerHTML = `
        <li><a href="index.html#how-it-works" class="mobile-nav-link">How It Works</a></li>
        <li><a href="index.html#featured-grounds" class="mobile-nav-link">Find Grounds</a></li>
        <li><a href="index.html#matchmaking" class="mobile-nav-link">Matchmaking</a></li>
        <li><a href="my-bookings.html" class="mobile-nav-link">My Bookings</a></li>
        <li><a href="#" class="mobile-nav-link" onclick="AuthShell.openProfileModal(); return false;">My Profile</a></li>
        <li><a href="#" class="mobile-nav-link" style="color:#ef4444;" onclick="AuthShell.handleLogout(); return false;">Log Out</a></li>
      `;
    } else {
      const mobileHeaderCard = document.getElementById('mobileUserHeader');
      if (mobileHeaderCard) mobileHeaderCard.remove();

      mobileMenu.innerHTML = `
        <li><a href="index.html#how-it-works" class="mobile-nav-link">How It Works</a></li>
        <li><a href="index.html#featured-grounds" class="mobile-nav-link">Find Grounds</a></li>
        <li><a href="index.html#matchmaking" class="mobile-nav-link">Matchmaking</a></li>
        <li><a href="index.html#for-owners" class="mobile-nav-link">List Your Ground</a></li>
        <li><a href="login.html" class="mobile-nav-link">Log In</a></li>
        <li><a href="register.html" class="mobile-nav-link" style="color:var(--lime);">Create Account</a></li>
      `;
    }
  },

  renderProfileModal() {
    if (document.getElementById('profileModalBackdrop')) return;

    const modal = document.createElement('div');
    modal.id = 'profileModalBackdrop';
    modal.className = 'profile-modal-backdrop';
    modal.innerHTML = `
      <div class="card-outer profile-modal-dialog">
        <div class="card-inner">
          <div class="profile-header">
            <h2 class="profile-title">Player Profile</h2>
            <button class="profile-close-btn" onclick="AuthShell.closeProfileModal()" aria-label="Close profile modal">
              <i class="ph-bold ph-x"></i>
            </button>
          </div>

          <form id="profileForm" onsubmit="AuthShell.handleProfileSave(event)">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink); display:block; margin-bottom:6px;">Full Name</label>
              <input type="text" id="profName" class="form-input" style="width:100%; padding:11px 14px; border:1.5px solid var(--border); outline:none; background:var(--white);" required />
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink); display:block; margin-bottom:6px;">Mobile Number</label>
              <input type="tel" id="profPhone" class="form-input" style="width:100%; padding:11px 14px; border:1.5px solid var(--border); outline:none; background:var(--white);" required />
            </div>

            <div class="form-group" style="margin-bottom:24px;">
              <label class="form-label" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink); display:block; margin-bottom:6px;">Email Address</label>
              <input type="email" id="profEmail" class="form-input" style="width:100%; padding:11px 14px; border:1.5px solid var(--border); outline:none; background:var(--white);" placeholder="captain@cricket.pk" />
            </div>

            <div style="display:flex; gap:10px;">
              <button type="button" class="btn-ghost" style="flex:1;" onclick="AuthShell.closeProfileModal()">Cancel</button>
              <button type="submit" class="btn-primary" style="flex:1;">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Toast Container
    if (!document.getElementById('auth-toast')) {
      const toast = document.createElement('div');
      toast.id = 'auth-toast';
      toast.innerHTML = `<i class="ph-bold ph-check-circle" style="font-size:18px;"></i> <span id="authToastMsg">Saved!</span>`;
      document.body.appendChild(toast);
    }
  },

  openProfileModal() {
    this.closeDropdown();
    const user = typeof MockAuth !== 'undefined' ? MockAuth.getUser() : null;
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    document.getElementById('profName').value = user.name || '';
    document.getElementById('profPhone').value = user.phone || '';
    document.getElementById('profEmail').value = user.email || '';

    const modal = document.getElementById('profileModalBackdrop');
    if (modal) modal.classList.add('open');
  },

  closeProfileModal() {
    const modal = document.getElementById('profileModalBackdrop');
    if (modal) modal.classList.remove('open');
  },

  handleProfileSave(e) {
    e.preventDefault();
    const name = document.getElementById('profName').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const email = document.getElementById('profEmail').value.trim();

    try {
      MockAuth.updateProfile({ name, phone, email });
      this.closeProfileModal();
      this.renderHeaderAuth();
      this.showToast('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Error updating profile');
    }
  },

  handleLogout() {
    this.closeDropdown();
    if (typeof MockAuth !== 'undefined') {
      MockAuth.logout();
    }
    this.renderHeaderAuth();
    this.showToast('You have been logged out.');
  },

  showToast(msg) {
    const toast = document.getElementById('auth-toast');
    const msgEl = document.getElementById('authToastMsg');
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  },

  closeDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const pillBtn = document.getElementById('accountPillBtn');
    if (dropdown) dropdown.classList.remove('open');
    if (pillBtn) pillBtn.setAttribute('aria-expanded', 'false');
  },

  toggleDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const pillBtn = document.getElementById('accountPillBtn');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open', !isOpen);
    if (pillBtn) pillBtn.setAttribute('aria-expanded', String(!isOpen));
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const pillBtn = document.getElementById('accountPillBtn');
      const dropdown = document.getElementById('accountDropdown');
      
      if (pillBtn && pillBtn.contains(e.target)) {
        this.toggleDropdown();
        return;
      }

      if (dropdown && !dropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
        this.closeProfileModal();
      }
    });
  }
};

// Auto-run on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AuthShell.init());
} else {
  AuthShell.init();
}
