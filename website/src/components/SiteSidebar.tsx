import { NavLink, Stack, Text, Divider, Badge, Group, Paper, Button } from '@mantine/core';
import { useLocation, Link } from 'react-router-dom';
import { IconCalendar } from '@tabler/icons-react';
import type { Club, NavItem, TeamFeed, TeamSection } from '../types';
import { useSection } from '../context/SectionContext';
import { tablerIcon } from '../utils/icons';

const DEFAULT_NAV: NavItem[] = [
  { to: '/',          label: 'Home',               icon: 'fa-home' },
  { to: '/about',     label: 'About Us',           icon: 'fa-info-circle' },
  { to: '/teams',     label: 'Teams',              icon: 'fa-users' },
  { to: '/fixtures',  label: 'Fixtures & Results', icon: 'fa-calendar' },
  { to: '/register',  label: 'Register & Pay',     icon: 'fa-credit-card' },
  { to: '/committee', label: 'Committee & Staff',  icon: 'fa-id-card' },
  { to: '/news',      label: 'Club News',          icon: 'fa-newspaper' },
  { to: '/gallery',   label: 'Gallery',            icon: 'fa-images' },
  { to: '/matchday',  label: 'Matchday Info',      icon: 'fa-map-marker-alt' },
  { to: '/contact',   label: 'Contact',            icon: 'fa-envelope' },
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
        <Badge variant="light" size="xs" mb="xs">{next.division}</Badge>
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

  const navItems = club.nav ?? DEFAULT_NAV;

  const visibleFeeds = sidebarFeeds?.filter(
    f => activeSection === 'all' || f.sectionId === activeSection
  );

  return (
    <Stack gap={0} h="100%" style={{ overflowY: 'auto' }}>
      <Text fw={600} size="xs" tt="uppercase" c="dimmed" px="md" pt="md" pb="xs">
        View
      </Text>
      <Group gap={4} px="md" pb="sm" wrap="wrap">
        <Button
          size="compact-xs"
          variant={activeSection === 'all' ? 'filled' : 'outline'}
          onClick={() => setActiveSection('all')}
        >
          All
        </Button>
        {sections.map(s => (
          <Button
            key={s.id}
            size="compact-xs"
            variant={activeSection === s.id ? 'filled' : 'outline'}
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

      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          component={Link}
          to={to}
          label={label}
          leftSection={tablerIcon(icon, 16)}
          active={to === '/' ? pathname === '/' : pathname.startsWith(to)}
          onClick={onNavClick}
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
          <Text component="a" href={`mailto:${club.email}`} c="var(--mantine-primary-color-filled)" size="xs">
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
