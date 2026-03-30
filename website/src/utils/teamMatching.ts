import type { LiveTeam, Team, TeamSection } from '../types';

/** Find the live team matching a direct slug. */
export function teamBySlug(liveTeams: LiveTeam[], slug: string): LiveTeam | null {
  return liveTeams.find((t) => t.slug === slug) ?? null;
}

/** Find all live teams matching an "Under X" age group name. */
export function matchingTeamsByAge(liveTeams: LiveTeam[], teamName: string): LiveTeam[] {
  const m = teamName.match(/Under\s+(\d+)/i);
  if (!m) return [];
  const tag = `-u${m[1]}`.toLowerCase();
  return liveTeams.filter((t) => t.slug.includes(tag));
}

/** Return all live teams that correspond to a config team entry. */
export function liveTeamsForTeam(team: Team, liveTeams: LiveTeam[]): LiveTeam[] {
  if (team.slug) {
    // When a slug matches multiple leagues, return all matches (not just the first)
    const matches = liveTeams.filter((t) => t.slug === team.slug);
    return matches.length > 0 ? matches : [];
  }
  return matchingTeamsByAge(liveTeams, team.name);
}

/** Return all live teams that belong to a section. */
export function liveTeamsForSection(section: TeamSection, liveTeams: LiveTeam[]): LiveTeam[] {
  return section.teams.flatMap((t) => liveTeamsForTeam(t, liveTeams));
}

/** Build a league-qualified slug for use as a unique key / URL segment. */
export function leagueQualifiedSlug(team: LiveTeam): string {
  return `${team.league}/${team.slug}`;
}

/** Detect team names that appear in more than one league. */
export function findDuplicateTeamNames(teams: LiveTeam[]): Set<string> {
  const seen = new Map<string, string>(); // name -> first league
  const dupes = new Set<string>();
  for (const t of teams) {
    const prev = seen.get(t.name);
    if (prev !== undefined && prev !== t.league) {
      dupes.add(t.name);
    } else if (prev === undefined) {
      seen.set(t.name, t.league);
    }
  }
  return dupes;
}

/**
 * Extract a short day label from a league slug.
 * e.g. "yel-east-midlands-saturday-25-26" → "Saturday"
 */
function dayLabelFromLeague(league: string): string {
  if (/saturday/i.test(league)) return 'Saturday';
  if (/sunday/i.test(league)) return 'Sunday';
  // Fallback: use the league slug itself (trimmed)
  return league;
}

/** Human-readable label, with day suffix when the name is duplicated. */
export function teamDisplayLabel(
  name: string,
  league: string,
  duplicateNames: Set<string>,
): string {
  if (!duplicateNames.has(name)) return name;
  return `${name} (${dayLabelFromLeague(league)})`;
}
