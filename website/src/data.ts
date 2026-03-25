import type { AppData, BantamsFeed, BantamsTeam, BantamsTeamFeed } from './types';

const BASE = 'data/';
const FEEDS_BASE = 'https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/feeds/';
const CALENDARS_BASE = 'https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/calendars/';
const BANTAMS_FEED_URL = `${FEEDS_BASE}clubs/east-leake.json`;
const INDEX_URL = `${FEEDS_BASE}index.json`;

export function teamFeedUrl(league: string, slug: string): string {
  return `${FEEDS_BASE}${league}/teams/${slug}.json`;
}

export function teamCalendarUrl(league: string, slug: string): string {
  return `${CALENDARS_BASE}${league}/${slug}.ics`;
}

export async function loadTeamFeed(league: string, slug: string): Promise<BantamsTeamFeed | null> {
  try {
    const res = await fetch(teamFeedUrl(league, slug));
    if (!res.ok) return null;
    return res.json() as Promise<BantamsTeamFeed>;
  } catch {
    return null;
  }
}

async function load<T>(file: string): Promise<T> {
  const res = await fetch(BASE + file);
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function loadBantamsFeed(): Promise<BantamsFeed | null> {
  try {
    const res = await fetch(BANTAMS_FEED_URL);
    if (!res.ok) return null;
    return res.json() as Promise<BantamsFeed>;
  } catch {
    return null;
  }
}

async function loadBantamsTeams(): Promise<BantamsTeam[]> {
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) return [];
    const data = await res.json() as { leagues: { slug: string; teams: { name: string; slug: string }[] }[] };
    const teams: BantamsTeam[] = [];
    for (const league of data.leagues) {
      for (const team of league.teams) {
        if (team.slug.startsWith('east-leake-bantams') || team.slug.startsWith('east-leake-white')) {
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
  const [club, teams, committee, registration, news, fixtures, gallery, matchday, bantamsFeed, bantamsTeams] =
    await Promise.all([
      load('club.json'),
      load('teams.json'),
      load('committee.json'),
      load('registration.json'),
      load('news.json'),
      load('fixtures.json'),
      load('gallery.json'),
      load('matchday.json'),
      loadBantamsFeed(),
      loadBantamsTeams(),
    ]);

  return { club, teams, committee, registration, news, fixtures, gallery, matchday, bantamsFeed, bantamsTeams } as AppData;
}
