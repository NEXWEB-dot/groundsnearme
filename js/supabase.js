/**
 * GroundsNearMe — Supabase API Layer (Player-Facing)
 * ===================================================
 * Shared REST client used by ground.html, my-bookings.html,
 * and any other public player page.
 *
 * Uses the same Supabase project & anon key as the owner portal.
 * No Supabase JS SDK needed — pure fetch() against the REST API.
 */

'use strict';

const GNM_SUPABASE = {
  url:  'https://mfybkflgkjpuqhlthagt.supabase.co',
  key:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meWJrZmxna2pwdXFobHRoYWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzEzNzgsImV4cCI6MjEwMzc0NzM3OH0.z5r3FXEsGS7OPLR1Rugn7XDlYHxKMhdvDWsUcfnL20I'
};

/**
 * Low-level fetch wrapper. Mirrors the sbFetch() in the owner portal.
 * @param {string} endpoint  - e.g. 'grounds', 'bookings?id=eq.xxx'
 * @param {RequestInit} [opts] - optional fetch options
 * @returns {Promise<any>}   - parsed JSON or null (for 204 No Content)
 */
async function gnmFetch(endpoint, opts = {}) {
  const url = `${GNM_SUPABASE.url}/rest/v1/${endpoint}`;
  const headers = {
    'apikey':        GNM_SUPABASE.key,
    'Authorization': `Bearer ${GNM_SUPABASE.key}`,
    'Content-Type':  'application/json',
    ...opts.headers
  };

  const res = await fetch(url, { ...opts, headers });

  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText;
    try { msg = JSON.parse(text).message || msg; } catch (_) {}
    throw new Error(`Supabase error (${res.status}): ${msg}`);
  }

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}


/* ─────────────────────────────────────────
   GROUNDS API
   ───────────────────────────────────────── */
const SupabaseGrounds = {
  _cache: null,

  /**
   * Fetch all active grounds from Supabase and enrich with fallback imagery.
   */
  async getAll() {
    if (this._cache) return this._cache;
    try {
      const rows = await gnmFetch('grounds?select=*&status=eq.active&order=name.asc');
      if (rows && rows.length > 0) {
        this._cache = rows.map(g => this._enrich(g));
        return this._cache;
      }
    } catch (err) {
      console.warn('[GNM] Supabase grounds fetch failed, using mock data:', err.message);
    }
    this._cache = (typeof MOCK_GROUNDS !== 'undefined' ? MOCK_GROUNDS : []).map(g => this._enrich(g));
    return this._cache;
  },

  /**
   * Find a single ground by Supabase UUID, slug, name, or mock ID.
   */
  async getById(idOrSlug) {
    const all = await this.getAll();
    if (!idOrSlug) return all[0] || null;

    let match = all.find(g => 
      g.id === idOrSlug || 
      g.slug === idOrSlug || 
      g.supabase_id === idOrSlug ||
      (g.name && g.name.toLowerCase() === idOrSlug.toLowerCase())
    );

    if (!match && typeof findMockGround === 'function') {
      const mock = findMockGround(idOrSlug);
      if (mock) match = this._enrich(mock);
    }

    return match || all[0] || null;
  },

  /**
   * Enriches a ground object with high-res photos and area info if empty in DB.
   */
  _enrich(ground) {
    const mock = typeof MOCK_GROUNDS !== 'undefined' 
      ? MOCK_GROUNDS.find(m => m.slug === ground.slug || m.id === ground.id || m.supabase_id === ground.id)
      : null;

    const cover_image_url = ground.cover_image_url || (mock && mock.cover_image_url) || 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80';
    const gallery_images = (ground.images && ground.images.length > 0) 
      ? ground.images 
      : ((mock && mock.gallery_images) || [cover_image_url]);

    const area = ground.area || (mock && mock.area) || { name: ground.city || 'Karachi', slug: 'karachi' };
    const amenities = (ground.amenities && ground.amenities.length > 0) 
      ? ground.amenities 
      : ((mock && mock.amenities) || ['Floodlights', 'Parking', 'Washroom']);

    return {
      ...ground,
      cover_image_url,
      gallery_images,
      area,
      amenities,
      price_per_hour: ground.price_per_hour || (mock && mock.price_per_hour) || 2500,
      surface: ground.surface || (mock && mock.surface) || 'Turf',
      description: ground.description || (mock && mock.description) || 'Premier cricket venue in Karachi with quality pitches and floodlights.'
    };
  }
};


/* ─────────────────────────────────────────
   BOOKINGS API
   ───────────────────────────────────────── */
const SupabaseBookings = {

  /**
   * Create a new booking.
   * Sends to Supabase and saves to local booking store so it is
   * immediately reflected in both the player and owner portals.
   */
  async createBooking(payload) {
    const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const full = {
      booking_ref:      `GNM-2026-${randSuffix}`,
      source:           'owner', // 'owner' is permitted by DB enum
      status:           'confirmed',
      payment_status:   'unpaid',
      currency:         'PKR',
      confirmed_at:     new Date().toISOString(),
      ...payload
    };

    let createdBooking = null;

    // 1. Attempt live Supabase insert
    try {
      const rows = await gnmFetch('bookings', {
        method:  'POST',
        body:    JSON.stringify(full),
        headers: { 'Prefer': 'return=representation' }
      });
      createdBooking = Array.isArray(rows) ? rows[0] : rows;
    } catch (err) {
      console.warn('[GNM] Supabase booking POST error (will persist in local session):', err.message);
    }

    // 2. Also dual-write into MockBookingStore so owner dashboard & player see it synchronously
    if (typeof MockBookingStore !== 'undefined') {
      const localBooking = MockBookingStore.createBooking({
        ...full,
        id: createdBooking ? createdBooking.id : undefined,
        booking_ref: createdBooking ? createdBooking.booking_ref : full.booking_ref
      });
      if (!createdBooking) createdBooking = localBooking;
    }

    return createdBooking || full;
  },

  /**
   * Fetch bookings for a specific ground + date.
   */
  async getBookingsForGroundDate(groundId, dateStr) {
    let list = [];
    try {
      const rows = await gnmFetch(
        `bookings?ground_id=eq.${encodeURIComponent(groundId)}&booking_date=eq.${dateStr}&select=id,start_time,end_time,status`
      );
      if (Array.isArray(rows)) list = rows;
    } catch (_) {}

    // Merge with localStorage bookings
    if (typeof MockBookingStore !== 'undefined') {
      const localBookings = MockBookingStore.getBookingsForGroundDate(groundId, dateStr);
      localBookings.forEach(lb => {
        if (!list.some(b => b.id === lb.id || (b.booking_date === lb.booking_date && b.start_time === lb.start_time))) {
          list.push(lb);
        }
      });
    }

    return list;
  },

  /**
   * Fetch all bookings for the currently logged-in player.
   */
  async getPlayerBookings() {
    const user = typeof MockAuth !== 'undefined' ? MockAuth.getUser() : null;
    let list = [];

    // 1. Fetch from Supabase
    try {
      const rows = await gnmFetch('bookings?order=booking_date.desc,start_time.asc&select=*');
      if (Array.isArray(rows) && rows.length > 0) {
        if (user && user.phone) {
          const userPhoneDigits = user.phone.replace(/\D/g, '');
          list = rows.filter(b => b.contact_phone && b.contact_phone.replace(/\D/g, '') === userPhoneDigits);
        } else {
          list = rows;
        }
      }
    } catch (err) {
      console.warn('[GNM] Supabase player bookings fetch failed:', err.message);
    }

    // 2. Merge with local bookings
    if (typeof MockBookingStore !== 'undefined') {
      const local = MockBookingStore.getPlayerBookings();
      local.forEach(lb => {
        if (!list.some(b => b.id === lb.id || b.booking_ref === lb.booking_ref)) {
          list.push(lb);
        }
      });
    }

    return list.sort((a, b) => {
      if (a.booking_date > b.booking_date) return -1;
      if (a.booking_date < b.booking_date) return 1;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });
  },

  /**
   * Cancel a booking.
   */
  async cancelBooking(bookingId) {
    try {
      await gnmFetch(`bookings?id=eq.${bookingId}`, {
        method:  'PATCH',
        body:    JSON.stringify({ status: 'cancelled' }),
        headers: { 'Prefer': 'return=minimal' }
      });
    } catch (_) {}

    if (typeof MockBookingStore !== 'undefined') {
      MockBookingStore.cancelBooking(bookingId);
    }
    return true;
  }
};


/* ─────────────────────────────────────────
   LIVE SLOT STORE
   ───────────────────────────────────────── */
const LiveSlotStore = {
  async getSlotsForDate(groundId, dateStr) {
    const liveBookings = await SupabaseBookings.getBookingsForGroundDate(groundId, dateStr);
    const bookedTimes = liveBookings
      .filter(b => b.status !== 'cancelled')
      .map(b => b.start_time ? b.start_time.slice(0, 5) : null)
      .filter(Boolean);

    const slots = [];
    for (let h = 9; h < 26; h++) {
      const actualH = h % 24;
      const nextH   = (h + 1) % 24;
      const time    = `${String(actualH).padStart(2, '0')}:00`;
      const endTime = `${String(nextH).padStart(2, '0')}:00`;
      const label   = LiveSlotStore._fmt(actualH) + ' – ' + LiveSlotStore._fmt(nextH);

      const seed        = LiveSlotStore._hash(String(groundId) + dateStr + h);
      const isPreBooked = (seed % 6 === 0); // ~16% deterministic pre-booked

      const isBooked = bookedTimes.includes(time) || isPreBooked;
      slots.push({
        time:    time + ':00',
        endTime: endTime + ':00',
        label,
        status:  isBooked ? 'booked' : 'available'
      });
    }
    return slots;
  },

  _fmt(hour) {
    if (hour === 0)  return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12)   return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  },

  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
};
