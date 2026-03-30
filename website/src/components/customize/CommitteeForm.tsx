import { TextInput, Stack, Group, Title, Paper, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { CommitteeData, CommitteeMember } from '../../types';

interface Props {
  committee: CommitteeData;
  onChange: (committee: CommitteeData) => void;
}

export function CommitteeForm({ committee, onChange }: Props) {
  const updateMember = (index: number, field: keyof CommitteeMember, value: string) => {
    const members = [...committee.committee];
    members[index] = { ...members[index], [field]: value };
    onChange({ committee: members });
  };

  const addMember = () =>
    onChange({ committee: [...committee.committee, { role: '', name: 'TBC', contact: 'TBC' }] });

  const removeMember = (i: number) =>
    onChange({ committee: committee.committee.filter((_, idx) => idx !== i) });

  return (
    <Stack gap="lg">
      <Title order={4}>Committee & Staff</Title>
      {committee.committee.map((member, i) => (
        <Paper key={i} p="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>{member.role || `Member ${i + 1}`}</Text>
            <Button size="compact-xs" variant="subtle" color="red" onClick={() => removeMember(i)} leftSection={<IconTrash size={12} />}>Remove</Button>
          </Group>
          <Group grow>
            <TextInput label="Role" value={member.role} onChange={e => updateMember(i, 'role', e.target.value)} />
            <TextInput label="Name" value={member.name} onChange={e => updateMember(i, 'name', e.target.value)} />
            <TextInput label="Contact" value={member.contact} onChange={e => updateMember(i, 'contact', e.target.value)} />
          </Group>
        </Paper>
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addMember}>Add Member</Button>
    </Stack>
  );
}
