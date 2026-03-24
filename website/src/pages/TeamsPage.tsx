import { Title, Text, SimpleGrid, Paper, Badge, Button, Group, Stack, Image, Center } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconCamera } from '@tabler/icons-react';
import type { TeamsData } from '../types';

interface Props { teams: TeamsData }

export function TeamsPage({ teams }: Props) {
  return (
    <Stack gap="xl">
      <Title order={2}>Our Teams</Title>

      {teams.sections.map((section, si) => (
        <div key={si}>
          <Group mb="md" align="center">
            <Text fw={700} size="lg">{section.name}</Text>
            <Badge color="orange" variant="light">{section.subtitle}</Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {section.teams.map((team, ti) => (
              <Paper key={ti} p="md" radius="md" withBorder>
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
                  <Button component={Link} to="/register" size="xs" color="orange">Register</Button>
                  <Button component={Link} to="/contact" size="xs" variant="outline" color="orange">Contact</Button>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </div>
      ))}
    </Stack>
  );
}
