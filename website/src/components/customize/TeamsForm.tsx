import { TextInput, Textarea, Select, Stack, Group, Title, Paper, Button, Text, Switch, Divider, Accordion } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { TeamsData, TeamSection, Team } from '../../types';
import { ICON_OPTIONS } from './iconOptions';

interface Props {
  teams: TeamsData;
  onChange: (teams: TeamsData) => void;
}

function TeamEditor({ team, onChange, onRemove }: { team: Team; onChange: (t: Team) => void; onRemove: () => void }) {
  const update = <K extends keyof Team>(key: K, value: Team[K]) =>
    onChange({ ...team, [key]: value });

  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={600}>{team.name || 'New Team'}</Text>
        <Button size="compact-xs" variant="subtle" color="red" onClick={onRemove} leftSection={<IconTrash size={12} />}>Remove</Button>
      </Group>
      <Stack gap="xs">
        <Group grow>
          <TextInput label="Name" value={team.name} onChange={e => update('name', e.target.value)} />
          <TextInput label="Photo Path" value={team.photo ?? ''} onChange={e => update('photo', e.target.value)} />
        </Group>
        <Textarea label="Description" value={team.description} onChange={e => update('description', e.target.value)} minRows={2} />
        <Group grow>
          <TextInput label="Manager" value={team.manager} onChange={e => update('manager', e.target.value)} />
          <TextInput label="Coach" value={team.coach} onChange={e => update('coach', e.target.value)} />
        </Group>
        <Group grow>
          <TextInput label="Contact" value={team.contact} onChange={e => update('contact', e.target.value)} />
          <TextInput label="Feed Slug" description="For live fixtures" value={team.slug ?? ''} onChange={e => update('slug', e.target.value || undefined)} />
        </Group>
        <Switch
          label="Show next fixture in sidebar"
          checked={team.sidebar ?? false}
          onChange={e => update('sidebar', e.currentTarget.checked)}
        />
      </Stack>
    </Paper>
  );
}

function SectionEditor({ section, onChange, onRemove }: { section: TeamSection; onChange: (s: TeamSection) => void; onRemove: () => void }) {
  const update = <K extends keyof TeamSection>(key: K, value: TeamSection[K]) =>
    onChange({ ...section, [key]: value });

  const updateTeam = (index: number, team: Team) => {
    const teams = [...section.teams];
    teams[index] = team;
    update('teams', teams);
  };

  const addTeam = () =>
    update('teams', [...section.teams, { name: '', description: '', manager: 'TBC', coach: 'TBC', contact: 'TBC' }]);

  const removeTeam = (i: number) =>
    update('teams', section.teams.filter((_, idx) => idx !== i));

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={5}>{section.name || 'New Section'}</Title>
        <Button size="compact-xs" variant="subtle" color="red" onClick={onRemove} leftSection={<IconTrash size={12} />}>Remove Section</Button>
      </Group>
      <Stack gap="xs" mb="md">
        <Group grow>
          <TextInput label="ID" description="Unique identifier (e.g. seniors)" value={section.id} onChange={e => update('id', e.target.value)} />
          <TextInput label="Name" value={section.name} onChange={e => update('name', e.target.value)} />
        </Group>
        <Group grow>
          <TextInput label="Subtitle" description="e.g. Men's Teams" value={section.subtitle} onChange={e => update('subtitle', e.target.value)} />
          <Select label="Icon" data={ICON_OPTIONS} value={section.icon} onChange={v => update('icon', v ?? 'fa-star')} searchable />
        </Group>
        <TextInput label="Logo Image Path" value={section.logo ?? ''} onChange={e => update('logo', e.target.value)} />
      </Stack>
      <Divider label="Teams" mb="sm" />
      <Accordion variant="separated">
        {section.teams.map((team, i) => (
          <Accordion.Item key={i} value={String(i)}>
            <Accordion.Control>{team.name || `Team ${i + 1}`}</Accordion.Control>
            <Accordion.Panel>
              <TeamEditor team={team} onChange={t => updateTeam(i, t)} onRemove={() => removeTeam(i)} />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addTeam} mt="sm" size="sm">Add Team</Button>
    </Paper>
  );
}

export function TeamsForm({ teams, onChange }: Props) {
  const updateSection = (index: number, section: TeamSection) => {
    const sections = [...teams.sections];
    sections[index] = section;
    onChange({ sections });
  };

  const addSection = () =>
    onChange({ sections: [...teams.sections, { id: '', name: '', subtitle: '', icon: 'fa-shield-alt', teams: [] }] });

  const removeSection = (i: number) =>
    onChange({ sections: teams.sections.filter((_, idx) => idx !== i) });

  return (
    <Stack gap="lg">
      <Title order={4}>Teams & Sections</Title>
      {teams.sections.map((section, i) => (
        <SectionEditor key={i} section={section} onChange={s => updateSection(i, s)} onRemove={() => removeSection(i)} />
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addSection}>Add Section</Button>
    </Stack>
  );
}
