import { useEffect, useState } from 'react';
import {
  Stack, Title, Text, Tabs, Table, Badge, Button,
  Select, Textarea, Alert, Group, Paper,
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';

interface Pitch {
  id: string;
  name: string;
  formats: string[];
}

interface TeamOption {
  group: string;
  items: { value: string; label: string }[];
}

interface BookingRequest {
  id: string;
  teamName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  format: string;
  notes?: string;
  status: string;
  declineReason?: string;
  createdAt: number;
}

const FORMAT_OPTIONS = [
  { value: '11v11', label: '11v11' },
  { value: '9v9', label: '9v9' },
  { value: '7v7', label: '7v7' },
  { value: '5v5', label: '5v5' },
];

function statusColor(status: string) {
  if (status === 'approved') return 'green';
  if (status === 'declined') return 'red';
  return 'yellow';
}

export function PitchBookingPage() {
  const { isAdmin, teamRoles } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('request');

  // Form state
  const [teamName, setTeamName] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [format, setFormat] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPitches = async () => {
    try {
      const res = await fetch('/api/pitches');
      if (res.ok) {
        const data = await res.json() as { pitches: Pitch[] };
        setPitches(data.pitches);
      }
    } catch {
      // ignore
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) return;
      const data = await res.json() as {
        sections: { id: string; name: string }[];
        teams: { id: string; sectionId: string; name: string }[];
      };
      const grouped: TeamOption[] = data.sections.map(s => ({
        group: s.name,
        items: data.teams
          .filter(t => t.sectionId === s.id)
          .map(t => ({ value: t.name, label: t.name })),
      })).filter(g => g.items.length > 0);
      setTeamOptions(grouped);

      // Pre-fill team if user has exactly one coach/manager assignment
      if (!isAdmin) {
        const assignedNames = teamRoles
          .filter(r => r.role === 'coach' || r.role === 'manager')
          .map(r => r.teamName);
        if (assignedNames.length === 1) {
          const allTeamNames = grouped.flatMap(g => g.items.map(i => i.value));
          if (allTeamNames.includes(assignedNames[0])) {
            setTeamName(assignedNames[0]);
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/booking-requests');
      if (res.ok) {
        const data = await res.json() as { requests: BookingRequest[] };
        // Show newest first
        const sorted = [...data.requests].sort((a, b) => b.createdAt - a.createdAt);
        setRequests(sorted);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPitches();
    fetchTeams();
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!teamName) { setError('Team name is required'); return; }
    if (!date) { setError('Date is required'); return; }
    if (!timeStart) { setError('Start time is required'); return; }
    if (!timeEnd) { setError('End time is required'); return; }
    if (!format) { setError('Format is required'); return; }
    if (timeEnd <= timeStart) { setError('End time must be after start time'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, date, timeStart, timeEnd, format, notes: notes || undefined }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to submit request');
        return;
      }

      setSuccess('Your booking request has been submitted and is pending approval.');
      setTeamName(null);
      setDate('');
      setTimeStart('');
      setTimeEnd('');
      setFormat(null);
      setNotes('');
      await fetchRequests();
      setActiveTab('my-requests');
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack maw={900} mx="auto">
      <Title order={2}>Pitch Bookings</Title>
      <Text size="sm" c="dimmed">Request a pitch booking or view your existing requests.</Text>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="request">Request a Pitch</Tabs.Tab>
          <Tabs.Tab value="my-requests">My Requests</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="request" pt="md">
          <Paper p="md" withBorder>
            <Stack>
              {error && <Alert color="red" variant="light" onClose={() => setError('')} withCloseButton>{error}</Alert>}
              {success && <Alert color="green" variant="light" onClose={() => setSuccess('')} withCloseButton>{success}</Alert>}

              <Select
                label="Team"
                placeholder="Select your team"
                value={teamName}
                onChange={setTeamName}
                data={teamOptions}
                searchable
                required
              />

              <Stack gap={4}>
                <Text size="sm" fw={500}>Date <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.currentTarget.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                />
              </Stack>

              <Group grow>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>Start Time <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
                  <input
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.currentTarget.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                  />
                </Stack>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>End Time <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
                  <input
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.currentTarget.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                  />
                </Stack>
              </Group>

              <Select
                label="Format"
                placeholder="Select format"
                value={format}
                onChange={setFormat}
                data={FORMAT_OPTIONS}
                required
              />

              <Text size="xs" c="dimmed">
                Available pitches: {pitches.length > 0 ? pitches.map(p => `${p.name} (${p.formats.join(', ')})`).join(' · ') : 'Loading...'}
              </Text>

              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                placeholder="Any additional information..."
                rows={3}
              />

              <Button onClick={handleSubmit} loading={submitting}>
                Submit Request
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="my-requests" pt="md">
          {requests.length === 0 ? (
            <Text c="dimmed">You have no booking requests yet.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Team</Table.Th>
                  <Table.Th>Format</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Notes</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {requests.map((req) => (
                  <Table.Tr key={req.id}>
                    <Table.Td>{req.date}</Table.Td>
                    <Table.Td>{req.timeStart}–{req.timeEnd}</Table.Td>
                    <Table.Td>{req.teamName}</Table.Td>
                    <Table.Td>{req.format}</Table.Td>
                    <Table.Td>
                      <Badge color={statusColor(req.status)} variant="light">
                        {req.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {req.status === 'declined' && req.declineReason
                        ? <Text size="xs" c="red">{req.declineReason}</Text>
                        : req.notes
                          ? <Text size="xs">{req.notes}</Text>
                          : null}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
