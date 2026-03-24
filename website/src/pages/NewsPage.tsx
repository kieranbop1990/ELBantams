import { useState } from 'react';
import { Title, Text, SimpleGrid, Paper, Button, Stack, Collapse, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { NewsItem } from '../types';

interface Props { items: NewsItem[] }

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasBody = Boolean(item.body);

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="xs">
        <Text fw={700}>{item.title}</Text>
        <Text size="sm" c="dimmed">{item.text}</Text>

        {hasBody && (
          <>
            <Collapse in={expanded}>
              <Divider my="xs" />
              <Stack gap="xs">
                {item.body!.split('\n\n').map((para, i) => (
                  <Text key={i} size="sm">{para}</Text>
                ))}
              </Stack>
            </Collapse>

            <Button
              variant="subtle"
              color="orange"
              size="xs"
              onClick={() => setExpanded(e => !e)}
              rightSection={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              px={0}
              styles={{ root: { alignSelf: 'flex-start' } }}
            >
              {expanded ? 'Show Less' : item.linkText}
            </Button>
          </>
        )}

        {!hasBody && (
          <Button
            component="a"
            href={item.link}
            variant="outline"
            color="orange"
            size="xs"
            styles={{ root: { alignSelf: 'flex-start' } }}
          >
            {item.linkText}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export function NewsPage({ items }: Props) {
  return (
    <Stack gap="xl">
      <Title order={2}>Club News</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {items.map((item, i) => (
          <NewsCard key={i} item={item} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
