import { TextInput, Textarea, Stack, Group, Title, Paper, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { NewsItem } from '../../types';

interface Props {
  news: NewsItem[];
  onChange: (news: NewsItem[]) => void;
}

export function NewsForm({ news, onChange }: Props) {
  const updateItem = (index: number, field: keyof NewsItem, value: string | string[]) => {
    const items = [...news];
    items[index] = { ...items[index], [field]: value };
    onChange(items);
  };

  const addItem = () =>
    onChange([...news, { title: '', text: '', link: '#', linkText: 'Read More' }]);

  const removeItem = (i: number) =>
    onChange(news.filter((_, idx) => idx !== i));

  return (
    <Stack gap="lg">
      <Title order={4}>News Articles</Title>
      {news.map((item, i) => (
        <Paper key={i} p="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>{item.title || `Article ${i + 1}`}</Text>
            <Button size="compact-xs" variant="subtle" color="red" onClick={() => removeItem(i)} leftSection={<IconTrash size={12} />}>Remove</Button>
          </Group>
          <Stack gap="xs">
            <TextInput label="Title" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
            <Textarea label="Summary" description="Short preview text" value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} minRows={2} />
            <Textarea label="Full Body" description="Optional — expands on click. Use blank lines for paragraphs." value={item.body ?? ''} onChange={e => updateItem(i, 'body', e.target.value)} minRows={4} />
            <Group grow>
              <TextInput label="Link" value={item.link} onChange={e => updateItem(i, 'link', e.target.value)} />
              <TextInput label="Link Text" value={item.linkText} onChange={e => updateItem(i, 'linkText', e.target.value)} />
            </Group>
          </Stack>
        </Paper>
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addItem}>Add Article</Button>
    </Stack>
  );
}
