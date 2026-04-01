import type { AppData, Club, ClubFeed, CommitteeData, GalleryItem, LiveTeam, MatchdayItem, NewsItem, RegistrationItem, TeamFeed, TeamsData } from './types';

const BASE = 'data/';
const FEEDS_BASE = 'https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/feeds/';
const CALENDARS_BASE = 'https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/calendars/';
const INDEX_URL = `${FEEDS_BASE}index.json`;
const CLUBS_API_URL = 'https://api.github.com/repos/adamsuk/fulltimeCalendar/contents/feeds/clubs';

export interface FeedTeamEntry {
  name: string;
  slug: string;
  league: string;
}

/** Fetch the list of available club feed slugs from the clubs directory. */
export async function loadClubSlugs(): Promise<string[]> {
  try {
    const res = await fetch(CLUBS_API_URL);
    if (!res.ok) return [];
    const files = await res.json() as { name: string }[];
    return files
      .filter(f => f.name.endsWith('.json'))
      .map(f => f.name.replace('.json', ''))
      .sort();
  } catch {
    return [];
  }
}

async function loadFeedTeams(slugPrefix?: string): Promise<FeedTeamEntry[]> {
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) return [];
    const data = await res.json() as { leagues: { slug: string; teams: { name: string; slug: string }[] }[] };
    const teams: FeedTeamEntry[] = [];
    for (const league of data.leagues) {
      for (const team of league.teams) {
        if (!slugPrefix || team.slug.startsWith(slugPrefix)) {
          teams.push({ name: team.name, slug: team.slug, league: league.slug });
        }
      }
    }
    return teams;
  } catch {
    return [];
  }
}

/** Fetch the full feed index — every team across all leagues. */
export async function loadAllFeedTeams(): Promise<FeedTeamEntry[]> {
  return loadFeedTeams();
}

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

async function loadClubFeed(feedSlug: string): Promise<ClubFeed | null> {
  try {
    const res = await fetch(`${FEEDS_BASE}clubs/${feedSlug}.json`);
    if (!res.ok) return null;
    return res.json() as Promise<ClubFeed>;
  } catch {
    return null;
  }
}

/** Fetch live feeds (club feed, live teams, sidebar feeds) for a given club + teams config. */
export async function loadFeeds(
  club: Club,
  teams: TeamsData,
): Promise<Pick<AppData, 'clubFeed' | 'liveTeams' | 'sidebarFeeds'>> {
  const feedSlug = club.clubFeedSlug ?? '';
  const teamSlugPrefix = club.teamSlugPrefix ?? `${feedSlug}-`;

  const [clubFeed, liveTeams] = await Promise.all([
    loadClubFeed(feedSlug),
    loadFeedTeams(teamSlugPrefix),
  ]);

  const sidebarConfigs = teams.sections
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

  return { clubFeed, liveTeams, sidebarFeeds };
}

async function loadNewsFromApi(): Promise<NewsItem[] | null> {
  try {
    const res = await fetch('/api/news');
    if (!res.ok) return null;
    const data = await res.json() as { items: NewsItem[] };
    return data.items?.length ? data.items : null;
  } catch {
    return null;
  }
}

async function loadCommitteeFromApi(): Promise<CommitteeData | null> {
  try {
    const res = await fetch('/api/committee');
    if (!res.ok) return null;
    const data = await res.json() as { items: CommitteeData['committee'] };
    return data.items?.length ? { committee: data.items } : null;
  } catch {
    return null;
  }
}

async function loadTeamsFromApi(): Promise<TeamsData | null> {
  try {
    const res = await fetch('/api/teams');
    if (!res.ok) return null;
    const { sections: rawSections, teams: rawTeams } = await res.json() as {
      sections: Array<{ id: string; sectionKey: string; name: string; subtitle: string; icon: string; logo: string | null; sortOrder: number }>;
      teams: Array<{ id: string; sectionId: string; name: string; description: string; manager: string; coach: string; contact: string; photo: string | null; slug: string | null; sidebar: number; managerLabel: string | null; coachLabel: string | null; sortOrder: number }>;
    };
    if (!rawSections?.length) return null;
    return {
      sections: rawSections
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(s => ({
          id: s.sectionKey,
          name: s.name,
          subtitle: s.subtitle,
          icon: s.icon,
          logo: s.logo ?? undefined,
          teams: rawTeams
            .filter(t => t.sectionId === s.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(t => ({
              name: t.name,
              description: t.description,
              manager: t.manager,
              coach: t.coach,
              contact: t.contact,
              photo: t.photo ?? undefined,
              slug: t.slug ?? undefined,
              sidebar: t.sidebar === 1,
              managerLabel: t.managerLabel ?? undefined,
              coachLabel: t.coachLabel ?? undefined,
            })),
        })),
    };
  } catch {
    return null;
  }
}

export async function loadAllData(): Promise<AppData> {
  // Load club config first so we can derive external feed URLs from it
  const club = await load<Club>('club.json');

  const [teamsFromApi, committeeFromApi, newsFromApi, registration, gallery, matchday] =
    await Promise.all([
      loadTeamsFromApi(),
      loadCommitteeFromApi(),
      loadNewsFromApi(),
      load<{ items: RegistrationItem[] }>('registration.json').then(d => d.items),
      load<{ items: GalleryItem[] }>('gallery.json').then(d => d.items),
      load<{ items: MatchdayItem[] }>('matchday.json').then(d => d.items),
    ]);

  // Fall back to static JSON if the DB is empty or unavailable
  const teams = teamsFromApi ?? await load<TeamsData>('teams.json');
  const committee = committeeFromApi ?? await load<CommitteeData>('committee.json');
  const news = newsFromApi ?? await load<{ items: NewsItem[] }>('news.json').then(d => d.items);

  const feeds = await loadFeeds(club, teams);

  return { club, teams, committee, registration, news, gallery, matchday, ...feeds } as AppData;
}
