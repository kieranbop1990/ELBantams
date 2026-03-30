import { useEffect, useState } from 'react';
import { Table, Select, Title, Stack, Alert, Loader, Center, Badge, Text } from '@mantine/core';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json() as { users: UserRow[] };
      setUsers(data.users);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      setError('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <Stack maw={800} mx="auto">
      <Title order={2}>Manage Users</Title>
      <Text size="sm" c="dimmed">{users.length} registered user{users.length !== 1 ? 's' : ''}</Text>
      {error && <Alert color="red" variant="light">{error}</Alert>}
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map(user => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.name}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Select
                  value={user.role}
                  onChange={(val) => val && handleRoleChange(user.id, val)}
                  data={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'member', label: 'Member' },
                  ]}
                  size="xs"
                  w={120}
                  disabled={updating === user.id}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
