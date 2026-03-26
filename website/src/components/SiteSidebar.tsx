import { NavLink, Stack, Text, Divider, Badge, Group, Paper, Button, Box } from '@mantine/core';
import { useLocation, Link } from 'react-router-dom';
import {
  IconHome, IconInfoCircle, IconUsers, IconCreditCard, IconId,
  IconNews, IconPhoto, IconMapPin, IconMail, IconCalendar,
} from '@tabler/icons-react';
import type { Club, TeamFeed, TeamSection } from '../types';
import { useSection } from '../context/SectionContext';

const NAV_ITEMS = [
  { to: '/',          label: 'Home',              icon: <IconHome size={16} /> },
  { to: '/about',     label: 'About Us',          icon: <IconInfoCircle size={16} /> },
  { to: '/teams',     label: 'Teams',             icon: <IconUsers size={16} /> },
  { to: '/fixtures',  label: 'Fixtures & Results', icon: <IconCalendar size={16} /> },
  { to: '/register',  label: 'Register & Pay',    icon: <IconCreditCard size={16} /> },
  { to: '/committee', label: 'Committee & Staff', icon: <IconId size={16} /> },
  { to: '/news',      label: 'Club News',         icon: <IconNews size={16} /> },
  { to: '/gallery',   label: 'Gallery',           icon: <IconPhoto size={16} /> },
  { to: '/matchday',  label: 'Matchday Info',     icon: <IconMapPin size={16} /> },
  { to: '/contact',   label: 'Contact',           icon: <IconMail size={16} /> },
];

function NextTeamFixture({ feed, label }: { feed: TeamFeed; label: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = feed.fixtures
    .filter((f) => f.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const next = upcoming[0];
  if (!next) return null;
  const d = new Date(next.date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <>
      <Divider my="sm" mx="md" />
      <Text fw={600} size="xs" tt="uppercase" c="dimmed" px="md" pb="xs">
        {label}
      </Text>
      <Paper mx="md" p="sm" withBorder radius="md">
        <Badge color="orange" variant="light" size="xs" mb="xs">{next.division}</Badge>
        <Text fw={700} size="sm" ta="center" lh={1.3}>
          {next.home_team}
        </Text>
        <Text size="xs" c="dimmed" ta="center">vs</Text>
        <Text fw={700} size="sm" ta="center" lh={1.3} mb="xs">
          {next.away_team}
        </Text>
        <Group gap="xs" justify="center" wrap="nowrap">
          <IconCalendar size={12} />
          <Text size="xs" c="dimmed">{dateStr} · {next.time}</Text>
        </Group>
        <Text size="xs" c="dimmed" ta="center">{next.venue}</Text>
      </Paper>
    </>
  );
}

interface Props {
  club: Club;
  sections: TeamSection[];
  sidebarFeeds?: { feed: TeamFeed; label: string; sectionId: string }[];
  onNavClick: () => void;
}

export function SiteSidebar({ club, sections, sidebarFeeds, onNavClick }: Props) {
  const { pathname } = useLocation();
  const { activeSection, setActiveSection } = useSection();

  const visibleFeeds = sidebarFeeds?.filter(
    f => activeSection === 'all' || f.sectionId === activeSection
  );

  return (
    <Stack gap={0} h="100%" style={{ overflowY: 'auto' }}>
      <Box hiddenFrom="md">
        <Text fw={600} size="xs" tt="uppercase" c="dimmed" px="md" pt="md" pb="xs">
          Menu
        </Text>
      </Box>

      <Box visibleFrom="md">
        <Text fw={600} size="xs" tt="uppercase" c="dimmed" px="md" pt="md" pb="xs">
          View
        </Text>
        <Group gap={4} px="md" pb="sm" wrap="wrap">
          <Button
            size="compact-xs"
            variant={activeSection === 'all' ? 'filled' : 'outline'}
            color="orange"
            onClick={() => setActiveSection('all')}
          >
            All
          </Button>
          {sections.map(s => (
            <Button
              key={s.id}
              size="compact-xs"
              variant={activeSection === s.id ? 'filled' : 'outline'}
              color="orange"
              onClick={() => setActiveSection(s.id)}
            >
              {s.name} {s.subtitle}
            </Button>
          ))}
        </Group>

        <Divider mx="md" mb="xs" />

        <Text fw={600} size="xs" tt="uppercase" c="dimmed" px="md" pb="xs">
          Menu
        </Text>
      </Box>

      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          component={Link}
          to={to}
          label={label}
          leftSection={icon}
          active={to === '/' ? pathname === '/' : pathname.startsWith(to)}
          onClick={onNavClick}
          color="orange"
        />
      ))}

      {visibleFeeds?.map(({ feed, label }) => (
        <NextTeamFixture key={label} feed={feed} label={`Next ${label} Fixture`} />
      ))}

      <Divider my="sm" mx="md" />
      <Text fw={600} size="xs" tt="uppercase" c="dimmed" px="md" pb="xs">
        Get in Touch
      </Text>
      <Stack gap={4} px="md" pb="md">
        <Text size="xs">
          <Text component="a" href={`mailto:${club.email}`} c="orange.6" size="xs">
            {club.email}
          </Text>
        </Text>
        <Text size="xs" c="dimmed">
          {club.address.line1}, {club.address.line2}, {club.address.postcode}
        </Text>
      </Stack>
    </Stack>
  );
}
