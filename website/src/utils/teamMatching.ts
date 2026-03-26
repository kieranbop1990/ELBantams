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
    const match = teamBySlug(liveTeams, team.slug);
    return match ? [match] : [];
  }
  return matchingTeamsByAge(liveTeams, team.name);
}

/** Return all live teams that belong to a section. */
export function liveTeamsForSection(section: TeamSection, liveTeams: LiveTeam[]): LiveTeam[] {
  return section.teams.flatMap((t) => liveTeamsForTeam(t, liveTeams));
}
