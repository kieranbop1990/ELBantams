import type { AppData } from './types';

const BASE = 'data/';

async function load<T>(file: string): Promise<T> {
  const res = await fetch(BASE + file);
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadAllData(): Promise<AppData> {
  const [club, teams, committee, registration, news, fixtures, gallery, matchday] =
    await Promise.all([
      load('club.json'),
      load('teams.json'),
      load('committee.json'),
      load('registration.json'),
      load('news.json'),
      load('fixtures.json'),
      load('gallery.json'),
      load('matchday.json'),
    ]);

  return { club, teams, committee, registration, news, fixtures, gallery, matchday } as AppData;
}
