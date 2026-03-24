import { Title, Text, SimpleGrid, Paper, Image, Center, Stack } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import type { GalleryItem } from '../types';

interface Props { items: GalleryItem[] }

export function GalleryPage({ items }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">Gallery</Title>
        <Text c="dimmed">Photos coming soon — team photos, matchday action, club events and more.</Text>
      </div>

      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
        {items.map((item, i) => (
          <Paper key={i} radius="md" withBorder style={{ overflow: 'hidden' }}>
            {item.src ? (
              <>
                <Image src={item.src} alt={item.caption} h={160} fit="cover" />
                <Text size="xs" c="dimmed" p="xs" ta="center">{item.caption}</Text>
              </>
            ) : (
              <Center h={160} bg="gray.1">
                <Stack align="center" gap="xs">
                  <IconCamera size={32} color="gray" />
                  <Text size="xs" c="dimmed">{item.caption}</Text>
                </Stack>
              </Center>
            )}
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
