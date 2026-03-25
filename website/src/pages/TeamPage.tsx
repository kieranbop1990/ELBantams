import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Title, Text, Stack, Paper, Badge, Group, Tabs, Table,
  Alert, Loader, Center, Button, Tooltip, CopyButton,
} from '@mantine/core';
import { IconCalendar, IconTrophy, IconAlertCircle, IconCopy, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import type { BantamsTeam, BantamsTeamFeed } from '../types';
import { loadTeamFeed, teamCalendarUrl } from '../data';

interface Props {
  bantamsTeams: BantamsTeam[];
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function TeamPage({ bantamsTeams }: Props) {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [feed, setFeed] = useState<BantamsTeamFeed | null | undefined>(undefined);

  const teamMeta = bantamsTeams.find((t) => t.slug === teamSlug);

  useEffect(() => {
    if (!teamMeta) { setFeed(null); return; }
    setFeed(undefined);
    loadTeamFeed(teamMeta.league, teamMeta.slug).then(setFeed);
  }, [teamMeta]);

  if (!teamMeta) {
    return (
      <Stack gap="md">
        <Button component={Link} to="/teams" variant="subtle" color="orange" leftSection={<IconArrowLeft size={14} />} w="fit-content">
          All Teams
        </Button>
        <Alert icon={<IconAlertCircle size={16} />} color="orange">Team not found.</Alert>
      </Stack>
    );
  }

  const calendarUrl = teamCalendarUrl(teamMeta.league, teamMeta.slug);

  return (
    <Stack gap="md">
      <Button component={Link} to="/teams" variant="subtle" color="orange" leftSection={<IconArrowLeft size={14} />} w="fit-content">
        All Teams
      </Button>

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Title order={2}>{teamMeta.name}</Title>
        <CopyButton value={calendarUrl} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied!' : 'Copy calendar link'} withArrow>
              <Button
                size="sm"
                variant="outline"
                color={copied ? 'teal' : 'orange'}
                leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                onClick={copy}
              >
                {copied ? 'Link copied!' : 'Copy calendar link'}
              </Button>
            </Tooltip>
          )}
        </CopyButton>
      </Group>

      <Text size="xs" c="dimmed">
        Paste the copied link into Google Calendar, Apple Calendar, or Outlook to subscribe.
      </Text>

      {feed === undefined ? (
        <Center py="xl"><Loader color="orange" /></Center>
      ) : feed === null ? (
        <Alert icon={<IconAlertCircle size={16} />} color="orange">
          Fixture data is currently unavailable. Please check back later.
        </Alert>
      ) : (
        <Tabs defaultValue="fixtures" color="orange">
          <Tabs.List>
            <Tabs.Tab value="fixtures" leftSection={<IconCalendar size={14} />}>
              Fixtures ({feed.fixtures.length})
            </Tabs.Tab>
            <Tabs.Tab value="results" leftSection={<IconTrophy size={14} />}>
              Results ({feed.results.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="fixtures" pt="md">
            {feed.fixtures.length === 0 ? (
              <Text c="dimmed" size="sm">No upcoming fixtures.</Text>
            ) : (
              <Stack gap="xs">
                {[...feed.fixtures]
                  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .map((f) => (
                    <Paper key={f.id} p="sm" withBorder radius="md">
                      <Group justify="space-between" wrap="wrap" gap="xs" mb={4}>
                        <Badge color="orange" variant="light" size="xs">{f.division}</Badge>
                        <Text size="xs" c="dimmed">{formatDate(f.date)} · {f.time}</Text>
                      </Group>
                      <Text fw={700} size="sm" ta="center">
                        {f.home_team} vs {f.away_team}
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">{f.venue}</Text>
                    </Paper>
                  ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="results" pt="md">
            {feed.results.length === 0 ? (
              <Text c="dimmed" size="sm">No results yet.</Text>
            ) : (
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Home</Table.Th>
                    <Table.Th ta="center">Score</Table.Th>
                    <Table.Th>Away</Table.Th>
                    <Table.Th visibleFrom="sm">Division</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[...feed.results]
                    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
                    .map((r) => (
                      <Table.Tr key={r.id}>
                        <Table.Td><Text size="xs">{formatDate(r.date)}</Text></Table.Td>
                        <Table.Td><Text size="sm">{r.home_team}</Text></Table.Td>
                        <Table.Td ta="center">
                          <Text size="sm" fw={700}>
                            {r.home_score ?? 'X'} - {r.away_score ?? 'X'}
                          </Text>
                        </Table.Td>
                        <Table.Td><Text size="sm">{r.away_team}</Text></Table.Td>
                        <Table.Td visibleFrom="sm">
                          <Text size="xs" c="dimmed">{r.division}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </Stack>
  );
}
