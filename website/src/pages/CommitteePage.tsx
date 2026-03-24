import { Title, Table, Text, Stack } from '@mantine/core';
import type { CommitteeData, TeamsData } from '../types';

interface Props {
  committee: CommitteeData;
  teams: TeamsData;
}

export function CommitteePage({ committee, teams }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="md">Committee &amp; Staff</Title>
        <Text fw={600} mb="xs">Club Committee</Text>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Role</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Contact</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {committee.committee.map((m, i) => (
              <Table.Tr key={i}>
                <Table.Td>{m.role}</Table.Td>
                <Table.Td><em>{m.name}</em></Table.Td>
                <Table.Td><em>{m.contact}</em></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <div>
        <Text fw={600} mb="xs">Managers &amp; Coaches</Text>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Team</Table.Th>
              <Table.Th>Manager</Table.Th>
              <Table.Th>Coach(es)</Table.Th>
              <Table.Th>Contact</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {teams.sections.flatMap(section =>
              section.teams.map((team, ti) => (
                <Table.Tr key={`${section.name}-${ti}`}>
                  <Table.Td>
                    <strong>{section.name}</strong> — {team.name}
                  </Table.Td>
                  <Table.Td><em>{team.manager}</em></Table.Td>
                  <Table.Td><em>{team.coach}</em></Table.Td>
                  <Table.Td><em>{team.contact}</em></Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </Stack>
  );
}
