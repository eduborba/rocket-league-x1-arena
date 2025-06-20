
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, Calendar, BarChart3, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useTournament } from '@/hooks/useTournament';
import { ParticipantsTab } from '@/components/ParticipantsTab';
import { TournamentTab } from '@/components/TournamentTab';
import { MatchesTab } from '@/components/MatchesTab';
import { RankingTab } from '@/components/RankingTab';
import { exportTournamentData, importTournamentData } from '@/utils/importExport';

const Index = () => {
  const { participants, config, saveParticipants, saveConfig, setParticipants, setConfig } = useTournament();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetTournament = () => {
    localStorage.removeItem('rl-tournament-participants');
    localStorage.removeItem('rl-tournament-config');
    setParticipants([]);
    setConfig({
      rounds: 1,
      participants: [],
      teams: [],
      matches: [],
      created: false,
      mode: 'individual',
      doublesMode: 'random',
      matchFormat: 'round-trip'
    });
    toast.success('Campeonato resetado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-800 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Rocket League X1
          </h1>
          <p className="text-xl text-gray-300">Sistema de Gerenciamento de Campeonato</p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={() => exportTournamentData(participants, config)}
              className="bg-green-600 hover:bg-green-700"
              disabled={!config.created}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => importTournamentData(e, setParticipants, setConfig, fileInputRef)}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Dados
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-black/20">
            <TabsTrigger value="participants" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Participantes
            </TabsTrigger>
            <TabsTrigger value="tournament" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Campeonato
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-orange-600">
              <Calendar className="w-4 h-4 mr-2" />
              Partidas
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-green-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-6">
            <ParticipantsTab
              participants={participants}
              config={config}
              saveParticipants={saveParticipants}
              saveConfig={saveConfig}
            />
          </TabsContent>

          <TabsContent value="tournament" className="space-y-6">
            <TournamentTab
              participants={participants}
              config={config}
              saveConfig={saveConfig}
              resetTournament={resetTournament}
            />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <MatchesTab
              participants={participants}
              config={config}
              saveConfig={saveConfig}
            />
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            <RankingTab
              participants={participants}
              config={config}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
