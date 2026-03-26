import { useState, useEffect } from 'react';
import { Tabs, Stack, Title, Text, Group, Button, Alert, Paper, Code } from '@mantine/core';
import {
  IconBuilding, IconUsers, IconId, IconNews,
  IconMapPin, IconCreditCard, IconPhoto, IconRefresh,
} from '@tabler/icons-react';
import type { AppData } from '../types';
import { loadFeeds } from '../data';
import { ClubForm } from '../components/customize/ClubForm';
import { TeamsForm } from '../components/customize/TeamsForm';
import { CommitteeForm } from '../components/customize/CommitteeForm';
import { NewsForm } from '../components/customize/NewsForm';
import { MatchdayForm } from '../components/customize/MatchdayForm';
import { RegistrationForm } from '../components/customize/RegistrationForm';
import { GalleryForm } from '../components/customize/GalleryForm';
import { ExportButton } from '../components/customize/ExportButton';

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

  // Initialise editing data on first mount if not already set
  useEffect(() => {
    if (!editingData) {
      onEditingChange(JSON.parse(JSON.stringify(originalData)));
    }
  }, []);

  // While editingData is being initialised, show nothing yet
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

  const resetPreview = () => {
    onResetPreview();
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2} mb="xs">Customise Your Club Site</Title>
        <Text c="dimmed" size="sm">
          Edit your club's details below, preview changes live, then export your configuration files.
        </Text>
      </div>

      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="wrap">
          <Group gap="sm">
            <ExportButton data={localData} />
            <Button
              variant="filled"
              onClick={applyPreview}
              loading={loadingFeeds}
            >
              Apply Preview
            </Button>
            {previewActive && (
              <Button variant="subtle" color="red" leftSection={<IconRefresh size={14} />} onClick={resetPreview}>
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
          <ClubForm club={localData.club} onChange={club => setLocalData(d => ({ ...d, club }))} />
        </Tabs.Panel>

        <Tabs.Panel value="teams" pt="md">
          <TeamsForm teams={localData.teams} onChange={teams => setLocalData(d => ({ ...d, teams }))} />
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

      <Alert title="How to deploy your site" variant="light">
        <Stack gap="xs">
          <Text size="sm">1. Click <strong>Export ZIP</strong> above to download your configuration</Text>
          <Text size="sm">2. Fork the repository on GitHub</Text>
          <Text size="sm">3. Replace the files in <Code>website/public/data/</Code> with the exported ones</Text>
          <Text size="sm">4. Add your images (badge, team photos) to <Code>website/public/images/</Code></Text>
          <Text size="sm">5. Go to Settings &gt; Pages &gt; Source: <strong>GitHub Actions</strong></Text>
          <Text size="sm">6. Push to <Code>main</Code> — your site deploys automatically!</Text>
        </Stack>
      </Alert>
    </Stack>
  );
}
