import { Burger, Group, Text, ActionIcon, Badge, Box } from '@mantine/core';
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
  // Use tagShort if provided, otherwise strip a trailing " FC" suffix
  const clubShort = club.tagShort ?? club.name.replace(/ FC$/i, '');
  const showFcSuffix = !club.tagShort && / FC$/i.test(club.name);

  const { activeSection, setActiveSection } = useSection();
  const activeData = activeSection !== 'all'
    ? sections.find(s => s.id === activeSection)
    : null;

  const logosToShow = activeSection === 'all'
    ? sections.filter(s => s.logo)
    : sections.filter(s => s.id === activeSection && s.logo);

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group wrap="nowrap">
        <Burger opened={navOpen} onClick={onNavToggle} hiddenFrom="md" size="sm" />
        <Text
          component={Link}
          to="/"
          fw={700}
          size="lg"
          c="orange.6"
          style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          {clubShort}
          {showFcSuffix && (
            <Text component="span" fw={400} c="dimmed"> FC</Text>
          )}
        </Text>
      </Group>

      <Group gap="sm" wrap="nowrap">
        {activeData && (
          <Box visibleFrom="md">
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
          </Box>
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

        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
          {logosToShow.map(s => (
            <img
              key={s.id}
              src={s.logo}
              alt={`${s.name} logo`}
              height={44}
              width={44}
              style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ))}
        </Group>
      </Group>
    </Group>
  );
}
