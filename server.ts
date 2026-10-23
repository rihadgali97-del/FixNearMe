import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_BEARER_TOKEN = process.env.ADMIN_BEARER_TOKEN || 'bdu-admin-2026';

app.use(express.json({ limit: '10mb' }));

// Types
export interface TimelineUpdate {
  id: string;
  timestamp: string;
  action: 'created' | 'status_change' | 'priority_change' | 'confirmed' | 'note_added' | 'merged' | 'resolved';
  fromStatus?: string;
  toStatus?: string;
  note: string;
  author: string;
  resolutionEvidence?: string;
}

export interface ProblemReport {
  id: string;
  title: string;
  category: 'road_damage' | 'streetlight' | 'water_leak' | 'drainage' | 'waste' | 'sidewalk' | 'other';
  description: string;
  neighborhood: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  status: 'reported' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  confirmationsCount: number;
  confirmedBy: string[]; // IP or client UUID list
  resolutionNote?: string;
  resolutionEvidence?: string;
  internalNote?: string;
  isDuplicate?: boolean;
  canonicalId?: string;
  updates: TimelineUpdate[];
}

// Initial Seed Data for Bahir Dar City
let reports: ProblemReport[] = [
  {
    id: 'REP-2026-001',
    title: 'Burst Water Main Flooding Street near Tana Hotel',
    category: 'water_leak',
    description: 'A pressurized clean water distribution pipe ruptured early this morning. Water is spilling onto the roadway and eroding the asphalt edge near the main roundabout.',
    neighborhood: 'Kebele 03',
    landmark: '50m south of Tana Hotel Roundabout, opposite commercial bank branch',
    latitude: 11.5985,
    longitude: 37.3872,
    status: 'in_progress',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    confirmationsCount: 19,
    confirmedBy: ['demo-client-1', 'demo-client-2'],
    internalNote: 'Dispatched Bahir Dar Water & Sewerage Service utility crew. Isolation valve closed.',
    updates: [
      {
        id: 'UPD-001-1',
        timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Report submitted by neighborhood resident via FixNearMe.',
        author: 'Resident'
      },
      {
        id: 'UPD-001-2',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        action: 'status_change',
        fromStatus: 'reported',
        toStatus: 'under_review',
        note: 'Verified by Kebele 03 emergency liaison officer.',
        author: 'Municipality Admin'
      },
      {
        id: 'UPD-001-3',
        timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
        action: 'status_change',
        fromStatus: 'under_review',
        toStatus: 'in_progress',
        note: 'Technicians on site excavating trench to replace 4-inch ductile iron elbow.',
        author: 'Water Utility Dispatch'
      }
    ]
  },
  {
    id: 'REP-2026-002',
    title: 'Dark Intersection: Multiple Streetlights Out at Poly Campus Gate',
    category: 'streetlight',
    description: 'Four consecutive solar/grid streetlights along the student crossing near Bahir Dar Institute of Technology main gate have been non-functional for 3 nights, posing safety concerns for night students.',
    neighborhood: 'Poly Campus',
    landmark: 'Directly in front of BiT Main Pedestrian Gate, Poly Road',
    latitude: 11.5831,
    longitude: 37.3995,
    status: 'under_review',
    priority: 'high',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    confirmationsCount: 34,
    confirmedBy: ['demo-client-3'],
    internalNote: 'Inspected by Ethiopian Electric Utility (EEU) field unit. Breaker tripped due to loose underground cable.',
    updates: [
      {
        id: 'UPD-002-1',
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Student Union safety rep logged issue.',
        author: 'Resident'
      },
      {
        id: 'UPD-002-2',
        timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
        action: 'priority_change',
        note: 'Priority escalated to High due to student evening transit volume.',
        author: 'City Infrastructure Dept'
      }
    ]
  },
  {
    id: 'REP-2026-003',
    title: 'Severe Deep Pothole Damaging Vehicles near Papyrus Hotel',
    category: 'road_damage',
    description: 'A 40cm wide, 15cm deep pothole in the right vehicular lane has developed after heavy transport truck passage. Two bajajs suffered suspension damage yesterday.',
    neighborhood: 'Belay Zeleke',
    landmark: 'Adjacent to Papyrus Hotel entrance, southbound corridor',
    latitude: 11.5932,
    longitude: 37.3911,
    status: 'reported',
    priority: 'high',
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    confirmationsCount: 12,
    confirmedBy: [],
    updates: [
      {
        id: 'UPD-003-1',
        timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Initial report submitted with photographic evidence.',
        author: 'Resident'
      }
    ]
  },
  {
    id: 'REP-2026-004',
    title: 'Blocked Storm Drainage Channel Causing Mud Accumulation',
    category: 'drainage',
    description: 'Culvert is heavily silted and clogged with plastic containers and debris. Storm runoff is beginning to back up towards local vegetable stalls.',
    neighborhood: 'Shimbit',
    landmark: 'Shimbit Local Market entrance ditch, near St. George Church bypass',
    latitude: 11.5898,
    longitude: 37.3779,
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date(Date.now() - 120 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
    confirmationsCount: 22,
    confirmedBy: ['demo-client-4'],
    resolutionNote: 'Kebele sanitation squad cleared 40 meters of concrete culvert. Flow restored and silt traps installed.',
    resolutionEvidence: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    updates: [
      {
        id: 'UPD-004-1',
        timestamp: new Date(Date.now() - 120 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Reported by local market committee chair.',
        author: 'Resident'
      },
      {
        id: 'UPD-004-2',
        timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
        action: 'status_change',
        fromStatus: 'reported',
        toStatus: 'in_progress',
        note: 'Scheduled with community sanitation weekend work crew.',
        author: 'Municipality Admin'
      },
      {
        id: 'UPD-004-3',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        action: 'resolved',
        fromStatus: 'in_progress',
        toStatus: 'resolved',
        note: 'Work completed. Inspected and approved by district health officer.',
        author: 'Sanitation Inspector',
        resolutionEvidence: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'REP-2026-005',
    title: 'Overflowing Municipal Waste Skips Attracting Stray Animals',
    category: 'waste',
    description: 'The pair of metal communal waste containers are overflowing onto the gravel walkway. Trash has remained uncollected for 5 days.',
    neighborhood: 'Fasilo',
    landmark: 'Behind Fasilo Stadium West Bleachers, near public kindergarten',
    latitude: 11.5794,
    longitude: 37.3855,
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 70 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    confirmationsCount: 15,
    confirmedBy: [],
    internalNote: 'Compactor truck mechanical issue delayed route. Scheduled for collection today 2 PM.',
    updates: [
      {
        id: 'UPD-005-1',
        timestamp: new Date(Date.now() - 70 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Resident complaint registered with photos.',
        author: 'Resident'
      },
      {
        id: 'UPD-005-2',
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        action: 'status_change',
        fromStatus: 'reported',
        toStatus: 'in_progress',
        note: 'Solid Waste Management Agency assigned skip replacement vehicle.',
        author: 'Municipality Admin'
      }
    ]
  },
  {
    id: 'REP-2026-006',
    title: 'Broken Paver Slabs on Pedestrian Promenade',
    category: 'sidewalk',
    description: 'Cracked concrete paving tiles and trip hazard on the lakeside promenade frequented by families and evening joggers.',
    neighborhood: 'Tana Waterfront',
    landmark: 'Lakeside promenade path, 100m west of Blue Nile boat departure pier',
    latitude: 11.6031,
    longitude: 37.3822,
    status: 'reported',
    priority: 'low',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    photoUrl: null,
    confirmationsCount: 7,
    confirmedBy: [],
    updates: [
      {
        id: 'UPD-006-1',
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Reported by local runner.',
        author: 'Resident'
      }
    ]
  },
  {
    id: 'REP-2026-007',
    title: 'Exposed Electrical Junction Wire at Bridge Pedestrian Path',
    category: 'streetlight',
    description: 'An open metal service panel on an illumination pole has exposed 220V wires hanging within reach of pedestrians walking across the bridge.',
    neighborhood: 'Gish Abay',
    landmark: 'Old Abay River Bridge walkway, southern approach tower',
    latitude: 11.5645,
    longitude: 37.4042,
    status: 'under_review',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    confirmationsCount: 28,
    confirmedBy: [],
    internalNote: 'High safety risk. EEU emergency dispatch notified via phone dispatch #8821.',
    updates: [
      {
        id: 'UPD-007-1',
        timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
        action: 'created',
        toStatus: 'reported',
        note: 'Urgent hazard reported by daily commuter.',
        author: 'Resident'
      },
      {
        id: 'UPD-007-2',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        action: 'status_change',
        fromStatus: 'reported',
        toStatus: 'under_review',
        note: 'Flagged as high priority hazard for immediate technician dispatch.',
        author: 'Municipality Admin'
      }
    ]
  }
];

// Helper: Check admin authorization
function checkAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Valid administrator Bearer token required.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  // Allow configured token or default demo token
  if (token !== ADMIN_BEARER_TOKEN && token !== 'bdu-admin-2026' && token !== 'demo-admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid administrator credentials. Please check your admin passkey.'
    });
    return;
  }

  next();
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'FixNearMe API',
    city: 'Bahir Dar, Ethiopia',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'healthy (in-memory persistent)'
  });
});

// 2. GET /api/dashboard/stats
app.get('/api/dashboard/stats', (_req, res) => {
  const totalReports = reports.length;
  const unresolvedReports = reports.filter(r => ['reported', 'under_review', 'in_progress'].includes(r.status)).length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const rejectedReports = reports.filter(r => r.status === 'rejected').length;
  const urgentReports = reports.filter(r => r.priority === 'urgent' && r.status !== 'resolved').length;

  const categoryCounts: Record<string, number> = {};
  const neighborhoodCounts: Record<string, number> = {};

  reports.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    neighborhoodCounts[r.neighborhood] = (neighborhoodCounts[r.neighborhood] || 0) + 1;
  });

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      neighborhood: r.neighborhood,
      landmark: r.landmark,
      status: r.status,
      priority: r.priority,
      createdAt: r.createdAt,
      confirmationsCount: r.confirmationsCount,
      photoUrl: r.photoUrl
    }));

  res.json({
    totalReports,
    unresolvedReports,
    inProgressReports,
    resolvedReports,
    rejectedReports,
    urgentReports,
    categoryCounts,
    neighborhoodCounts,
    recentReports
  });
});

// 3. GET /api/reports
app.get('/api/reports', (req, res) => {
  const {
    search,
    category,
    status,
    priority,
    neighborhood,
    page = '1',
    limit = '10',
    sort = 'newest'
  } = req.query as Record<string, string | undefined>;

  let filtered = [...reports];

  // Search filter: title, description, neighborhood, landmark
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.neighborhood.toLowerCase().includes(q) ||
      (r.landmark && r.landmark.toLowerCase().includes(q))
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter(r => r.category === category);
  }

  // Filter by status
  if (status && status !== 'all') {
    filtered = filtered.filter(r => r.status === status);
  }

  // Filter by priority
  if (priority && priority !== 'all') {
    filtered = filtered.filter(r => r.priority === priority);
  }

  // Filter by neighborhood
  if (neighborhood && neighborhood !== 'all') {
    filtered = filtered.filter(r => r.neighborhood.toLowerCase() === neighborhood.toLowerCase());
  }

  // Sorting
  if (sort === 'priority') {
    const pRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => (pRank[b.priority] || 0) - (pRank[a.priority] || 0));
  } else if (sort === 'confirmations') {
    filtered.sort((a, b) => b.confirmationsCount - a.confirmationsCount);
  } else if (sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    // default: newest
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  // Return public report representation (omit internalNote)
  const publicReports = paginated.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    neighborhood: r.neighborhood,
    landmark: r.landmark,
    latitude: r.latitude,
    longitude: r.longitude,
    status: r.status,
    priority: r.priority,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    photoUrl: r.photoUrl,
    confirmationsCount: r.confirmationsCount,
    resolutionNote: r.resolutionNote,
    resolutionEvidence: r.resolutionEvidence,
    isDuplicate: r.isDuplicate,
    canonicalId: r.canonicalId
  }));

  res.json({
    reports: publicReports,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages
  });
});

// 4. POST /api/reports/check-duplicates
app.post('/api/reports/check-duplicates', (req, res) => {
  const { title = '', category = '', neighborhood = '', description = '' } = req.body;

  if (!title && !category && !neighborhood) {
    res.json({ duplicates: [] });
    return;
  }

  const titleWords = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const descWords = description.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const searchWords = new Set([...titleWords, ...descWords]);

  const candidates = reports.filter(r => {
    // Only check unresolved reports for duplication
    if (r.status === 'resolved' || r.status === 'rejected') return false;

    let score = 0;
    // Same category adds 3 points
    if (category && r.category === category) score += 3;
    // Same neighborhood adds 3 points
    if (neighborhood && r.neighborhood.toLowerCase() === neighborhood.toLowerCase()) score += 3;

    // Word matching
    const targetText = (r.title + ' ' + r.description + ' ' + (r.landmark || '')).toLowerCase();
    searchWords.forEach(w => {
      if (targetText.includes(w)) score += 2;
    });

    return score >= 5;
  });

  const duplicates = candidates.slice(0, 3).map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    neighborhood: r.neighborhood,
    landmark: r.landmark,
    status: r.status,
    createdAt: r.createdAt,
    confirmationsCount: r.confirmationsCount,
    photoUrl: r.photoUrl
  }));

  res.json({ duplicates });
});

// 5. POST /api/reports
app.post('/api/reports', (req, res) => {
  const {
    title,
    category,
    description,
    neighborhood,
    landmark,
    latitude,
    longitude,
    photoUrl
  } = req.body;

  const errors: Record<string, string> = {};

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long.';
  } else if (title.trim().length > 120) {
    errors.title = 'Title must not exceed 120 characters.';
  }

  const validCategories = ['road_damage', 'streetlight', 'water_leak', 'drainage', 'waste', 'sidewalk', 'other'];
  if (!category || !validCategories.includes(category)) {
    errors.category = 'Please select a valid problem category.';
  }

  if (!description || typeof description !== 'string' || description.trim().length < 15) {
    errors.description = 'Description must be at least 15 characters to explain the problem clearly.';
  }

  if (!neighborhood || typeof neighborhood !== 'string' || neighborhood.trim().length < 2) {
    errors.neighborhood = 'Neighborhood / Kebele is required.';
  }

  if (!landmark || typeof landmark !== 'string' || landmark.trim().length < 3) {
    errors.landmark = 'A nearby landmark or reference is required to help crews locate the problem.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      error: 'Validation Failed',
      message: 'Please resolve the highlighted form errors.',
      fields: errors
    });
    return;
  }

  const nextNum = reports.length + 1;
  const newId = `REP-2026-${String(nextNum).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newReport: ProblemReport = {
    id: newId,
    title: title.trim(),
    category,
    description: description.trim(),
    neighborhood: neighborhood.trim(),
    landmark: landmark.trim(),
    latitude: typeof latitude === 'number' && !isNaN(latitude) ? latitude : null,
    longitude: typeof longitude === 'number' && !isNaN(longitude) ? longitude : null,
    status: 'reported',
    priority: 'medium', // Default initial priority until admin triage
    createdAt: now,
    updatedAt: now,
    photoUrl: photoUrl || null,
    confirmationsCount: 1, // Submitter is 1st confirmation
    confirmedBy: [],
    updates: [
      {
        id: `UPD-${newId}-1`,
        timestamp: now,
        action: 'created',
        toStatus: 'reported',
        note: 'Report submitted by resident and queued for municipal review.',
        author: 'Resident'
      }
    ]
  };

  reports.unshift(newReport);

  res.status(201).json({
    success: true,
    message: 'Problem report recorded successfully! Municipal authorities have been notified.',
    report: {
      id: newReport.id,
      title: newReport.title,
      category: newReport.category,
      neighborhood: newReport.neighborhood,
      status: newReport.status,
      createdAt: newReport.createdAt
    }
  });
});

// 6. GET /api/reports/:id
app.get('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    res.status(404).json({
      error: 'Not Found',
      message: `Report with ID "${req.params.id}" could not be found.`
    });
    return;
  }

  // Public representation (hide internalNote)
  const { internalNote, confirmedBy, ...publicReport } = report;
  res.json({
    report: publicReport
  });
});

// 7. GET /api/reports/:id/updates
app.get('/api/reports/:id/updates', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    res.status(404).json({
      error: 'Not Found',
      message: `Report with ID "${req.params.id}" not found.`
    });
    return;
  }

  res.json({
    reportId: report.id,
    updates: report.updates
  });
});

// 8. POST /api/reports/:id/confirm
app.post('/api/reports/:id/confirm', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    res.status(404).json({
      error: 'Not Found',
      message: `Report "${req.params.id}" not found.`
    });
    return;
  }

  const clientId = req.body.clientId || req.ip || 'anonymous-client';

  if (report.confirmedBy.includes(clientId)) {
    res.status(409).json({
      error: 'Already Confirmed',
      message: 'You have already confirmed this problem report from your device.',
      alreadyConfirmed: true,
      confirmationsCount: report.confirmationsCount
    });
    return;
  }

  report.confirmedBy.push(clientId);
  report.confirmationsCount += 1;
  report.updatedAt = new Date().toISOString();

  // If confirmations reach notable milestone, auto-escalate priority if currently low
  if (report.confirmationsCount >= 10 && report.priority === 'low') {
    report.priority = 'medium';
  } else if (report.confirmationsCount >= 25 && report.priority === 'medium') {
    report.priority = 'high';
  }

  res.json({
    success: true,
    message: 'Problem confirmed! Higher confirmation numbers help the municipality prioritize urgent fixes.',
    confirmationsCount: report.confirmationsCount
  });
});

// 9. GET /api/admin/reports
app.get('/api/admin/reports', checkAdminAuth, (req, res) => {
  const { status, priority, category, search } = req.query as Record<string, string | undefined>;
  let result = [...reports];

  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }
  if (priority && priority !== 'all') {
    result = result.filter(r => r.priority === priority);
  }
  if (category && category !== 'all') {
    result = result.filter(r => r.category === category);
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    result = result.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.neighborhood.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    reports: result,
    total: result.length
  });
});

// 10. PATCH /api/admin/reports/:id
app.patch('/api/admin/reports/:id', checkAdminAuth, (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  const { status, priority, resolutionNote, resolutionEvidence, internalNote, statusNote } = req.body;
  const now = new Date().toISOString();

  const prevStatus = report.status;
  const prevPriority = report.priority;

  if (status && ['reported', 'under_review', 'in_progress', 'resolved', 'rejected'].includes(status)) {
    report.status = status;
  }

  if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
    report.priority = priority;
  }

  if (internalNote !== undefined) {
    report.internalNote = internalNote;
  }

  if (resolutionNote !== undefined) {
    report.resolutionNote = resolutionNote;
  }

  if (resolutionEvidence !== undefined) {
    report.resolutionEvidence = resolutionEvidence;
  }

  report.updatedAt = now;

  // Add timeline record if status or resolution changed
  if (status && status !== prevStatus) {
    report.updates.push({
      id: `UPD-${report.id}-${report.updates.length + 1}`,
      timestamp: now,
      action: status === 'resolved' ? 'resolved' : 'status_change',
      fromStatus: prevStatus,
      toStatus: status,
      note: statusNote || resolutionNote || `Status updated from ${prevStatus} to ${status} by municipality admin.`,
      author: 'City Administration',
      resolutionEvidence: status === 'resolved' ? (resolutionEvidence || report.resolutionEvidence) : undefined
    });
  } else if (priority && priority !== prevPriority) {
    report.updates.push({
      id: `UPD-${report.id}-${report.updates.length + 1}`,
      timestamp: now,
      action: 'priority_change',
      note: `Priority changed from ${prevPriority} to ${priority}.`,
      author: 'City Administration'
    });
  } else if (resolutionNote || internalNote) {
    report.updates.push({
      id: `UPD-${report.id}-${report.updates.length + 1}`,
      timestamp: now,
      action: 'note_added',
      note: resolutionNote || 'Administrative notes updated.',
      author: 'City Administration'
    });
  }

  res.json({
    success: true,
    message: `Report ${report.id} updated successfully.`,
    report
  });
});

// 11. POST /api/admin/reports/:id/merge
app.post('/api/admin/reports/:id/merge', checkAdminAuth, (req, res) => {
  const sourceReport = reports.find(r => r.id === req.params.id);
  const { canonicalId, reason = 'Duplicate problem report' } = req.body;

  if (!sourceReport) {
    res.status(404).json({ error: 'Source report not found' });
    return;
  }

  const targetReport = reports.find(r => r.id === canonicalId);
  if (!targetReport) {
    res.status(404).json({ error: `Canonical target report #${canonicalId} not found.` });
    return;
  }

  if (sourceReport.id === targetReport.id) {
    res.status(400).json({ error: 'Cannot merge a report into itself.' });
    return;
  }

  const now = new Date().toISOString();

  // Mark source report as duplicate
  sourceReport.isDuplicate = true;
  sourceReport.canonicalId = targetReport.id;
  sourceReport.status = 'rejected';
  sourceReport.updatedAt = now;
  sourceReport.updates.push({
    id: `UPD-${sourceReport.id}-${sourceReport.updates.length + 1}`,
    timestamp: now,
    action: 'merged',
    note: `Marked as duplicate and merged into primary report ${targetReport.id}: ${reason}`,
    author: 'City Administration'
  });

  // Transfer confirmation votes to target report
  targetReport.confirmationsCount += sourceReport.confirmationsCount;
  targetReport.updates.push({
    id: `UPD-${targetReport.id}-${targetReport.updates.length + 1}`,
    timestamp: now,
    action: 'merged',
    note: `Consolidated duplicate report ${sourceReport.id} (${sourceReport.confirmationsCount} confirmation votes added).`,
    author: 'City Administration'
  });

  res.json({
    success: true,
    message: `Successfully merged ${sourceReport.id} into primary report ${targetReport.id}.`,
    sourceReport,
    targetReport
  });
});

// -----------------------------------------------------------------------------
// Dev & Production Vite Middleware Setup
// -----------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[FixNearMe] Full-stack Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FixNearMe] Failed to start server:', err);
});
