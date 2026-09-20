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
      if (typeof revealObserver !== 'undefined') {
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
      }
    } catch (err) {
      console.warn('Live data fetch failed, using fallback:', err);
    }
  },

  async loadAreas() {
    try {
      this.areas = await this.fetch('areas?select=id,name,slug,sort_order&is_active=eq.true&order=sort_order.asc');
    } catch (e) {
      console.error('Error loading areas:', e);
    }
  },

  async loadGrounds() {
    try {
      this.grounds = await this.fetch('grounds?select=id,slug,name,owner_id,area_id,city,address,description,ground_type,surface,pitch_count,price_per_hour,weekend_price_per_hour,whatsapp_number,contact_name,amenities,cover_image_url,status,listing_tier,is_featured,featured_rank,rating,review_count,area:areas(name,slug)&status=eq.active&order=is_featured.desc,featured_rank.asc,created_at.desc');
    } catch (e) {
      console.error('Error loading grounds:', e);
    }
    if (!this.grounds || this.grounds.length === 0) {
      if (typeof MOCK_GROUNDS !== 'undefined') {
        this.grounds = MOCK_GROUNDS.filter(g => g.status === 'active');
      }
    }
  },

  async loadMatchmaking() {
    try {
      this.games = await this.fetch('open_games?select=id,title,host_handle,looking_for,skill_level,format,players_needed,whatsapp_number,match_date,start_time,status,area:areas(name,slug),ground:grounds(name)&status=eq.open&order=match_date.asc,start_time.asc&limit=6');
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
      let waNumber = (g.whatsapp_number || '923362308445').replace(/\D/g, '');
      if (waNumber.startsWith('03') && waNumber.length === 11) waNumber = '92' + waNumber.slice(1);
      else if (waNumber.startsWith('0092')) waNumber = waNumber.slice(2);
      const waText = encodeURIComponent(`Hi, I found ${g.name} on GroundsNearMe and want to check slot availability.`);
      const waUrl = `https://wa.me/${waNumber}?text=${waText}`;
      const detailUrl = `ground.html?id=${g.slug || g.id}`;

      let coverImg = g.cover_image_url;
      if (!coverImg && typeof MOCK_GROUNDS !== 'undefined') {
        const mockMatch = MOCK_GROUNDS.find(m => m.slug === g.slug || m.id === g.id || m.supabase_id === g.id);
        if (mockMatch) coverImg = mockMatch.cover_image_url;
      }
      if (!coverImg) {
        coverImg = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80';
      }

      const areaText = g.area?.name || g.city || 'Karachi';
      return `
        <div class="card-outer venue-card reveal visible" style="transition-delay:${delay}s">
          <div class="card-inner">
            <a href="${detailUrl}" class="venue-img-area" style="display:block; text-decoration:none; color:inherit; cursor:pointer;" aria-label="View details and slots for ${g.name}">
              <img src="${coverImg.startsWith('http') ? coverImg : GNM_CONFIG.r2BaseUrl + '/' + coverImg}" alt="${g.name} cricket pitch in ${areaText}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80';" />
              <span class="venue-badge badge-open">Slots Open</span>
            </a>
            <div class="venue-body">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <h3 class="venue-name"><a href="${detailUrl}" style="color:inherit; text-decoration:none;">${g.name}</a></h3>
                ${g.listing_tier === 'pro' ? `<span class="badge badge-pro" style="font-size:10px; padding:2px 6px; background:var(--emerald); color:var(--lime); font-weight:800; border-radius:4px;">PRO</span>` : ''}
              </div>
              <div class="venue-area"><i class="ph-thin ph-map-pin"></i> ${areaText}</div>
              <div class="venue-price">PKR ${Number(g.price_per_hour).toLocaleString()} / hour</div>
              <div class="venue-amenities">
                ${amenities.slice(0, 4).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
              </div>
              <div class="venue-footer">
                <a href="${detailUrl}" class="venue-slots-link">
                  View Slots <i class="ph-thin ph-arrow-right"></i>
                </a>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="venue-wa-btn" aria-label="Chat with ${g.name} management on WhatsApp">
                  <i class="ph-thin ph-whatsapp-logo"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  renderMatchmaking() {
    const rightCol = document.querySelector('#matchmaking .matchmaking-right');
    if (!rightCol) return;

    if (!this.games || this.games.length === 0) {
      rightCol.innerHTML = `
        <div class="card-outer match-card reveal visible" style="padding:40px 24px; text-align:center;">
          <div class="card-inner" style="display:flex; flex-direction:column; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--card-bg); color:var(--emerald); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
              <i class="ph-thin ph-users-three"></i>
            </div>
            <h3 style="font-size:1.1rem; font-weight:800; margin:0;">No Open Matches Right Now</h3>
            <p style="color:var(--muted); font-size:0.875rem; margin:0; max-width:320px;">
              Looking for extra players or want to challenge an opposition team this weekend?
            </p>
            <button onclick="openCreateMatchModal()" class="btn-primary" style="margin-top:8px; padding:10px 22px; font-size:0.875rem;">
              Post a Match Request
            </button>
          </div>
        </div>
      `;
      return;
    }

    rightCol.innerHTML = this.games.slice(0, 4).map((game, i) => {
      const waNumber = (game.whatsapp_number || '923362308445').replace(/[^0-9]/g, '');
      const handle = game.host_handle || 'cricket_captain';
      const waMsg = encodeURIComponent(`Hi @${handle}, I saw your game on GroundsNearMe: "${game.title}". I would like to join!`);
      const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;
      const badgeText = game.looking_for === 'opposition' ? 'Needs Team' : (game.players_needed ? `${game.players_needed} Needed` : 'Open');
      const groundInfo = game.ground?.name ? ` · ${game.ground.name}` : '';

      return `
      <div class="card-outer match-card reveal visible" style="transition-delay:${(0.05 * (i + 1)).toFixed(2)}s; margin-bottom:16px;">
        <div class="card-inner">
          <div class="match-card-header">
            <div>
              <div class="match-post-title">${this.escapeHtml(game.title)}</div>
              <div class="match-poster">@${this.escapeHtml(handle)}</div>
            </div>
            <span class="match-badge-new" style="${game.looking_for === 'opposition' ? 'background:#fef3c7; color:#b45309;' : ''}">${badgeText}</span>
          </div>
          <div class="match-details">
            <div class="match-detail">
              <span class="match-detail-label">Skill Level</span>
              <span class="match-detail-value uppercase" style="font-size:12px; font-weight:700;">${this.escapeHtml(game.skill_level)}</span>
            </div>
            <div class="match-detail">
              <span class="match-detail-label">Area</span>
              <span class="match-detail-value">${this.escapeHtml((game.area?.name || 'Karachi') + groundInfo)}</span>
            </div>
            <div class="match-detail">
              <span class="match-detail-label">Format</span>
              <span class="match-detail-value">${this.escapeHtml(game.format || 'Tape Ball')}</span>
            </div>
          </div>
          <div class="match-footer">
            <div class="match-interest">
              <i class="ph-thin ph-calendar"></i> ${game.match_date} · ${(game.start_time || '').slice(0, 5)}
            </div>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-join" aria-label="Join match ${this.escapeHtml(game.title)} via WhatsApp">
              Join Game <i class="ph-thin ph-whatsapp-logo" style="font-size:13px"></i>
            </a>
          </div>
        </div>
      </div>
    `;
    }).join('');
  },

  async createMatch(data) {
    const session = JSON.parse(sessionStorage.getItem('gnm_supabase_session') || 'null');
    const token = session?.access_token || GNM_CONFIG.supabaseAnon;
    const handle = (data.host_handle || 'player_' + Math.random().toString(36).substring(2, 6)).toLowerCase().replace(/[^a-z0-9_]/g, '');

    const payload = {
      title: data.title.trim(),
      host_handle: handle,
      looking_for: data.looking_for || 'players',
      skill_level: data.skill_level || 'any',
      format: data.format || 'Tape Ball',
      area_id: data.area_id || null,
      ground_id: data.ground_id || null,
      booking_ref: data.booking_ref || null,
      booking_id: data.booking_id || null,
      match_date: data.match_date,
      start_time: data.start_time || '20:00:00',
      players_needed: data.looking_for === 'players' ? (parseInt(data.players_needed, 10) || 2) : null,
      whatsapp_number: data.whatsapp_number ? data.whatsapp_number.replace(/[^0-9]/g, '') : '923362308445',
      status: 'open'
    };

    let createdGame = null;

    // 1. Try create_verified_match or create_open_game RPC first
    try {
      const rpcRes = await fetch(`${GNM_CONFIG.supabaseUrl}/rest/v1/rpc/create_verified_match`, {
        method: 'POST',
        headers: {
          'apikey': GNM_CONFIG.supabaseAnon,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_booking_ref: payload.booking_ref,
          p_title: payload.title,
          p_looking_for: payload.looking_for,
          p_players_needed: payload.players_needed,
          p_format: payload.format,
          p_skill_level: payload.skill_level,
          p_whatsapp_number: payload.whatsapp_number,
          p_host_handle: payload.host_handle
        })
      });
      if (rpcRes.ok) {
        const json = await rpcRes.json();
        if (json?.ok && json.game) createdGame = json.game;
      }
    } catch (_) {}

    // 2. Direct POST fallback to open_games
    if (!createdGame) {
      // Clean payload: only send standard columns to avoid schema cache mismatch errors
      const basePayload = {
        title: payload.title,
        host_handle: payload.host_handle,
        looking_for: payload.looking_for,
        skill_level: payload.skill_level,
        format: payload.format,
        area_id: payload.area_id,
        ground_id: payload.ground_id,
        city: 'Karachi',
        match_date: payload.match_date,
        start_time: payload.start_time,
        players_needed: payload.players_needed,
        notes: payload.booking_ref ? `[Verified Booking: ${payload.booking_ref}]` : (payload.notes || null),
        whatsapp_number: payload.whatsapp_number,
        status: 'open'
      };

      let res = await fetch(`${GNM_CONFIG.supabaseUrl}/rest/v1/open_games`, {
        method: 'POST',
        headers: {
          'apikey': GNM_CONFIG.supabaseAnon,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ ...basePayload, booking_ref: payload.booking_ref })
      });

      // If booking_ref column is not in schema cache, retry without it
      if (!res.ok) {
        const errJson = await res.clone().json().catch(() => ({}));
        if (errJson?.message && (errJson.message.includes('schema cache') || errJson.message.includes('column'))) {
          res = await fetch(`${GNM_CONFIG.supabaseUrl}/rest/v1/open_games`, {
            method: 'POST',
            headers: {
              'apikey': GNM_CONFIG.supabaseAnon,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(basePayload)
          });
        }
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to post match');
      }

      const rows = await res.json();
      createdGame = Array.isArray(rows) ? rows[0] : rows;
    }

    // Dual-write to local games array so UI reflects it immediately
    if (createdGame) {
      this.games = [createdGame, ...(this.games || [])];
    }

    await this.loadMatchmaking();
    this.renderMatchmaking();
    return createdGame;
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
  #gnm-filter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin: 24px 0 32px;
  }
  .filter-pill {
    padding: 8px 16px;
    background: var(--white);
    border: 1.5px solid var(--border);
    color: var(--muted);
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 999px;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    white-space: nowrap;
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
  @media(max-width: 640px) {
    #gnm-filter-bar {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding-bottom: 6px;
      margin: 16px 0 24px;
    }
    #gnm-filter-bar::-webkit-scrollbar { display: none; }
    .filter-pill { flex-shrink: 0; }
  }
`;
document.head.appendChild(filterStyle);

// Auto-run on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GNM.init());
} else {
  GNM.init();
}
