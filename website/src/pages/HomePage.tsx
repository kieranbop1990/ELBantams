import { Title, Text, Button, Group, SimpleGrid, Paper, ThemeIcon, Stack, Image } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { Club } from '../types';
import { tablerIcon } from '../utils/icons';

interface Props { club: Club }

export function HomePage({ club }: Props) {
  return (
    <Stack gap="xl">
      {/* Banner */}
      <Paper p="xl" radius="md" withBorder>
        <Group justify="space-between" align="center" wrap="wrap" gap="xl">
          <Stack gap="md" style={{ flex: 1, minWidth: 200 }}>
            <div>
              <Title order={1} c="var(--mantine-primary-color-filled)">{club.name}</Title>
              <Text size="lg" c="dimmed">{club.tagline}</Text>
            </div>
            {club.homeBanner ? (
              <Text dangerouslySetInnerHTML={{ __html: club.homeBanner }} />
            ) : (
              <Text>{club.tagline}</Text>
            )}
            <Group>
              <Button component={Link} to="/about" variant="outline">
                About Us
              </Button>
              <Button component={Link} to="/register">
                Register &amp; Pay
              </Button>
            </Group>
          </Stack>
          {club.badge && (
            <Image
              src={club.badge}
              alt={`${club.name} Badge`}
              w={160}
              h={160}
              fit="contain"
            />
          )}
        </Group>
      </Paper>

      {/* Features */}
      <div>
        <Title order={2} mb="md">Who We Are</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {club.about.map((item, i) => (
            <Paper key={i} p="md" radius="md" withBorder>
              <Group align="flex-start" gap="md" wrap="nowrap">
                <ThemeIcon variant="light" size="lg" radius="md">
                  {tablerIcon(item.icon)}
                </ThemeIcon>
                <div>
                  <Text fw={600} mb={4}>{item.title}</Text>
                  <Text size="sm" c="dimmed" dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
        <Group mt="md">
          <Button component={Link} to="/about" variant="outline">
            Read Our Full Story
          </Button>
        </Group>
      </div>
    </Stack>
  );
}
