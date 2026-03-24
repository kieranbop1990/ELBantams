import { Title, Text, SimpleGrid, Paper, ThemeIcon, Group, Stack } from '@mantine/core';
import {
  IconMail, IconMapPin, IconBrandFacebook, IconBrandInstagram,
} from '@tabler/icons-react';
import type { Club } from '../types';

interface Props { club: Club }

export function ContactPage({ club }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">Contact Us</Title>
        <Text c="dimmed">
          Whether you're interested in playing, coaching, sponsoring, or just want to come
          along and watch — we'd love to hear from you.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper p="md" radius="md" withBorder>
          <Group align="flex-start" gap="md" wrap="nowrap">
            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
              <IconMail size={18} />
            </ThemeIcon>
            <div>
              <Text fw={600} mb={4}>Email</Text>
              <Text component="a" href={`mailto:${club.email}`} c="orange.6" size="sm">
                {club.email}
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group align="flex-start" gap="md" wrap="nowrap">
            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
              <IconMapPin size={18} />
            </ThemeIcon>
            <div>
              <Text fw={600} mb={4}>Ground Address</Text>
              <Text size="sm">
                {club.address.line1}<br />
                {club.address.line2}<br />
                {club.address.postcode}
              </Text>
              <Text size="sm" mt="xs">
                What3Words: <strong>{club.what3words}</strong>
              </Text>
            </div>
          </Group>
        </Paper>

        {club.socials.facebook && club.socials.facebook !== '#' && (
          <Paper p="md" radius="md" withBorder>
            <Group align="flex-start" gap="md" wrap="nowrap">
              <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                <IconBrandFacebook size={18} />
              </ThemeIcon>
              <div>
                <Text fw={600} mb={4}>Facebook</Text>
                <Text
                  component="a"
                  href={club.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  c="blue.6"
                  size="sm"
                >
                  Follow us on Facebook
                </Text>
              </div>
            </Group>
          </Paper>
        )}

        {club.socials.instagram && club.socials.instagram !== '#' && (
          <Paper p="md" radius="md" withBorder>
            <Group align="flex-start" gap="md" wrap="nowrap">
              <ThemeIcon color="grape" variant="light" size="lg" radius="md">
                <IconBrandInstagram size={18} />
              </ThemeIcon>
              <div>
                <Text fw={600} mb={4}>Instagram</Text>
                <Text
                  component="a"
                  href={club.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  c="grape.6"
                  size="sm"
                >
                  Follow us on Instagram
                </Text>
              </div>
            </Group>
          </Paper>
        )}
      </SimpleGrid>
    </Stack>
  );
}
