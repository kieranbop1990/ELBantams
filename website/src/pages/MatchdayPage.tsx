import { Title, Text, SimpleGrid, Paper, ThemeIcon, Group, Stack, Badge, Image } from '@mantine/core';
import type { Club, MatchdayItem } from '../types';
import { tablerIcon } from '../utils/icons';

interface Props {
  items: MatchdayItem[];
  club: Club;
}

export function MatchdayPage({ items, club }: Props) {
  const badges = club.matchdayBadges ?? [];
  const groundImage = club.groundImage;
  const groundImageAlt = club.groundImageAlt ?? `${club.name} — ground map`;

  return (
    <Stack gap="xl">
      <Title order={2}>Visitor &amp; Matchday Information</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {items.map((item, i) => (
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

      {badges.length > 0 && (
        <Group gap="xs">
          {badges.map((badge, i) => (
            <Badge key={i} color={badge.color} variant="light" size="lg">
              {badge.label}
            </Badge>
          ))}
        </Group>
      )}

      {groundImage && (
        <Image
          src={groundImage}
          alt={groundImageAlt}
          radius="md"
        />
      )}
    </Stack>
  );
}
