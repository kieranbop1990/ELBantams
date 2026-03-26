import { Title, Text, SimpleGrid, Paper, Button, Stack, ThemeIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { RegistrationItem } from '../types';
import { tablerIcon } from '../utils/icons';

interface Props { items: RegistrationItem[] }

export function RegisterPage({ items }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">Registration &amp; Subscriptions</Title>
        <Text c="dimmed">
          Ready to join or renew? Use the links below to register and pay your subscriptions
          online via GoCardless. If you have any questions,{' '}
          <Text component={Link} to="/contact" c="var(--mantine-primary-color-filled)">get in touch</Text>.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {items.map((item, i) => (
          <Paper key={i} p="lg" radius="md" withBorder>
            <ThemeIcon variant="light" size="xl" radius="md" mb="md">
              {tablerIcon(item.icon)}
            </ThemeIcon>
            <Text fw={700} mb={4}>{item.title}</Text>
            <Text size="sm" c="dimmed" mb="md">{item.description}</Text>
            <Button component="a" href={item.link} fullWidth>
              {item.buttonText}
            </Button>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
