import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text, Paper, Anchor, Alert } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../auth-client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? 'Login failed');
      } else {
        await refresh();
        navigate('/');
      }
    } catch {
      setError('Login failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack maw={400} mx="auto" mt="xl">
      <Title order={2}>Log In</Title>
      <Paper p="xl" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <TextInput
              label="Email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" loading={loading} fullWidth>
              Log In
            </Button>
          </Stack>
        </form>
      </Paper>
      <Text size="sm" ta="center">
        Don't have an account? <Anchor component={Link} to="/signup">Sign up</Anchor>
      </Text>
    </Stack>
  );
}
