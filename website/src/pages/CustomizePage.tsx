import { useState, useEffect } from 'react';
import { Tabs, Stack, Title, Text, Group, Button, Paper } from '@mantine/core';
import {
  IconBuilding, IconUsers, IconId, IconNews,
  IconMapPin, IconCreditCard, IconPhoto, IconRefresh,
} from '@tabler/icons-react';
import type { AppData } from '../types';
import { loadFeeds, loadClubSlugs, loadAllFeedTeams } from '../data';
import type { FeedTeamEntry } from '../data';
import { ClubForm } from '../components/customize/ClubForm';
import { TeamsForm } from '../components/customize/TeamsForm';
import { CommitteeForm } from '../components/customize/CommitteeForm';
import { NewsForm } from '../components/customize/NewsForm';
import { MatchdayForm } from '../components/customize/MatchdayForm';
import { RegistrationForm } from '../components/customize/RegistrationForm';
import { GalleryForm } from '../components/customize/GalleryForm';
import { SaveButton } from '../components/customize/SaveButton';

interface Props {
  originalData: AppData;
  editingData: AppData | null;
  onEditingChange: (data: AppData) => void;
  onApplyPreview: (data: AppData) => void;
  onResetPreview: () => void;
  previewActive: boolean;
}

export function CustomizePage({
  originalData,
  editingData,
  onEditingChange,
  onApplyPreview,
  onResetPreview,
  previewActive,
}: Props) {
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [clubSlugs, setClubSlugs] = useState<string[]>([]);
  const [feedTeams, setFeedTeams] = useState<FeedTeamEntry[]>([]);

  useEffect(() => {
    if (!editingData) {
      onEditingChange(JSON.parse(JSON.stringify(originalData)));
    }
    loadClubSlugs().then(setClubSlugs);
    loadAllFeedTeams().then(setFeedTeams);
  }, []);

  if (!editingData) return null;

  const localData = editingData;
  const setLocalData = (updater: AppData | ((prev: AppData) => AppData)) => {
    const next = typeof updater === 'function' ? updater(editingData) : updater;
    onEditingChange(next);
  };

  const applyPreview = async () => {
    const slugsChanged =
      localData.club.clubFeedSlug !== originalData.club.clubFeedSlug ||
      localData.club.teamSlugPrefix !== originalData.club.teamSlugPrefix ||
      JSON.stringify(localData.teams.sections.map(s => s.teams.map(t => t.slug))) !==
      JSON.stringify(originalData.teams.sections.map(s => s.teams.map(t => t.slug)));

    if (slugsChanged) {
      setLoadingFeeds(true);
      try {
        const feeds = await loadFeeds(localData.club, localData.teams);
        const merged = { ...localData, ...feeds };
        onEditingChange(merged);
        onApplyPreview(merged);
      } finally {
        setLoadingFeeds(false);
      }
    } else {
      onApplyPreview(localData);
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2} mb="xs">Site Admin</Title>
        <Text c="dimmed" size="sm">
          Edit your club's details below. Preview changes live, then save to publish.
        </Text>
      </div>

      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="wrap">
          <Group gap="sm">
            <SaveButton data={localData} />
            <Button
              variant="light"
              onClick={applyPreview}
              loading={loadingFeeds}
            >
              Apply Preview
            </Button>
            {previewActive && (
              <Button variant="subtle" color="red" leftSection={<IconRefresh size={14} />} onClick={onResetPreview}>
                Reset
              </Button>
            )}
          </Group>
          {previewActive && (
            <Text size="xs" c="green" fw={600}>Preview active — navigate to other pages to see your changes</Text>
          )}
        </Group>
      </Paper>

      <Tabs defaultValue="club">
        <Tabs.List>
          <Tabs.Tab value="club" leftSection={<IconBuilding size={14} />}>Club</Tabs.Tab>
          <Tabs.Tab value="teams" leftSection={<IconUsers size={14} />}>Teams</Tabs.Tab>
          <Tabs.Tab value="committee" leftSection={<IconId size={14} />}>Committee</Tabs.Tab>
          <Tabs.Tab value="news" leftSection={<IconNews size={14} />}>News</Tabs.Tab>
          <Tabs.Tab value="matchday" leftSection={<IconMapPin size={14} />}>Matchday</Tabs.Tab>
          <Tabs.Tab value="registration" leftSection={<IconCreditCard size={14} />}>Registration</Tabs.Tab>
          <Tabs.Tab value="gallery" leftSection={<IconPhoto size={14} />}>Gallery</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="club" pt="md">
          <ClubForm club={localData.club} onChange={club => setLocalData(d => ({ ...d, club }))} clubSlugs={clubSlugs} />
        </Tabs.Panel>

        <Tabs.Panel value="teams" pt="md">
          <TeamsForm teams={localData.teams} onChange={teams => setLocalData(d => ({ ...d, teams }))} feedTeams={feedTeams} teamSlugPrefix={localData.club.teamSlugPrefix} />
        </Tabs.Panel>

        <Tabs.Panel value="committee" pt="md">
          <CommitteeForm committee={localData.committee} onChange={committee => setLocalData(d => ({ ...d, committee }))} />
        </Tabs.Panel>

        <Tabs.Panel value="news" pt="md">
          <NewsForm news={localData.news} onChange={news => setLocalData(d => ({ ...d, news }))} />
        </Tabs.Panel>

        <Tabs.Panel value="matchday" pt="md">
          <MatchdayForm matchday={localData.matchday} onChange={matchday => setLocalData(d => ({ ...d, matchday }))} />
        </Tabs.Panel>

        <Tabs.Panel value="registration" pt="md">
          <RegistrationForm registration={localData.registration} onChange={registration => setLocalData(d => ({ ...d, registration }))} />
        </Tabs.Panel>

        <Tabs.Panel value="gallery" pt="md">
          <GalleryForm gallery={localData.gallery} onChange={gallery => setLocalData(d => ({ ...d, gallery }))} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
