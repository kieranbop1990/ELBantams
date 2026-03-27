import { TextInput, Textarea, Select, Stack, Group, Title, Paper, Button, Text, Switch, Divider, Accordion, Alert, Badge } from '@mantine/core';
import { IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';
import type { TeamsData, TeamSection, Team } from '../../types';
import type { FeedTeamEntry } from '../../data';
import { ICON_OPTIONS } from './iconOptions';

interface Props {
  teams: TeamsData;
  onChange: (teams: TeamsData) => void;
  feedTeams?: FeedTeamEntry[];
  teamSlugPrefix?: string;
}

function TeamEditor({ team, onChange, onRemove }: {
  team: Team;
  onChange: (t: Team) => void;
  onRemove: () => void;
}) {
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
          <TextInput
            label="Feed Team Slug"
            description="For live fixtures"
            value={team.slug ?? ''}
            onChange={e => update('slug', e.target.value || undefined)}
            placeholder="e.g. my-club-first-team"
          />
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

function SectionEditor({ section, onChange, onRemove }: {
  section: TeamSection;
  onChange: (s: TeamSection) => void;
  onRemove: () => void;
}) {
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

export function TeamsForm({ teams, onChange, feedTeams, teamSlugPrefix }: Props) {
  const updateSection = (index: number, section: TeamSection) => {
    const sections = [...teams.sections];
    sections[index] = section;
    onChange({ sections });
  };

  const addSection = () =>
    onChange({ sections: [...teams.sections, { id: '', name: '', subtitle: '', icon: 'fa-shield-alt', teams: [] }] });

  const removeSection = (i: number) =>
    onChange({ sections: teams.sections.filter((_, idx) => idx !== i) });

  // Build dropdown options from feed teams matching the prefix
  const matchingFeedTeams = feedTeams && teamSlugPrefix
    ? feedTeams
        .filter(t => t.slug.startsWith(teamSlugPrefix))
        .sort((a, b) => a.slug.localeCompare(b.slug) || a.league.localeCompare(b.league))
    : undefined;

  // Detect slugs that appear in multiple leagues (e.g. Saturday + Sunday)
  const duplicateSlugs = new Set<string>();
  if (matchingFeedTeams) {
    const seen = new Set<string>();
    for (const t of matchingFeedTeams) {
      if (seen.has(t.slug)) duplicateSlugs.add(t.slug);
      else seen.add(t.slug);
    }
  }

  return (
    <Stack gap="lg">
      <Title order={4}>Teams & Sections</Title>
      {matchingFeedTeams && matchingFeedTeams.length > 0 && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          <Text size="xs" mb={4}>{matchingFeedTeams.length} teams found in fulltimeCalendar matching prefix "{teamSlugPrefix}". Copy a slug below into the "Feed Team Slug" field for each team.{duplicateSlugs.size > 0 && ' Note: some teams appear in both Saturday and Sunday leagues — they share the same slug but have separate fixtures.'}</Text>
          <Group gap={4} wrap="wrap">
            {matchingFeedTeams.map(t => (
              <Badge key={`${t.league}/${t.slug}`} variant="outline" size="sm" style={{ textTransform: 'none' }}>
                {t.slug}{duplicateSlugs.has(t.slug) ? ` (${/saturday/i.test(t.league) ? 'Sat' : /sunday/i.test(t.league) ? 'Sun' : t.league})` : ''}
              </Badge>
            ))}
          </Group>
        </Alert>
      )}
      {teams.sections.map((section, i) => (
        <SectionEditor key={i} section={section} onChange={s => updateSection(i, s)} onRemove={() => removeSection(i)} />
      ))}
      <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addSection}>Add Section</Button>
    </Stack>
  );
}
