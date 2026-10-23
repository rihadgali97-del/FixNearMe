export const CATEGORIES = {
  road_damage: {
    id: 'road_damage',
    label: 'Road Damage & Potholes',
    amharicLabel: 'የመንገድ ብልሽት እና ጉድጓድ',
    shortLabel: 'Road Damage',
    color: 'amber',
    icon: 'AlertTriangle',
    description: 'Potholes, cracked asphalt, missing manhole covers, asphalt erosion'
  },
  streetlight: {
    id: 'streetlight',
    label: 'Streetlight & Electrical',
    amharicLabel: 'የመንገድ መብራት እና ኤሌክትሪክ',
    shortLabel: 'Streetlight',
    color: 'yellow',
    icon: 'Lightbulb',
    description: 'Out streetlights, exposed live cables, broken light poles'
  },
  water_leak: {
    id: 'water_leak',
    label: 'Water Pipe Burst & Leak',
    amharicLabel: 'የውሃ ቧንቧ ፍሳሽ',
    shortLabel: 'Water Leak',
    color: 'cyan',
    icon: 'Droplets',
    description: 'Ruptured distribution pipes, leaking public fountains, water main breaks'
  },
  drainage: {
    id: 'drainage',
    label: 'Drainage & Culvert Blockage',
    amharicLabel: 'የፍሳሽ ቦይ መዘጋት',
    shortLabel: 'Drainage',
    color: 'blue',
    icon: 'Waves',
    description: 'Silted roadside ditches, blocked stormwater culverts, flood risks'
  },
  waste: {
    id: 'waste',
    label: 'Waste & Overflowing Bins',
    amharicLabel: 'የቆሻሻ ክምችት እና ማጠራቀሚያ',
    shortLabel: 'Waste / Sanitation',
    color: 'emerald',
    icon: 'Trash2',
    description: 'Overflowing skips, illegal dumping, uncollected community waste'
  },
  sidewalk: {
    id: 'sidewalk',
    label: 'Sidewalk & Pedestrian Path',
    amharicLabel: 'የእግረኛ መንገድ ብልሽት',
    shortLabel: 'Sidewalk',
    color: 'orange',
    icon: 'Footprints',
    description: 'Broken paving tiles, open trenches across walkways, tripping hazards'
  },
  other: {
    id: 'other',
    label: 'Other Public Infrastructure',
    amharicLabel: 'ሌላ የህዝብ አገልግሎት',
    shortLabel: 'Other Issue',
    color: 'slate',
    icon: 'HelpCircle',
    description: 'Fallen trees, damaged public signs, park benches, boundary issues'
  }
};

export const STATUS_META = {
  reported: {
    id: 'reported',
    label: 'Reported',
    amharicLabel: 'ተመዝግቧል',
    color: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
    dotColor: 'bg-sky-500',
    description: 'Awaiting initial municipal review'
  },
  under_review: {
    id: 'under_review',
    label: 'Under Review',
    amharicLabel: 'በግምገማ ላይ',
    color: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
    dotColor: 'bg-purple-500',
    description: 'Assigned to field liaison officer'
  },
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    amharicLabel: 'በሥራ ላይ',
    color: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    dotColor: 'bg-amber-500 animate-pulse',
    description: 'Crews or technicians actively addressing problem'
  },
  resolved: {
    id: 'resolved',
    label: 'Resolved',
    amharicLabel: 'ተፈትቷል',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20',
    dotColor: 'bg-emerald-500',
    description: 'Repairs completed and verified'
  },
  rejected: {
    id: 'rejected',
    label: 'Closed / Duplicate',
    amharicLabel: 'ተዘግቷል / የተደገመ',
    color: 'bg-zinc-100 text-zinc-700 border-zinc-200 ring-zinc-500/20',
    dotColor: 'bg-zinc-400',
    description: 'Closed, duplicate, or out of scope'
  }
};

export const PRIORITY_META = {
  low: {
    id: 'low',
    label: 'Low Priority',
    amharicLabel: 'ዝቅተኛ',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeClass: 'text-slate-600 bg-slate-100 border-slate-200'
  },
  medium: {
    id: 'medium',
    label: 'Medium Priority',
    amharicLabel: 'መካከለኛ',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  high: {
    id: 'high',
    label: 'High Priority',
    amharicLabel: 'ከፍተኛ',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200'
  },
  urgent: {
    id: 'urgent',
    label: 'Urgent Priority',
    amharicLabel: 'አስቸኳይ',
    color: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/20',
    badgeClass: 'text-rose-800 bg-rose-50 border-rose-200 font-semibold'
  }
};
