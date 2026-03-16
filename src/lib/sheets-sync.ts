/**
 * Google Sheets Sync Utility
 *
 * Fetches leaderboard data from a published Google Sheet CSV URL,
 * parses it, and upserts into the database.
 *
 * To publish a Google Sheet as CSV:
 * 1. Open your Google Sheet
 * 2. File > Share > Publish to web
 * 3. Select the sheet tab, choose CSV format
 * 4. Copy the URL
 *
 * Expected columns (case-insensitive, order doesn't matter):
 * player_name, team_name, handicap,
 * round_1_score, round_1_points, round_2_score, round_2_points,
 * round_3_score, round_3_points, round_4_score, round_4_points,
 * total_points, position
 *
 * For team leaderboard, use a separate sheet tab with:
 * team_name, round_1_points, round_2_points, round_3_points,
 * round_4_points, total_points, position
 */

interface SheetRow {
  [key: string]: string;
}

interface ParsedIndividual {
  player_name: string;
  team_name: string;
  handicap: number | null;
  round_1_score: number | null;
  round_1_points: number | null;
  round_2_score: number | null;
  round_2_points: number | null;
  round_3_score: number | null;
  round_3_points: number | null;
  round_4_score: number | null;
  round_4_points: number | null;
  total_points: number;
  position: number | null;
}

interface ParsedTeam {
  team_name: string;
  round_1_points: number | null;
  round_2_points: number | null;
  round_3_points: number | null;
  round_4_points: number | null;
  total_points: number;
  position: number | null;
}

function parseCSV(text: string): SheetRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows: SheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/['"]/g, ''));
    if (values.length < 2) continue;
    const row: SheetRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function toNum(val: string | undefined): number | null {
  if (!val || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function parseIndividualRows(csvText: string): ParsedIndividual[] {
  const rows = parseCSV(csvText);
  return rows
    .filter((r) => r.player_name || r.name)
    .map((r) => ({
      player_name: r.player_name || r.name || '',
      team_name: r.team_name || r.team || '',
      handicap: toNum(r.handicap),
      round_1_score: toNum(r.round_1_score || r.r1_score),
      round_1_points: toNum(r.round_1_points || r.r1_points),
      round_2_score: toNum(r.round_2_score || r.r2_score),
      round_2_points: toNum(r.round_2_points || r.r2_points),
      round_3_score: toNum(r.round_3_score || r.r3_score),
      round_3_points: toNum(r.round_3_points || r.r3_points),
      round_4_score: toNum(r.round_4_score || r.r4_score),
      round_4_points: toNum(r.round_4_points || r.r4_points),
      total_points: toNum(r.total_points || r.total) || 0,
      position: toNum(r.position || r.pos),
    }));
}

export function parseTeamRows(csvText: string): ParsedTeam[] {
  const rows = parseCSV(csvText);
  return rows
    .filter((r) => r.team_name || r.team)
    .map((r) => ({
      team_name: r.team_name || r.team || '',
      round_1_points: toNum(r.round_1_points || r.r1_points),
      round_2_points: toNum(r.round_2_points || r.r2_points),
      round_3_points: toNum(r.round_3_points || r.r3_points),
      round_4_points: toNum(r.round_4_points || r.r4_points),
      total_points: toNum(r.total_points || r.total) || 0,
      position: toNum(r.position || r.pos),
    }));
}

export async function fetchSheetCSV(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
