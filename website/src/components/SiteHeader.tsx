import { Burger, Group, Text, ActionIcon, Badge } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { Club, TeamSection } from '../types';
import { useSection } from '../context/SectionContext';
import { tablerIcon } from '../utils/icons';

interface Props {
  club: Club;
  sections: TeamSection[];
  navOpen: boolean;
  onNavToggle: () => void;
}

export function SiteHeader({ club, sections, navOpen, onNavToggle }: Props) {
  const clubShort = club.name.replace(' FC', '');
  const { activeSection, setActiveSection } = useSection();
  const activeData = activeSection !== 'all'
    ? sections.find(s => s.id === activeSection)
    : null;

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={navOpen} onClick={onNavToggle} hiddenFrom="md" size="sm" />
        <Text
          component={Link}
          to="/"
          fw={700}
          size="lg"
          c="orange.6"
          style={{ textDecoration: 'none' }}
        >
          {clubShort} <Text component="span" fw={400} c="dimmed">FC</Text>
        </Text>
      </Group>

      <Group gap="xs">
        {activeData && (
          <Badge
            color="orange"
            variant="filled"
            size="md"
            leftSection={tablerIcon(activeData.icon)}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveSection('all')}
            title="Click to show all sections"
          >
            {activeData.name} {activeData.subtitle}
          </Badge>
        )}

        {club.socials.facebook && club.socials.facebook !== '#' && (
          <ActionIcon
            component="a"
            href={club.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            color="orange"
            aria-label="Facebook"
          >
            <IconBrandFacebook size={20} />
          </ActionIcon>
        )}
        {club.socials.instagram && club.socials.instagram !== '#' && (
          <ActionIcon
            component="a"
            href={club.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            color="orange"
            aria-label="Instagram"
          >
            <IconBrandInstagram size={20} />
          </ActionIcon>
        )}
        {club.socials.twitter && club.socials.twitter !== '#' && (
          <ActionIcon
            component="a"
            href={club.socials.twitter}
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            color="orange"
            aria-label="Twitter / X"
          >
            <IconBrandTwitter size={20} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );
}
