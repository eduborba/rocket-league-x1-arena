
import { toast } from 'sonner';
import { Participant, TournamentConfig } from '@/types/tournament';

export const exportTournamentData = (participants: Participant[], config: TournamentConfig) => {
  const tournamentData = {
    participants,
    config,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const dataStr = JSON.stringify(tournamentData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `campeonato_rocket_league_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success('Dados do campeonato exportados com sucesso!');
};

export const importTournamentData = (
  event: React.ChangeEvent<HTMLInputElement>,
  setParticipants: (participants: Participant[]) => void,
  setConfig: (config: TournamentConfig) => void,
  fileInputRef: React.RefObject<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const tournamentData = JSON.parse(content);
      
      if (tournamentData.participants && tournamentData.config) {
        setParticipants(tournamentData.participants);
        setConfig(tournamentData.config);
        
        localStorage.setItem('rl-tournament-participants', JSON.stringify(tournamentData.participants));
        localStorage.setItem('rl-tournament-config', JSON.stringify(tournamentData.config));
        
        toast.success('Dados do campeonato importados com sucesso!');
      } else {
        toast.error('Arquivo inválido! Formato não reconhecido.');
      }
    } catch (error) {
      toast.error('Erro ao importar arquivo! Verifique se é um arquivo JSON válido.');
    }
  };
  reader.readAsText(file);
  
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
