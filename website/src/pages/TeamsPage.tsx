import { Title, Text, SimpleGrid, Paper, Badge, Button, Group, Stack, Image, Center, Divider } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconCamera, IconCalendar } from '@tabler/icons-react';
import type { TeamsData, LiveTeam } from '../types';
import { useSection } from '../context/SectionContext';
import { liveTeamsForTeam } from '../utils/teamMatching';

interface Props {
  teams: TeamsData;
  liveTeams: LiveTeam[];
}

function TeamCard({ team, liveTeams }: { team: Props['teams']['sections'][0]['teams'][0]; liveTeams: LiveTeam[] }) {
  return (
    <Paper p="md" radius="md" withBorder>
      {team.photo ? (
        <Image src={team.photo} alt={team.name} radius="sm" mb="sm" h={160} fit="cover" />
      ) : (
        <Center h={160} mb="sm" bg="gray.1" style={{ borderRadius: 8 }}>
          <Stack align="center" gap="xs">
            <IconCamera size={32} color="gray" />
            <Text size="xs" c="dimmed">Team Photo</Text>
          </Stack>
        </Center>
      )}

      <Text fw={700} mb={4}>{team.name}</Text>
      <Text size="sm" c="dimmed" mb="sm">{team.description}</Text>

      <Text size="xs" c="dimmed">
        <strong>{team.managerLabel ?? 'Manager'}:</strong> {team.manager}
      </Text>
      <Text size="xs" c="dimmed" mb="sm">
        <strong>{team.coachLabel ?? 'Coach'}:</strong> {team.coach}
      </Text>

      <Group gap="xs">
        <Button component={Link} to="/register" size="xs">Register</Button>
        <Button component={Link} to="/contact" size="xs" variant="outline">Contact</Button>
        {liveTeams.length === 1 &&
          <Button
            component={Link}
            to={`/teams/${liveTeams[0].slug}`}
            size="xs"
            variant="light"
                       leftSection={<IconCalendar size={12} />}
          >
            Results & Fixtures
          </Button>
        }
      </Group>

      {liveTeams.length > 1 &&
        <>
          <Divider my="sm" />
          <Text size="xs" c="dimmed" mb="xs" fw={600}>Live teams</Text>
          <Stack gap={4}>
            {liveTeams.map((lt) => (
              <Button
                key={lt.slug}
                component={Link}
                to={`/teams/${lt.slug}`}
                size="xs"
                variant="light"
                               leftSection={<IconCalendar size={12} />}
                fullWidth
              >
                {lt.name}
              </Button>
            ))}
          </Stack>
        </>
      }
    </Paper>
  );
}

export function TeamsPage({ teams, liveTeams }: Props) {
  const { activeSection } = useSection();
  const visibleSections = teams.sections.filter(
    s => activeSection === 'all' || s.id === activeSection
  );

  return (
    <Stack gap="xl">
      <Title order={2}>Our Teams</Title>

      {visibleSections.map((section, si) => (
        <div key={si}>
          <Group mb="md" align="center">
            <Text fw={700} size="lg">{section.name}</Text>
            <Badge variant="light">{section.subtitle}</Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {section.teams.map((team, ti) => (
              <TeamCard key={ti} team={team} liveTeams={liveTeamsForTeam(team, liveTeams)} />
            ))}
          </SimpleGrid>
        </div>
      ))}
    </Stack>
  );
}
