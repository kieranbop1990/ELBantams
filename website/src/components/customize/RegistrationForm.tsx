import { TextInput, Textarea, Select, Stack, Group, Title, Paper, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { RegistrationItem } from '../../types';
import { ICON_OPTIONS } from './iconOptions';

interface Props {
  registration: RegistrationItem[];
  onChange: (registration: RegistrationItem[]) => void;
}

export function RegistrationForm({ registration, onChange }: Props) {
  const updateItem = (index: number, field: keyof RegistrationItem, value: string) => {
    const items = [...registration];
    items[index] = { ...items[index], [field]: value };
    onChange(items);
  };

  const addItem = () =>
    onChange([...registration, { icon: 'fa-user-plus', title: '', description: '', link: '#', buttonText: 'Register' }]);

  const removeItem = (i: number) =>
    onChange(registration.filter((_, idx) => idx !== i));

  return (
    <Stack gap="lg">
      <Title order={4}>Registration & Subscriptions</Title>
      {registration.map((item, i) => (
        <Paper key={i} p="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>{item.title || `Item ${i + 1}`}</Text>
            <Button size="compact-xs" variant="subtle" color="red" onClick={() => removeItem(i)} leftSection={<IconTrash size={12} />}>Remove</Button>
          </Group>
          <Stack gap="xs">
            <Group grow>
              <Select label="Icon" data={ICON_OPTIONS} value={item.icon} onChange={v => updateItem(i, 'icon', v ?? 'fa-user-plus')} searchable />
              <TextInput label="Title" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
            </Group>
            <Textarea label="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} minRows={2} />
            <Group grow>
              <TextInput label="Payment Link" value={item.link} onChange={e => updateItem(i, 'link', e.target.value)} />
              <TextInput label="Button Text" value={item.buttonText} onChange={e => updateItem(i, 'buttonText', e.target.value)} />
            </Group>
          </Stack>
        </Paper>
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addItem}>Add Registration Option</Button>
    </Stack>
  );
}
