export interface MatchDefinition {
  id: string;
  round: number;
  roundLabel: string;
  course: string;
  format: string;
  teamA: string;
  teamB: string;
  favourite: 'a' | 'b' | 'even';
  line: number; // e.g. 1.5 means favourite -1.5, underdog +1.5
  slugPrefix: string;
  marketSlugs: {
    h2h: string;
    line: string;
    margin: string;
    totalA: string;
    totalB: string;
  };
}

export const MATCHES: MatchDefinition[] = [
  // Round 2
  {
    id: 'r2-m1',
    round: 2,
    roundLabel: 'Saturday AM',
    course: 'Lost Farm',
    format: '2v2 Match Play',
    teamA: 'Hugo and Bails',
    teamB: 'Jackson and Finn',
    favourite: 'b',
    line: 1.5,
    slugPrefix: 'r2-m1',
    marketSlugs: { h2h: 'r2-m1-h2h', line: 'r2-m1-line', margin: 'r2-m1-margin', totalA: 'r2-m1-hb-total', totalB: 'r2-m1-jf-total' },
  },
  {
    id: 'r2-m2',
    round: 2,
    roundLabel: 'Saturday AM',
    course: 'Lost Farm',
    format: '2v2 Match Play',
    teamA: 'Lewis and Jacob',
    teamB: 'Ando and McNaughton',
    favourite: 'a',
    line: 2.5,
    slugPrefix: 'r2-m2',
    marketSlugs: { h2h: 'r2-m2-h2h', line: 'r2-m2-line', margin: 'r2-m2-margin', totalA: 'r2-m2-lj-total', totalB: 'r2-m2-ah-total' },
  },
  {
    id: 'r2-m3',
    round: 2,
    roundLabel: 'Saturday AM',
    course: 'Lost Farm',
    format: '2v2 Match Play',
    teamA: 'Brad and Watto',
    teamB: 'Daniel and Parker',
    favourite: 'a',
    line: 2.5,
    slugPrefix: 'r2-m3',
    marketSlugs: { h2h: 'r2-m3-h2h', line: 'r2-m3-line', margin: 'r2-m3-margin', totalA: 'r2-m3-bg-total', totalB: 'r2-m3-dp-total' },
  },
  // Round 3
  {
    id: 'r3-m1',
    round: 3,
    roundLabel: 'Saturday PM',
    course: 'Bougle Run',
    format: '2v2 Scramble',
    teamA: 'Hugo and Bails',
    teamB: 'Daniel and Parker',
    favourite: 'a',
    line: 3.5,
    slugPrefix: 'r3-m1',
    marketSlugs: { h2h: 'r3-m1-h2h', line: 'r3-m1-line', margin: 'r3-m1-margin', totalA: 'r3-m1-hb-total', totalB: 'r3-m1-dp-total' },
  },
  {
    id: 'r3-m2',
    round: 3,
    roundLabel: 'Saturday PM',
    course: 'Bougle Run',
    format: '2v2 Scramble',
    teamA: 'Jackson and Finn',
    teamB: 'Brad and Watto',
    favourite: 'a',
    line: 2.5,
    slugPrefix: 'r3-m2',
    marketSlugs: { h2h: 'r3-m2-h2h', line: 'r3-m2-line', margin: 'r3-m2-margin', totalA: 'r3-m2-jf-total', totalB: 'r3-m2-bg-total' },
  },
  {
    id: 'r3-m3',
    round: 3,
    roundLabel: 'Saturday PM',
    course: 'Bougle Run',
    format: '2v2 Scramble',
    teamA: 'Lewis and Jacob',
    teamB: 'Ando and McNaughton',
    favourite: 'a',
    line: 3.5,
    slugPrefix: 'r3-m3',
    marketSlugs: { h2h: 'r3-m3-h2h', line: 'r3-m3-line', margin: 'r3-m3-margin', totalA: 'r3-m3-lj-total', totalB: 'r3-m3-ah-total' },
  },
  // Round 4
  {
    id: 'r4-hugo-jackson',
    round: 4,
    roundLabel: 'Sunday',
    course: 'Barnbougle Dunes',
    format: '1v1 Match Play',
    teamA: 'Hugo',
    teamB: 'Jackson',
    favourite: 'b',
    line: 1.5,
    slugPrefix: 'r4-hugo-jacko',
    marketSlugs: { h2h: 'r4-hugo-jacko-h2h', line: 'r4-hugo-jacko-line', margin: 'r4-hugo-jacko-margin', totalA: 'r4-hugo-total', totalB: 'r4-jacko-total' },
  },
  {
    id: 'r4-lewis-bails',
    round: 4,
    roundLabel: 'Sunday',
    course: 'Barnbougle Dunes',
    format: '1v1 Match Play',
    teamA: 'Lewis',
    teamB: 'Bails',
    favourite: 'a',
    line: 2.5,
    slugPrefix: 'r4-lewis-bails',
    marketSlugs: { h2h: 'r4-lewis-bails-h2h', line: 'r4-lewis-bails-line', margin: 'r4-lewis-bails-margin', totalA: 'r4-lewis-total', totalB: 'r4-bails-total' },
  },
  {
    id: 'r4-finn-jacob',
    round: 4,
    roundLabel: 'Sunday',
    course: 'Barnbougle Dunes',
    format: '1v1 Match Play',
    teamA: 'Jacob',
    teamB: 'Finn',
    favourite: 'even',
    line: 1.5,
    slugPrefix: 'r4-finn-jacob',
    marketSlugs: { h2h: 'r4-finn-jacob-h2h', line: 'r4-finn-jacob-line', margin: 'r4-finn-jacob-margin', totalA: 'r4-jacob-total', totalB: 'r4-finn-total' },
  },
  {
    id: 'r4-ando-daniel',
    round: 4,
    roundLabel: 'Sunday',
    course: 'Barnbougle Dunes',
    format: '1v1 Match Play',
    teamA: 'Ando',
    teamB: 'Daniel',
    favourite: 'a',
    line: 1.5,
    slugPrefix: 'r4-ando-daniel',
    marketSlugs: { h2h: 'r4-ando-daniel-h2h', line: 'r4-ando-daniel-line', margin: 'r4-ando-daniel-margin', totalA: 'r4-ando-total', totalB: 'r4-daniel-total' },
  },
  {
    id: 'r4-brad-parker',
    round: 4,
    roundLabel: 'Sunday',
    course: 'Barnbougle Dunes',
    format: '1v1 Match Play',
    teamA: 'Brad',
    teamB: 'Parker',
    favourite: 'a',
    line: 2.5,
    slugPrefix: 'r4-brad-parker',
    marketSlugs: { h2h: 'r4-brad-parker-h2h', line: 'r4-brad-parker-line', margin: 'r4-brad-parker-margin', totalA: 'r4-brad-total', totalB: 'r4-parker-total' },
  },
  {
    id: 'r4-horny-general',
    round: 4,
    roundLabel: 'Sunday',
    course: 'Barnbougle Dunes',
    format: '1v1 Match Play',
    teamA: 'Watto',
    teamB: 'McNaughton',
    favourite: 'b',
    line: 1.5,
    slugPrefix: 'r4-horny-general',
    marketSlugs: { h2h: 'r4-horny-general-h2h', line: 'r4-horny-general-line', margin: 'r4-horny-general-margin', totalA: 'r4-general-total', totalB: 'r4-horny-total' },
  },
];
