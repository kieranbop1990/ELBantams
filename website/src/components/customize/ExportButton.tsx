import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import JSZip from 'jszip';
import type { AppData } from '../../types';

interface Props {
  data: AppData;
}

export function ExportButton({ data }: Props) {
  const handleExport = async () => {
    const zip = new JSZip();
    const dataFolder = zip.folder('data')!;

    dataFolder.file('club.json', JSON.stringify(data.club, null, 2));
    dataFolder.file('teams.json', JSON.stringify(data.teams, null, 2));
    dataFolder.file('committee.json', JSON.stringify(data.committee, null, 2));
    dataFolder.file('registration.json', JSON.stringify(data.registration, null, 2));
    dataFolder.file('news.json', JSON.stringify(data.news, null, 2));
    dataFolder.file('gallery.json', JSON.stringify(data.gallery, null, 2));
    dataFolder.file('matchday.json', JSON.stringify(data.matchday, null, 2));

    dataFolder.file('README.txt', [
      'Club Configuration Files',
      '========================',
      '',
      'These JSON files were exported from the Customise page.',
      '',
      'To deploy your club site:',
      '1. Fork the repository: https://github.com/adamsuk/ELBantams',
      '2. Replace the contents of website/public/data/ with these files',
      '3. Add your images to website/public/images/',
      '4. Enable GitHub Pages in your repo Settings > Pages > Source: GitHub Actions',
      '5. Push to main — your site will deploy automatically!',
      '',
      'For more details, see WHITELABEL.md in the repository.',
    ].join('\n'));

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.club.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-config.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button leftSection={<IconDownload size={16} />} onClick={handleExport}>
      Export ZIP
    </Button>
  );
}
