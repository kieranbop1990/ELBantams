import { Burger, Group, Text, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { Club } from '../types';

interface Props {
  club: Club;
  navOpen: boolean;
  onNavToggle: () => void;
}

export function SiteHeader({ club, navOpen, onNavToggle }: Props) {
  const theme = useMantineTheme();
  const clubShort = club.name.replace(' FC', '');

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
