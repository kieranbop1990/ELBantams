import { useEffect } from 'react';
import { Stack, Title, Text, Button, Paper, Anchor } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

export function CustomizePage() {
  const adminUrl = `${window.location.pathname.replace(/\/$/, '')}/admin/`;

  useEffect(() => {
    // Auto-redirect after a short delay so users see the message
    const timer = setTimeout(() => {
      window.location.href = adminUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, [adminUrl]);

  return (
    <Stack gap="lg" maw={600} mx="auto" mt="xl">
      <Title order={2}>Content Manager</Title>
      <Text>
        This site is now managed through the Sveltia CMS content manager.
        You will be redirected automatically.
      </Text>
      <Paper p="md" withBorder>
        <Button
          component="a"
          href={adminUrl}
          rightSection={<IconExternalLink size={16} />}
          fullWidth
          size="lg"
        >
          Open Content Manager
        </Button>
      </Paper>
      <Text size="sm" c="dimmed">
        Not redirected? <Anchor href={adminUrl}>Click here</Anchor> to go to the admin panel.
        You will need a GitHub account with write access to this repository to make changes.
      </Text>
    </Stack>
  );
}
