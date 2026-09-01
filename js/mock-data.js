/**
 * GroundsNearMe — Phase 2 Mock Data Store
 * Provides mock grounds, slot generation, booking management, and auth helpers.
 * All shapes match the Supabase schema so backend swap is a clean replace.
 */

'use strict';

/* ────────────────────────────────────────────
   MOCK GROUNDS (extended from Supabase shape)
   ──────────────────────────────────────────── */
const MOCK_GROUNDS = [
  {
    id: 'g-001',
    supabase_id: '90337fe0-eed4-4c1d-848b-90bc25225fab',
    name: 'Star Indoor Cricket',
    slug: 'star-indoor-cricket',
    status: 'active',
    is_featured: true,
    featured_rank: 1,
    listing_tier: 'pro',
    ground_type: 'indoor',
    price_per_hour: 2500,
    weekend_price_per_hour: 3000,
    surface: 'Astro Turf',
    amenities: ['Floodlights', 'Parking', 'Washroom', 'Indoor', 'Nets', 'Seating'],
    cover_image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80'
    ],
    description: 'Star Indoor Cricket is one of Karachi\'s premier indoor cricket facilities, located in the heart of Gulshan-e-Iqbal. Featuring a professional-grade astro turf pitch with full LED floodlighting, this venue is perfect for evening matches and tournament play. The facility includes covered seating for spectators, clean washrooms, and ample parking. Whether you\'re playing a casual tape-ball game or a competitive hard-ball match, Star Indoor delivers a top-tier experience every time.',
    whatsapp_number: '923001234567',
    contact_name: 'Ahmed Raza',
    city: 'Karachi',
    area_id: 'a-001',
    area: { name: 'Gulshan-e-Iqbal', slug: 'gulshan-e-iqbal' },
    latitude: 24.9262,
    longitude: 67.0851,
    address: 'Block 13-A, Near Kamran Chowrangi, Gulshan-e-Iqbal, Karachi',
    created_at: '2026-06-15T10:00:00Z'
  },
  {
    id: 'g-002',
    supabase_id: '73ebb20b-a89e-48a6-b02f-9dfc10e6f022',
    name: 'Champions Arena',
    slug: 'champions-arena',
    status: 'active',
    is_featured: true,
    featured_rank: 2,
    listing_tier: 'pro',
    ground_type: 'indoor',
    price_per_hour: 3200,
    weekend_price_per_hour: 3800,
    surface: 'Premium Turf',
    amenities: ['Indoor', 'Floodlights', 'Nets', 'Seating', 'Parking', 'Scorer'],
    cover_image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80'
    ],
    description: 'Champions Arena is DHA\'s finest indoor cricket facility, offering air-conditioned comfort with a premium turf surface. The venue features a professional scorer, live score display, and is ideal for corporate events and competitive league matches. Located in DHA Phase 6 with easy access from Khayaban-e-Bukhari.',
    whatsapp_number: '923009876543',
    contact_name: 'Faisal Khan',
    city: 'Karachi',
    area_id: 'a-002',
    area: { name: 'DHA Phase 6', slug: 'dha-phase-6' },
    latitude: 24.8007,
    longitude: 67.0370,
    address: 'Plot 42, Lane 3, Bukhari Commercial, DHA Phase 6, Karachi',
    created_at: '2026-07-01T14:00:00Z'
  },
  {
    id: 'g-003',
    supabase_id: 'c504d103-aca8-4211-b9c1-22c01774e36c',
    name: 'KCC Ground Nazimabad',
    slug: 'kcc-ground-nazimabad',
    status: 'active',
    is_featured: true,
    featured_rank: 3,
    listing_tier: 'free',
    ground_type: 'outdoor',
    price_per_hour: 1800,
    weekend_price_per_hour: 2200,
    surface: 'Natural Grass',
    amenities: ['Floodlights', 'Outdoor', 'Washroom', 'Parking'],
    cover_image_url: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80',
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80'
    ],
    description: 'KCC Ground is a beloved open-air cricket ground in the heart of Nazimabad. Known for its natural grass pitch and classic floodlit evening atmosphere, this ground has hosted countless neighbourhood tournaments. The venue offers basic facilities including washrooms and nearby parking. Perfect for those who prefer the real outdoor cricket experience under the Karachi sky.',
    whatsapp_number: '923331112233',
    contact_name: 'Nasir Hussain',
    city: 'Karachi',
    area_id: 'a-003',
    area: { name: 'Nazimabad', slug: 'nazimabad' },
    latitude: 24.9176,
    longitude: 67.0300,
    address: 'Block 3, Near Board Office, Nazimabad, Karachi',
    created_at: '2026-05-20T09:00:00Z'
  },
  {
    id: 'g-004',
    name: 'Smash Turf Arena',
    slug: 'smash-turf-arena',
    status: 'active',
    is_featured: false,
    featured_rank: 4,
    listing_tier: 'free',
    ground_type: 'both',
    price_per_hour: 2000,
    weekend_price_per_hour: 2500,
    surface: 'Synthetic Turf',
    amenities: ['Floodlights', 'Indoor', 'Outdoor', 'Parking', 'Washroom', 'Seating'],
    cover_image_url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80'
    ],
    description: 'Smash Turf Arena offers both indoor and outdoor playing options on high-quality synthetic turf. Located in North Nazimabad, this versatile ground caters to all skill levels. The facility features floodlights for evening play, covered spectator seating, and convenient parking. A great all-round choice for casual games and group bookings.',
    whatsapp_number: '923214567890',
    contact_name: 'Bilal Amir',
    city: 'Karachi',
    area_id: 'a-004',
    area: { name: 'North Nazimabad', slug: 'north-nazimabad' },
    latitude: 24.9350,
    longitude: 67.0350,
    address: 'Block H, North Nazimabad, Near Hyderi Market, Karachi',
    created_at: '2026-08-01T11:00:00Z'
  }
];


/* ────────────────────────────────────────────
   AMENITY → ICON MAPPING
   ──────────────────────────────────────────── */
const AMENITY_ICONS = {
  'Floodlights':  'ph-thin ph-lightning',
  'Parking':      'ph-thin ph-car',
  'Washroom':     'ph-thin ph-toilet',
  'Indoor':       'ph-thin ph-warehouse',
  'Outdoor':      'ph-thin ph-sun',
  'Nets':         'ph-thin ph-volleyball',
  'Seating':      'ph-thin ph-armchair',
  'Scorer':       'ph-thin ph-clipboard-text',
  'AC':           'ph-thin ph-snowflake',
  'Dressing Room':'ph-thin ph-lockers',
  'Canteen':      'ph-thin ph-coffee',
  'WiFi':         'ph-thin ph-wifi-high'
};

function getAmenityIcon(amenity) {
  // Try exact match first, then partial match
  if (AMENITY_ICONS[amenity]) return AMENITY_ICONS[amenity];
  const key = Object.keys(AMENITY_ICONS).find(k => amenity.toLowerCase().includes(k.toLowerCase()));
  return key ? AMENITY_ICONS[key] : 'ph-thin ph-check-circle';
}


/* ────────────────────────────────────────────
   MOCK AUTH (localStorage-backed)
   ──────────────────────────────────────────── */
const MockAuth = {
  STORAGE_KEY: 'gnm_user',
  USERS_KEY: 'gnm_registered_users',

  _getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    } catch { return []; }
  },

  _saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch { return null; }
  },

  isLoggedIn() {
    return this.getUser() !== null;
  },

  /**
   * Log in user with phone/email and password.
   */
  login(identifier, password) {
    if (!identifier) throw new Error('Please enter your phone number or email.');
    if (!password) throw new Error('Please enter your password.');
    
    const cleanId = String(identifier).trim().toLowerCase();
    const users = this._getUsers();
    
    // Look for existing registered user or create a session user
    let user = users.find(u => 
      (u.phone && u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
      (u.email && u.email.toLowerCase() === cleanId)
    );

    if (!user) {
      // Auto-create session profile for mock demonstration
      const isEmail = cleanId.includes('@');
      user = {
        id: 'u-' + Date.now(),
        name: isEmail ? cleanId.split('@')[0] : 'Player ' + cleanId.slice(-4),
        phone: isEmail ? '0300-1234567' : cleanId,
        email: isEmail ? cleanId : '',
        created_at: new Date().toISOString()
      };
      users.push(user);
      this._saveUsers(users);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Register a new user.
   */
  register({ name, phone, email, password }) {
    if (!name || name.trim().length < 2) throw new Error('Please enter your full name.');
    if (!phone || phone.replace(/\D/g, '').length < 10) throw new Error('Please enter a valid Pakistan mobile number (e.g. 0300-1234567).');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');

    const cleanPhone = phone.trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this._getUsers();

    // Check duplicate
    const exists = users.some(u => 
      (u.phone && u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (exists) {
      throw new Error('An account with this phone number or email already exists. Please log in.');
    }

    const user = {
      id: 'u-' + Date.now(),
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      created_at: new Date().toISOString()
    };

    users.push(user);
    this._saveUsers(users);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Update profile information.
   */
  updateProfile({ name, phone, email }) {
    const user = this.getUser();
    if (!user) throw new Error('Not logged in');
    
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
      this._saveUsers(users);
    }

    return user;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Ensure a mock user exists for demo purposes.
   */
  ensureUser() {
    let user = this.getUser();
    if (!user) {
      user = {
        id: 'u-demo-1',
        name: 'Tariq Al-Mansoor',
        phone: '0312-5551234',
        email: 'tariq.cricket@gmail.com',
        created_at: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  }
};


/* ────────────────────────────────────────────
   MOCK BOOKING STORE (localStorage-backed)
   ──────────────────────────────────────────── */
const MockBookingStore = {
  STORAGE_KEY: 'gnm_bookings',

  _getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);

      // Default seed bookings for initial demo experience
      const user = MockAuth.ensureUser();
      const today = new Date();
      const nextGame = new Date(today);
      nextGame.setDate(today.getDate() + 2);
      const nextGameStr = nextGame.toISOString().split('T')[0];
      
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 5);
      const lastWeekStr = lastWeek.toISOString().split('T')[0];

      const initialSeeds = [
        {
          id: 'bk-seed-1',
          booking_ref: 'GNM-2026-X8K2M9',
          ground_id: 'g-001',
          player_id: user.id,
          booking_date: nextGameStr,
          start_time: '20:00:00',
          end_time: '21:00:00',
          duration_minutes: 60,
          contact_name: user.name,
          contact_phone: user.phone,
          notes: 'Tape ball',
          source: 'website',
          payment_status: 'unpaid',
          status: 'confirmed',
          price_per_hour: 2500,
          total_amount: 2500,
          currency: 'PKR',
          confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'bk-seed-2',
          booking_ref: 'GNM-2026-P4R7T1',
          ground_id: 'g-002',
          player_id: user.id,
          booking_date: lastWeekStr,
          start_time: '19:00:00',
          end_time: '20:00:00',
          duration_minutes: 60,
          contact_name: user.name,
          contact_phone: user.phone,
          notes: 'Weekend game',
          source: 'website',
          payment_status: 'paid',
          status: 'completed',
          price_per_hour: 3200,
          total_amount: 3200,
          currency: 'PKR',
          confirmed_at: lastWeek.toISOString(),
          created_at: lastWeek.toISOString()
        }
      ];
      this._saveAll(initialSeeds);
      return initialSeeds;
    } catch { return []; }
  },

  _saveAll(bookings) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
  },

  getBookingsForGroundDate(groundId, dateStr) {
    return this._getAll().filter(b => b.ground_id === groundId && b.booking_date === dateStr);
  },

  getPlayerBookings() {
    const user = MockAuth.getUser();
    return this._getAll()
      .filter(b => !user || b.player_id === user.id || b.player_id === 'guest')
      .sort((a, b) => {
        // Sort upcoming first, then by date descending
        if (a.booking_date > b.booking_date) return -1;
        if (a.booking_date < b.booking_date) return 1;
        return a.start_time.localeCompare(b.start_time);
      });
  },

  /**
   * Create a new booking. Returns the booking object with generated ref.
   */
  createBooking({ ground_id, booking_date, start_time, end_time, duration_minutes, price_per_hour, total_amount }) {
    const user = MockAuth.getUser();
    const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    const booking = {
      id: 'bk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      booking_ref: `GNM-2026-${randSuffix}`,
      ground_id,
      player_id: user ? user.id : 'guest',
      booking_date,
      start_time,
      end_time,
      duration_minutes: duration_minutes || 60,
      contact_name: user ? user.name : 'Guest Player',
      contact_phone: user ? user.phone : '',
      notes: '',
      source: 'website',
      payment_status: 'unpaid',
      status: 'confirmed',
      price_per_hour,
      total_amount,
      currency: 'PKR',
      confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const all = this._getAll();
    all.push(booking);
    this._saveAll(all);
    return booking;
  },

  /**
   * Cancel a booking by ID. Sets status to 'cancelled'.
   */
  cancelBooking(bookingId) {
    const all = this._getAll();
    const idx = all.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;
    all[idx].status = 'cancelled';
    this._saveAll(all);
    return true;
  },

  getBookingById(bookingId) {
    return this._getAll().find(b => b.id === bookingId) || null;
  }
};


/* ────────────────────────────────────────────
   MOCK SLOT STORE
   Generates 1-hour slots from 09:00 to 01:00
   (17 slots per day, matching owner dashboard)
   ──────────────────────────────────────────── */
const MockSlotStore = {
  /**
   * Generate slots for a given ground + date.
   * Checks localStorage bookings to determine booked slots.
   * @returns {{ time: string, endTime: string, label: string, status: 'available'|'booked' }[]}
   */
  getSlotsForDate(groundId, dateStr) {
    const bookedSlots = MockBookingStore.getBookingsForGroundDate(groundId, dateStr)
      .filter(b => b.status !== 'cancelled')
      .map(b => b.start_time.slice(0, 5));

    const slots = [];
    for (let h = 9; h < 26; h++) {
      const actualH = h % 24;
      const nextH = (h + 1) % 24;
      const time = `${String(actualH).padStart(2, '0')}:00`;
      const endTime = `${String(nextH).padStart(2, '0')}:00`;
      const label = MockSlotStore.formatTimeLabel(actualH) + ' – ' + MockSlotStore.formatTimeLabel(nextH);

      // Randomly pre-book some slots for demo realism (seed by ground+date+hour)
      const seed = MockSlotStore._hash(groundId + dateStr + h);
      const isPreBooked = (seed % 5 === 0); // ~20% slots pre-booked

      const isBooked = bookedSlots.includes(time) || isPreBooked;
      slots.push({ time: time + ':00', endTime: endTime + ':00', label, status: isBooked ? 'booked' : 'available' });
    }
    return slots;
  },

  formatTimeLabel(hour) {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
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


/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */

/**
 * Find a mock ground by ID or slug.
 */
function findMockGround(idOrSlug) {
  if (!idOrSlug) return MOCK_GROUNDS[0];
  const exact = MOCK_GROUNDS.find(g => g.id === idOrSlug || g.slug === idOrSlug || g.supabase_id === idOrSlug);
  if (exact) return exact;
  const fuzzy = MOCK_GROUNDS.find(g => 
    (g.slug && g.slug.toLowerCase() === idOrSlug.toLowerCase()) || 
    (g.name && g.name.toLowerCase().includes(idOrSlug.toLowerCase()))
  );
  return fuzzy || MOCK_GROUNDS[0];
}

/**
 * Format date string for display.
 */
function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Get today's date as YYYY-MM-DD.
 */
function getTodayStr() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Check if a date string is today or in the future.
 */
function isUpcoming(dateStr) {
  return dateStr >= getTodayStr();
}
