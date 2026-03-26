import { TextInput, Stack, Group, Title, Paper, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { GalleryItem } from '../../types';

interface Props {
  gallery: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
}

export function GalleryForm({ gallery, onChange }: Props) {
  const updateItem = (index: number, field: keyof GalleryItem, value: string) => {
    const items = [...gallery];
    items[index] = { ...items[index], [field]: value };
    onChange(items);
  };

  const addItem = () =>
    onChange([...gallery, { caption: '' }]);

  const removeItem = (i: number) =>
    onChange(gallery.filter((_, idx) => idx !== i));

  return (
    <Stack gap="lg">
      <Title order={4}>Photo Gallery</Title>
      {gallery.map((item, i) => (
        <Paper key={i} p="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>{item.caption || `Photo ${i + 1}`}</Text>
            <Button size="compact-xs" variant="subtle" color="red" onClick={() => removeItem(i)} leftSection={<IconTrash size={12} />}>Remove</Button>
          </Group>
          <Group grow>
            <TextInput label="Image Path" description="e.g. images/photo1.jpg" value={item.src ?? ''} onChange={e => updateItem(i, 'src', e.target.value)} />
            <TextInput label="Caption" value={item.caption} onChange={e => updateItem(i, 'caption', e.target.value)} />
          </Group>
        </Paper>
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addItem}>Add Photo</Button>
    </Stack>
  );
}
