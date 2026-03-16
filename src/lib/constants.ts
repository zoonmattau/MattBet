export const TRIP_NAME = "MattBet";
export const TRIP_SUBTITLE = 'The lads are hitting the links. Markets are open. Place your bets.';

export const CATEGORIES = {
  outrights: 'Outrights',
  stableford: 'Friday Stableford',
  score_totals: 'Score Totals',
  novelty: 'Novelty Bets',
  match_play: 'Match Play',
  trip_specials: 'Trip Specials',
} as const;

export const CATEGORY_ORDER: (keyof typeof CATEGORIES)[] = [
  'outrights',
  'stableford',
  'score_totals',
  'match_play',
  'novelty',
  'trip_specials',
];

export const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  suspended: 'Suspended',
  settled: 'Settled',
  void: 'Void',
};

export const BET_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  won: 'Won',
  lost: 'Lost',
  void: 'Void',
};

export const ROUNDS = [
  {
    number: 1,
    day: 'Friday',
    course: 'Barnbougle Dunes',
    teeTime: '1:30pm',
    format: 'Individual Stableford',
    description: 'All 12 players compete individually. Points for finishing position.',
    points: '1st: 6pts, 2nd: 5pts, 3rd: 4pts, 4th: 3pts, 5th: 2pts, 6th: 2pts, 7th: 1pt, 8th: 1pt, 9th-12th: 0pts',
    maxPoints: 24,
  },
  {
    number: 2,
    day: 'Saturday AM',
    course: 'Lost Farm',
    teeTime: '8:30am',
    format: '2v2 Match Play',
    description: '3 matches. Each team has a pair in each match.',
    points: 'Win: 6pts + 0.5 per hole. Halved: 3pts. Lose: 0pts.',
    maxPoints: 18,
  },
  {
    number: 3,
    day: 'Saturday PM',
    course: 'Bougle Run (Short Course)',
    teeTime: '3:00pm',
    format: '2v2 Scramble (Ambrose)',
    description: '14-hole short course. Best ball scramble. Same match structure as R2.',
    points: 'Win: 6pts + 0.5 per hole. Halved: 3pts. Lose: 0pts.',
    maxPoints: 18,
  },
  {
    number: 4,
    day: 'Sunday',
    course: 'Barnbougle Dunes',
    teeTime: '8:00am',
    format: '1v1 Match Play',
    description: '6 individual head-to-head matches.',
    points: 'Win: 4pts + 0.5 per hole. Halved: 2pts. Lose: 0pts.',
    maxPoints: 24,
  },
];

export const ITINERARY = [
  {
    day: 'Friday 3rd April',
    label: 'Day 1',
    events: [
      { time: '9:40am', detail: 'Fly Melbourne to Launceston (VA 1362)' },
      { time: '11:10am', detail: 'Transfer to Barnbougle Dunes' },
      { time: '1:30pm', detail: 'Round 1 -- Barnbougle Dunes (Stableford)' },
      { time: '2:00pm', detail: 'Check in -- Lost Farm Lodge' },
      { time: '7:30pm', detail: 'Dinner -- The Lodge Restaurant, Lost Farm' },
    ],
  },
  {
    day: 'Saturday 4th April',
    label: 'Day 2',
    events: [
      { time: '8:30am', detail: 'Round 2 -- Lost Farm (2v2 Match Play)' },
      { time: '3:00pm', detail: 'Round 3 -- Bougle Run Short Course (2v2 Scramble)' },
      { time: '7:30pm', detail: 'Dinner -- The Lodge Restaurant, Lost Farm' },
    ],
  },
  {
    day: 'Sunday 5th April',
    label: 'Day 3',
    events: [
      { time: '10:00am', detail: 'Check out -- Lost Farm Lodge' },
      { time: '8:00am', detail: 'Round 4 -- Barnbougle Dunes (1v1 Match Play)' },
      { time: '1:45pm', detail: 'Transfer to Launceston Airport' },
      { time: '4:45pm', detail: 'Fly Launceston to Melbourne (VA 1373)' },
    ],
  },
];

export const MATCH_STRUCTURE = {
  round2: {
    label: 'Round 2 -- 2v2 Match Play (Lost Farm)',
    matches: [
      { desc: 'Hugo and Bails vs Jackson and Finn' },
      { desc: 'Ando and McNaughton vs Lewis and Jacob' },
      { desc: 'Daniel and Parker vs Brad and Watto' },
    ],
  },
  round3: {
    label: 'Round 3 -- 2v2 Scramble (Bougle Run)',
    matches: [
      { desc: 'Hugo and Bails vs Daniel and Parker' },
      { desc: 'Jackson and Finn vs Brad and Watto' },
      { desc: 'Lewis and Jacob vs Ando and McNaughton' },
    ],
  },
  round4: {
    label: 'Round 4 -- 1v1 Match Play (Barnbougle Dunes)',
    matches: [
      { desc: 'Hugo vs Jackson' },
      { desc: 'Lewis vs Bails' },
      { desc: 'Finn vs Jacob' },
      { desc: 'Ando vs Daniel' },
      { desc: 'Brad vs Parker' },
      { desc: 'McNaughton vs Watto' },
    ],
  },
};

export const SEED_TEAMS = [
  { name: 'Group 1', players: ['Watto', 'Brad', 'Bails', 'Hugo'] },
  { name: 'Group 2', players: ['Finn', 'Ando', 'Jackson', 'McNaughton'] },
  { name: 'Group 3', players: ['Daniel', 'Jacob', 'Lewis', 'Parker'] },
];

export const HANDICAPS: Record<string, number> = {
  Parker: 22,
  Daniel: 20,
  Jacob: 9,
  Lewis: 9,
  Jackson: 14,
  McNaughton: 18,
  Hugo: 15,
  Bails: 14,
  Brad: 15,
  Watto: 21,
  Finn: 10,
  Ando: 15,
};
