import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Stack, Title, Tabs, Table, Badge, Button, Modal,
  Select, Textarea, Group, Alert, Text, Paper,
} from '@mantine/core';

interface Pitch {
  id: string;
  name: string;
  formats: string[];
}

interface AdminRequest {
  id: string;
  userName: string;
  userEmail: string;
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

interface Booking {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  teamName: string;
  format: string;
  notes?: string;
  pitchName: string;
  createdAt: number;
}

interface ApproveForm {
  pitchId: string;
  timeStart: string;
  timeEnd: string;
  notes: string;
}

function statusColor(status: string) {
  if (status === 'approved') return 'green';
  if (status === 'declined') return 'red';
  return 'yellow';
}

interface Props {
  clubFeedSlug?: string;
}

export function BookingAdminPage({ clubFeedSlug }: Props) {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [approveOpened, { open: openApprove, close: closeApprove }] = useDisclosure(false);
  const [declineOpened, { open: openDecline, close: closeDecline }] = useDisclosure(false);
  const [approveForm, setApproveForm] = useState<ApproveForm>({ pitchId: '', timeStart: '', timeEnd: '', notes: '' });
  const [declineReason, setDeclineReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAll = async () => {
    try {
      const [reqRes, bkgRes, pitchRes] = await Promise.all([
        fetch('/api/booking-requests?status=pending'),
        fetch('/api/bookings'),
        fetch('/api/pitches'),
      ]);

      if (!reqRes.ok || !bkgRes.ok) {
        setError('Failed to load data');
        return;
      }

      if (reqRes.ok) {
        const data = await reqRes.json() as { requests: AdminRequest[] };
        setRequests(data.requests);
      }
      if (bkgRes.ok) {
        const data = await bkgRes.json() as { bookings: Booking[] };
        setBookings(data.bookings);
      }
      if (pitchRes.ok) {
        const data = await pitchRes.json() as { pitches: Pitch[] };
        setPitches(data.pitches);
      }
    } catch {
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenApprove = (req: AdminRequest) => {
    setSelectedRequest(req);
    setApproveForm({ pitchId: '', timeStart: req.timeStart, timeEnd: req.timeEnd, notes: '' });
    setError('');
    openApprove();
  };

  const handleOpenDecline = (req: AdminRequest) => {
    setSelectedRequest(req);
    setDeclineReason('');
    setError('');
    openDecline();
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    if (!approveForm.pitchId) { setError('Please select a pitch'); return; }
    if (!approveForm.timeStart) { setError('Start time is required'); return; }
    if (!approveForm.timeEnd) { setError('End time is required'); return; }

    setProcessing(true);
    setError('');
    try {
      const res = await fetch(`/api/booking-requests?id=${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          pitchId: approveForm.pitchId,
          timeStart: approveForm.timeStart,
          timeEnd: approveForm.timeEnd,
          notes: approveForm.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to approve request');
        return;
      }

      closeApprove();
      setSelectedRequest(null);
      setSuccessMsg('Booking approved successfully.');
      await fetchAll();
    } catch {
      setError('Failed to approve request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    setError('');
    try {
      const res = await fetch(`/api/booking-requests?id=${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', reason: declineReason || undefined }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to decline request');
        return;
      }

      closeDecline();
      setSelectedRequest(null);
      setSuccessMsg('Booking request declined.');
      await fetchAll();
    } catch {
      setError('Failed to decline request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleImportFixtures = async () => {
    if (!clubFeedSlug) return;
    setImporting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/import-fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubFeedSlug }),
      });
      const data = await res.json() as { ok?: boolean; created?: number; skipped?: number; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Import failed');
        return;
      }
      setSuccessMsg(`Import complete — ${data.created} created, ${data.skipped} skipped.`);
      await fetchAll();
    } catch {
      setError('Failed to import fixtures');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to delete booking');
        return;
      }
      await fetchAll();
    } catch {
      setError('Failed to delete booking');
    }
  };

  const compatiblePitches = selectedRequest
    ? pitches.filter((p) => p.formats.includes(selectedRequest.format))
    : [];

  return (
    <Stack maw={1100} mx="auto">
      <Group justify="space-between" align="center">
        <Title order={2}>Booking Administration</Title>
        {clubFeedSlug && (
          <Button
            size="sm"
            variant="light"
            loading={importing}
            onClick={handleImportFixtures}
          >
            Import Fixtures
          </Button>
        )}
      </Group>

      {successMsg && (
        <Alert color="green" variant="light" onClose={() => setSuccessMsg('')} withCloseButton>
          {successMsg}
        </Alert>
      )}

      <Tabs defaultValue="pending">
        <Tabs.List>
          <Tabs.Tab value="pending">
            Pending Requests {requests.length > 0 && `(${requests.length})`}
          </Tabs.Tab>
          <Tabs.Tab value="bookings">All Bookings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pending" pt="md">
          {requests.length === 0 ? (
            <Text c="dimmed">No pending requests.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Manager</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Team</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Format</Table.Th>
                  <Table.Th>Notes</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {requests.map((req) => (
                  <Table.Tr key={req.id}>
                    <Table.Td>{req.userName}</Table.Td>
                    <Table.Td>{req.userEmail}</Table.Td>
                    <Table.Td>{req.teamName}</Table.Td>
                    <Table.Td>{req.date}</Table.Td>
                    <Table.Td>{req.timeStart}–{req.timeEnd}</Table.Td>
                    <Table.Td>{req.format}</Table.Td>
                    <Table.Td>{req.notes ?? ''}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button size="xs" color="green" onClick={() => handleOpenApprove(req)}>
                          Approve
                        </Button>
                        <Button size="xs" color="red" variant="light" onClick={() => handleOpenDecline(req)}>
                          Decline
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="bookings" pt="md">
          {bookings.length === 0 ? (
            <Text c="dimmed">No bookings yet.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Pitch</Table.Th>
                  <Table.Th>Team</Table.Th>
                  <Table.Th>Format</Table.Th>
                  <Table.Th>Notes</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((bkg) => (
                  <Table.Tr key={bkg.id}>
                    <Table.Td>{bkg.date}</Table.Td>
                    <Table.Td>{bkg.timeStart}–{bkg.timeEnd}</Table.Td>
                    <Table.Td>{bkg.pitchName}</Table.Td>
                    <Table.Td>{bkg.teamName}</Table.Td>
                    <Table.Td>
                      <Badge variant="light">{bkg.format}</Badge>
                    </Table.Td>
                    <Table.Td>{bkg.notes ?? ''}</Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteBooking(bkg.id)}
                      >
                        Delete
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Approve Modal */}
      <Modal
        opened={approveOpened}
        onClose={closeApprove}
        title="Approve Booking Request"
        size="md"
      >
        {selectedRequest && (
          <Stack>
            {error && <Alert color="red" variant="light">{error}</Alert>}

            <Paper p="sm" withBorder>
              <Text size="sm" fw={500}>Request Details</Text>
              <Text size="sm">Manager: {selectedRequest.userName} ({selectedRequest.userEmail})</Text>
              <Text size="sm">Team: {selectedRequest.teamName}</Text>
              <Text size="sm">Date: {selectedRequest.date}</Text>
              <Text size="sm">Requested time: {selectedRequest.timeStart}–{selectedRequest.timeEnd}</Text>
              <Text size="sm">Format: {selectedRequest.format}</Text>
              {selectedRequest.notes && <Text size="sm">Notes: {selectedRequest.notes}</Text>}
            </Paper>

            <Select
              label="Pitch"
              placeholder="Select a pitch"
              value={approveForm.pitchId}
              onChange={(val) => setApproveForm((f) => ({ ...f, pitchId: val ?? '' }))}
              data={compatiblePitches.map((p) => ({ value: p.id, label: p.name }))}
              required
            />

            <Group grow>
              <Stack gap={4}>
                <Text size="sm" fw={500}>Start Time <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
                <input
                  type="time"
                  value={approveForm.timeStart}
                  onChange={(e) => setApproveForm((f) => ({ ...f, timeStart: e.currentTarget.value }))}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                />
              </Stack>
              <Stack gap={4}>
                <Text size="sm" fw={500}>End Time <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
                <input
                  type="time"
                  value={approveForm.timeEnd}
                  onChange={(e) => setApproveForm((f) => ({ ...f, timeEnd: e.currentTarget.value }))}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                />
              </Stack>
            </Group>

            <Textarea
              label="Notes (optional)"
              value={approveForm.notes}
              onChange={(e) => setApproveForm((f) => ({ ...f, notes: e.currentTarget.value }))}
              placeholder="Any notes for this booking..."
              rows={3}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeApprove} disabled={processing}>
                Cancel
              </Button>
              <Button color="green" onClick={handleApprove} loading={processing}>
                Confirm Approval
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Decline Modal */}
      <Modal
        opened={declineOpened}
        onClose={closeDecline}
        title="Decline Booking Request"
        size="sm"
      >
        {selectedRequest && (
          <Stack>
            {error && <Alert color="red" variant="light">{error}</Alert>}

            <Text size="sm">
              Declining request from <strong>{selectedRequest.userName}</strong> for{' '}
              <strong>{selectedRequest.teamName}</strong> on {selectedRequest.date}.
            </Text>

            <Textarea
              label="Reason (optional)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.currentTarget.value)}
              placeholder="Reason for declining..."
              rows={3}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeDecline} disabled={processing}>
                Cancel
              </Button>
              <Button color="red" onClick={handleDecline} loading={processing}>
                Confirm Decline
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
