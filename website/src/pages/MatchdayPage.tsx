import { Title, Text, SimpleGrid, Paper, ThemeIcon, Group, Stack, Badge, Image } from '@mantine/core';
import type { MatchdayItem } from '../types';
import { tablerIcon } from '../utils/icons';

interface Props { items: MatchdayItem[] }

export function MatchdayPage({ items }: Props) {
  return (
    <Stack gap="xl">
      <Title order={2}>Visitor &amp; Matchday Information</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {items.map((item, i) => (
          <Paper key={i} p="md" radius="md" withBorder>
            <Group align="flex-start" gap="md" wrap="nowrap">
              <ThemeIcon color="orange" variant="light" size="lg" radius="md">
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

      <Group gap="xs">
        <Badge color="orange" variant="light" size="lg">FA Charter Standard</Badge>
        <Badge color="blue" variant="light" size="lg">FA Respect</Badge>
        <Badge color="pink" variant="light" size="lg">Proud For All</Badge>
      </Group>

      <Image
        src="images/details.jpeg"
        alt="East Leake FC — Visitor information, pitch layout and ground map"
        radius="md"
      />
    </Stack>
  );
}
