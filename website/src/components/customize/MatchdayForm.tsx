import { TextInput, Textarea, Select, Stack, Group, Title, Paper, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { MatchdayItem } from '../../types';
import { ICON_OPTIONS } from './iconOptions';

interface Props {
  matchday: MatchdayItem[];
  onChange: (matchday: MatchdayItem[]) => void;
}

export function MatchdayForm({ matchday, onChange }: Props) {
  const updateItem = (index: number, field: keyof MatchdayItem, value: string) => {
    const items = [...matchday];
    items[index] = { ...items[index], [field]: value };
    onChange(items);
  };

  const addItem = () =>
    onChange([...matchday, { icon: 'fa-info-circle', title: '', text: '' }]);

  const removeItem = (i: number) =>
    onChange(matchday.filter((_, idx) => idx !== i));

  return (
    <Stack gap="lg">
      <Title order={4}>Matchday Information</Title>
      {matchday.map((item, i) => (
        <Paper key={i} p="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>{item.title || `Item ${i + 1}`}</Text>
            <Button size="compact-xs" variant="subtle" color="red" onClick={() => removeItem(i)} leftSection={<IconTrash size={12} />}>Remove</Button>
          </Group>
          <Stack gap="xs">
            <Group grow>
              <Select label="Icon" data={ICON_OPTIONS} value={item.icon} onChange={v => updateItem(i, 'icon', v ?? 'fa-info-circle')} searchable />
              <TextInput label="Title" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
            </Group>
            <Textarea label="Text" description="HTML supported" value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} minRows={3} />
          </Stack>
        </Paper>
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addItem}>Add Item</Button>
    </Stack>
  );
}
