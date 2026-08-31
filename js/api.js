/**
 * GroundsNearMe — Public Frontend Live Data Connector
 * Connects the public website directly to Supabase and the Cloudflare Worker.
 */

const GNM_CONFIG = {
  supabaseUrl: 'https://mfybkflgkjpuqhlthagt.supabase.co',
  supabaseAnon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meWJrZmxna2pwdXFobHRoYWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzEzNzgsImV4cCI6MjEwMzc0NzM3OH0.z5r3FXEsGS7OPLR1Rugn7XDlYHxKMhdvDWsUcfnL20I',
  r2BaseUrl: 'https://images.groundsnearme.pk'
};

const GNM = {
  grounds: [],
  areas: [],
  games: [],
  currentAreaFilter: 'all',
  currentTypeFilter: 'all',

  async fetch(endpoint, options = {}) {
    const url = `${GNM_CONFIG.supabaseUrl}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': GNM_CONFIG.supabaseAnon,
      'Authorization': `Bearer ${GNM_CONFIG.supabaseAnon}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    return await res.json();
  },

  async init() {
    try {
      await Promise.allSettled([
        this.loadAreas(),
        this.loadGrounds(),
        this.loadMatchmaking()
      ]);
      this.renderAreaFilters();
      this.renderGrounds();
      this.renderMatchmaking();
      this.updateStatsBar();
    } catch (err) {
      console.warn('Live data fetch failed, using fallback:', err);
    }
  },

  async loadAreas() {
    try {
      this.areas = await this.fetch('areas?select=*&is_active=eq.true&order=sort_order.asc');
    } catch (e) {
      console.error('Error loading areas:', e);
    }
  },

  async loadGrounds() {
    try {
      this.grounds = await this.fetch('grounds?select=*,area:areas(name,slug)&status=eq.active&order=is_featured.desc,featured_rank.asc,created_at.desc');
    } catch (e) {
      console.error('Error loading grounds:', e);
    }
  },

  async loadMatchmaking() {
    try {
      this.games = await this.fetch('open_games?select=*,area:areas(name,slug),ground:grounds(name)&status=eq.open&order=match_date.asc,start_time.asc&limit=6');
    } catch (e) {
      console.error('Error loading matchmaking:', e);
    }
  },

  renderAreaFilters() {
    const sectionHeader = document.querySelector('#featured-grounds .section-header');
    if (!sectionHeader) return;

    let filterBar = document.getElementById('gnm-filter-bar');
    if (!filterBar) {
      filterBar = document.createElement('div');
      filterBar.id = 'gnm-filter-bar';
      filterBar.className = 'filter-bar reveal visible';
      filterBar.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin: 24px 0 32px;
      `;
      sectionHeader.parentNode.insertBefore(filterBar, sectionHeader.nextSibling);
    }

    const popularAreas = this.areas.slice(0, 6);
    filterBar.innerHTML = `
      <button class="filter-pill ${this.currentAreaFilter === 'all' ? 'active' : ''}" onclick="GNM.setAreaFilter('all')">All Areas</button>
      ${popularAreas.map(a => `
        <button class="filter-pill ${this.currentAreaFilter === a.slug ? 'active' : ''}" onclick="GNM.setAreaFilter('${a.slug}')">${a.name}</button>
      `).join('')}
      <button class="filter-pill ${this.currentTypeFilter === 'indoor' ? 'active' : ''}" onclick="GNM.setTypeFilter('${this.currentTypeFilter === 'indoor' ? 'all' : 'indoor'}')">
        <i class="ph-bold ph-shield"></i> Indoor
      </button>
      <button class="filter-pill ${this.currentTypeFilter === 'outdoor' ? 'active' : ''}" onclick="GNM.setTypeFilter('${this.currentTypeFilter === 'outdoor' ? 'all' : 'outdoor'}')">
        <i class="ph-bold ph-sun"></i> Outdoor
      </button>
    `;
  },

  setAreaFilter(slug) {
    this.currentAreaFilter = slug;
    this.renderAreaFilters();
    this.renderGrounds();
  },

  setTypeFilter(type) {
    this.currentTypeFilter = type;
    this.renderAreaFilters();
    this.renderGrounds();
  },

  renderGrounds() {
    const grid = document.querySelector('#featured-grounds .grounds-grid');
    if (!grid) return;

    let filtered = this.grounds.filter(g => {
      if (this.currentAreaFilter !== 'all') {
        const areaSlug = g.area?.slug || '';
        if (areaSlug !== this.currentAreaFilter) return false;
      }
      if (this.currentTypeFilter !== 'all') {
        if (g.ground_type !== this.currentTypeFilter && g.ground_type !== 'both') return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--muted); background: var(--off); border: 1px solid var(--border);">
          <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 6px; color: var(--ink);">No grounds found in this filter</p>
          <p style="font-size: 0.9rem;">Try selecting "All Areas" to see all available cricket grounds in Karachi.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((g, index) => {
      const delay = (0.05 * (index + 1)).toFixed(2);
      const amenities = Array.isArray(g.amenities) ? g.amenities : [];
      const waNumber = (g.whatsapp_number || '920000000000').replace(/\D/g, '');
      const waText = encodeURIComponent(`Hi, I found ${g.name} on GroundsNearMe and want to check slot availability.`);
      const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

      return `
        <div class="card-outer venue-card reveal visible" style="transition-delay:${delay}s">
          <div class="card-inner">
            <div class="venue-img-area">
              ${g.cover_image_url ? `
                <img src="${g.cover_image_url.startsWith('http') ? g.cover_image_url : GNM_CONFIG.r2BaseUrl + '/' + g.cover_image_url}" alt="${g.name}" style="width:100%; height:100%; object-fit:cover;" />
              ` : `
                <span class="venue-img-label">${g.surface || 'Cricket Ground'}</span>
              `}
              <span class="venue-badge badge-open">Slots Open</span>
            </div>
            <div class="venue-body">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <h3 class="venue-name">${g.name}</h3>
                ${g.listing_tier === 'pro' ? `<span class="badge badge-pro" style="font-size:10px; padding:2px 6px; background:var(--emerald); color:var(--lime); font-weight:800; border-radius:4px;">PRO</span>` : ''}
              </div>
              <div class="venue-area"><i class="ph-thin ph-map-pin"></i> ${g.area?.name || g.city || 'Karachi'}</div>
              <div class="venue-price">PKR ${Number(g.price_per_hour).toLocaleString()} / hour</div>
              <div class="venue-amenities">
                ${amenities.slice(0, 4).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
              </div>
              <div class="venue-footer">
                <a href="${waUrl}" target="_blank" rel="noopener" class="venue-slots-link">
                  Book on WhatsApp <i class="ph-thin ph-arrow-right"></i>
                </a>
                <a href="${waUrl}" target="_blank" rel="noopener" class="venue-wa-btn" aria-label="Chat on WhatsApp">
                  <i class="ph-thin ph-whatsapp-logo"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderMatchmaking() {
    const rightCol = document.querySelector('#matchmaking .matchmaking-right');
    if (!rightCol || this.games.length === 0) return;

    rightCol.innerHTML = this.games.slice(0, 2).map((game, i) => `
      <div class="card-outer match-card reveal visible" style="transition-delay:${(0.05 * (i + 1)).toFixed(2)}s">
        <div class="card-inner">
          <div class="match-card-header">
            <div>
              <div class="match-post-title">${game.title}</div>
              <div class="match-poster">@${game.host_handle || 'cricket_captain'}</div>
            </div>
            <span class="match-badge-new">Open</span>
          </div>
          <div class="match-details">
            <div class="match-detail">
              <span class="match-detail-label">Skill Level</span>
              <span class="match-detail-value uppercase" style="font-size:12px; font-weight:700;">${game.skill_level}</span>
            </div>
            <div class="match-detail">
              <span class="match-detail-label">Area</span>
              <span class="match-detail-value">${game.area?.name || 'Karachi'}</span>
            </div>
            <div class="match-detail">
              <span class="match-detail-label">Format</span>
              <span class="match-detail-value">${game.format}</span>
            </div>
          </div>
          <div class="match-footer">
            <div class="match-interest">
              <i class="ph-thin ph-calendar"></i> ${game.match_date} at ${(game.start_time || '').slice(0, 5)}
            </div>
            <a href="https://wa.me/923000000000?text=${encodeURIComponent('Hi, I want to join match: ' + game.title)}" target="_blank" class="btn-join">
              Join Game <i class="ph-thin ph-arrow-right" style="font-size:11px"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  },

  updateStatsBar() {
    const groundsCountEl = document.querySelector('.stat-item .stat-number[data-target="150"]');
    if (groundsCountEl && this.grounds.length > 0) {
      groundsCountEl.setAttribute('data-target', String(this.grounds.length));
      groundsCountEl.textContent = `${this.grounds.length}+`;
    }

    const areasCountEl = document.querySelector('.stat-item .stat-number[data-target="12"]');
    if (areasCountEl && this.areas.length > 0) {
      areasCountEl.setAttribute('data-target', String(this.areas.length));
      areasCountEl.textContent = `${this.areas.length}`;
    }
  }
};

// Global styles for dynamic filter pills
const filterStyle = document.createElement('style');
filterStyle.textContent = `
  .filter-pill {
    padding: 8px 16px;
    background: var(--white);
    border: 1.5px solid var(--border);
    color: var(--muted);
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 999px;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
  }
  .filter-pill:hover {
    border-color: var(--emerald);
    color: var(--emerald);
    background: var(--card-bg);
  }
  .filter-pill.active {
    background: var(--emerald);
    color: var(--white);
    border-color: var(--emerald);
  }
`;
document.head.appendChild(filterStyle);

// Auto-run on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GNM.init());
} else {
  GNM.init();
}
