import type { LiveTeam, Team, TeamSection } from '../types';

/** Find the live team matching a direct slug. */
export function teamBySlug(liveTeams: LiveTeam[], slug: string): LiveTeam | null {
  // Use the same improved matching logic
  const matches = liveTeams.filter((t) => {
    const normalizeSlug = (s: string) => s.toLowerCase().replace(/_/g, '-').trim();
    const norm1 = normalizeSlug(t.slug);
    const norm2 = normalizeSlug(slug);
    return norm1 === norm2 || 
           norm2.endsWith(`-${norm1}`) || 
           norm1.endsWith(`-${norm2}`) ||
           norm2.includes(norm1) || 
           norm1.includes(norm2);
  });
  return matches[0] ?? null;
}

/** Find all live teams matching an "Under X" age group name. */
export function matchingTeamsByAge(liveTeams: LiveTeam[], teamName: string): LiveTeam[] {
  // Try to extract age from team name using various patterns
  const ageMatch = teamName.match(/(?:Under|U|u)\s*(\d+)/i);
  if (!ageMatch) return [];
  
  const age = ageMatch[1];
  
  // Try multiple age patterns in slug
  const agePatterns = [
    `-u${age}`,      // "-u13" (current pattern)
    `-under-${age}`, // "-under-13"
    `u${age}`,       // "u13"
    `under${age}`,   // "under13"
    `under-${age}`,  // "under-13"
  ];
  
  return liveTeams.filter((t) => {
    const normalizedSlug = t.slug.toLowerCase();
    return agePatterns.some(pattern => normalizedSlug.includes(pattern));
  });
}

/** Return all live teams that correspond to a config team entry. */
export function liveTeamsForTeam(team: Team, liveTeams: LiveTeam[]): LiveTeam[] {
  // Helper to normalize slugs for comparison
  const normalizeSlug = (slug: string): string => {
    return slug.toLowerCase().replace(/_/g, '-').trim();
  };

  // Helper to check if two slugs match with various strategies
  const slugsMatch = (slug1: string, slug2: string): boolean => {
    const norm1 = normalizeSlug(slug1);
    const norm2 = normalizeSlug(slug2);
    
    // 1. Exact normalized match
    if (norm1 === norm2) return true;
    
    // 2. Suffix match (e.g., "under-13-youth" vs "club-prefix-under-13-youth")
    if (norm2.endsWith(`-${norm1}`) || norm1.endsWith(`-${norm2}`)) return true;
    
    // 3. Contains match (e.g., "u13" vs "under-13-youth")
    if (norm2.includes(norm1) || norm1.includes(norm2)) return true;
    
    return false;
  };

  // 1. Try exact match first (original behavior)
  if (team.slug) {
    const exactMatches = liveTeams.filter((t) => t.slug === team.slug);
    if (exactMatches.length > 0) return exactMatches;
    
    // 2. Try normalized slug matching with multiple strategies
    const normalizedMatches = liveTeams.filter((t) => slugsMatch(t.slug, team.slug));
    if (normalizedMatches.length > 0) return normalizedMatches;
    
    // 3. Try matching by team name as fallback
    const nameMatches = liveTeams.filter((t) => 
      t.name.toLowerCase() === team.name.toLowerCase()
    );
    if (nameMatches.length > 0) return nameMatches;
    
    // 4. Even with slug, try age-based matching as last resort
    const ageMatches = matchingTeamsByAge(liveTeams, team.name);
    if (ageMatches.length > 0) return ageMatches;
  }
  
  // Fallback to age-based matching for teams without slugs
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