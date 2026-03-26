import type { AppData, ClubFeed, LiveTeam, TeamFeed, TeamsData } from './types';

const BASE = 'data/';
const FEEDS_BASE = 'https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/feeds/';
const CALENDARS_BASE = 'https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/calendars/';
const CLUB_FEED_URL = `${FEEDS_BASE}clubs/east-leake.json`;
const INDEX_URL = `${FEEDS_BASE}index.json`;

export function teamFeedUrl(league: string, slug: string): string {
  return `${FEEDS_BASE}${league}/teams/${slug}.json`;
}

export function teamCalendarUrl(league: string, slug: string): string {
  return `${CALENDARS_BASE}${league}/${slug}.ics`;
}

export async function loadTeamFeed(league: string, slug: string): Promise<TeamFeed | null> {
  try {
    const res = await fetch(teamFeedUrl(league, slug));
    if (!res.ok) return null;
    return res.json() as Promise<TeamFeed>;
  } catch {
    return null;
  }
}

async function load<T>(file: string): Promise<T> {
  const res = await fetch(BASE + file);
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function loadClubFeed(): Promise<ClubFeed | null> {
  try {
    const res = await fetch(CLUB_FEED_URL);
    if (!res.ok) return null;
    return res.json() as Promise<ClubFeed>;
  } catch {
    return null;
  }
}

async function loadLiveTeams(): Promise<LiveTeam[]> {
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) return [];
    const data = await res.json() as { leagues: { slug: string; teams: { name: string; slug: string }[] }[] };
    const teams: LiveTeam[] = [];
    for (const league of data.leagues) {
      for (const team of league.teams) {
        if (team.slug.startsWith('east-leake-')) {
          teams.push({ name: team.name, slug: team.slug, league: league.slug });
        }
      }
    }
    return teams;
  } catch {
    return [];
  }
}

export async function loadAllData(): Promise<AppData> {
  const [club, teams, committee, registration, news, gallery, matchday, clubFeed, liveTeams] =
    await Promise.all([
      load('club.json'),
      load('teams.json'),
      load('committee.json'),
      load('registration.json'),
      load('news.json'),
      load('gallery.json'),
      load('matchday.json'),
      loadClubFeed(),
      loadLiveTeams(),
    ]);

  const sidebarConfigs = (teams as TeamsData).sections
    .flatMap(s => s.teams.filter(t => t.sidebar && t.slug).map(t => ({ slug: t.slug!, label: t.name, sectionId: s.id })));

  const resolvedFeeds = await Promise.all(
    sidebarConfigs.map(async ({ slug, label, sectionId }) => {
      const team = (liveTeams as LiveTeam[]).find(t => t.slug === slug);
      if (!team) return null;
      const feed = await loadTeamFeed(team.league, team.slug);
      return feed ? { feed, label, sectionId } : null;
    })
  );
  const sidebarFeeds = resolvedFeeds.filter((f): f is { feed: TeamFeed; label: string; sectionId: string } => f !== null);

  return { club, teams, committee, registration, news, gallery, matchday, clubFeed, liveTeams, sidebarFeeds } as AppData;
}
