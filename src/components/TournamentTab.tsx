
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trophy, RotateCcw, Play, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { Participant, TournamentConfig, Match } from '@/types/tournament';

interface TournamentTabProps {
  participants: Participant[];
  config: TournamentConfig;
  saveConfig: (config: TournamentConfig) => void;
  resetTournament: () => void;
}

export const TournamentTab: React.FC<TournamentTabProps> = ({
  participants,
  config,
  saveConfig,
  resetTournament
}) => {
  const generateMatches = () => {
    if (config.mode === 'individual') {
      if (participants.length < 2) {
        toast.error('É necessário pelo menos 2 participantes!');
        return;
      }
    } else {
      if (config.doublesMode === 'random') {
        if (participants.length < 4 || participants.length % 2 !== 0) {
          toast.error('É necessário um número par de participantes (mínimo 4) para duplas!');
          return;
        }
      } else {
        if (config.teams.length < 2) {
          toast.error('É necessário pelo menos 2 duplas!');
          return;
        }
      }
    }

    const matches: Match[] = [];
    let matchId = 1;

    let teamsToUse = config.teams;
    if (config.mode === 'doubles' && config.doublesMode === 'random' && config.teams.length === 0) {
      const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
      teamsToUse = [];
      
      for (let i = 0; i < shuffledParticipants.length; i += 2) {
        teamsToUse.push({
          id: `team-${i / 2 + 1}`,
          name: `Dupla ${i / 2 + 1}`,
          player1Id: shuffledParticipants[i].id,
          player2Id: shuffledParticipants[i + 1].id
        });
      }
    }

    for (let round = 1; round <= config.rounds; round++) {
      if (config.mode === 'individual') {
        for (let i = 0; i < participants.length; i++) {
          for (let j = i + 1; j < participants.length; j++) {
            matches.push({
              id: `${matchId++}`,
              round,
              player1Id: participants[i].id,
              player2Id: participants[j].id,
              completed: false
            });
            
            if (config.matchFormat === 'round-trip') {
              matches.push({
                id: `${matchId++}`,
                round,
                player1Id: participants[j].id,
                player2Id: participants[i].id,
                completed: false
              });
            }
          }
        }
      } else {
        for (let i = 0; i < teamsToUse.length; i++) {
          for (let j = i + 1; j < teamsToUse.length; j++) {
            matches.push({
              id: `${matchId++}`,
              round,
              team1Id: teamsToUse[i].id,
              team2Id: teamsToUse[j].id,
              completed: false
            });
            
            if (config.matchFormat === 'round-trip') {
              matches.push({
                id: `${matchId++}`,
                round,
                team1Id: teamsToUse[j].id,
                team2Id: teamsToUse[i].id,
                completed: false
              });
            }
          }
        }
      }
    }

    const newConfig = {
      ...config,
      participants: [...participants],
      teams: teamsToUse,
      matches,
      created: true
    };

    saveConfig(newConfig);
    toast.success('Campeonato criado com sucesso!');
  };

  const generateRandomTeams = () => {
    if (participants.length < 4 || participants.length % 2 !== 0) {
      toast.error('É necessário um número par de participantes (mínimo 4) para gerar duplas aleatórias!');
      return;
    }

    if (config.created) {
      toast.error('Não é possível gerar duplas com o campeonato já criado!');
      return;
    }

    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    const teams = [];

    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      const player1 = shuffledParticipants[i];
      const player2 = shuffledParticipants[i + 1];
      
      teams.push({
        id: `team-${i / 2 + 1}`,
        name: `Dupla ${i / 2 + 1}`,
        player1Id: player1.id,
        player2Id: player2.id
      });
    }

    const updatedConfig = {
      ...config,
      teams
    };

    saveConfig(updatedConfig);
    toast.success('Duplas geradas aleatoriamente!');
  };

  const completedMatches = config.matches.filter(m => m.completed).length;
  const totalMatches = config.matches.length;

  return (
    <Card className="bg-black/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Configuração do Campeonato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!config.created ? (
          <>
            <div>
              <Label className="text-white">Modo do Campeonato</Label>
              <RadioGroup
                value={config.mode}
                onValueChange={(value: 'individual' | 'doubles') => saveConfig({ ...config, mode: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="text-white">Individual (X1)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doubles" id="doubles" />
                  <Label htmlFor="doubles" className="text-white">Duplas (2X2)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-white">Formato das Partidas</Label>
              <RadioGroup
                value={config.matchFormat}
                onValueChange={(value: 'round-trip' | 'single') => saveConfig({ ...config, matchFormat: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="round-trip" id="round-trip" />
                  <Label htmlFor="round-trip" className="text-white">Ida e Volta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="text-white">Jogo Único</Label>
                </div>
              </RadioGroup>
              <p className="text-gray-400 text-sm mt-1">
                {config.matchFormat === 'round-trip' 
                  ? 'Cada confronto terá duas partidas (ida e volta)' 
                  : 'Cada confronto terá apenas uma partida'
                }
              </p>
            </div>

            {config.mode === 'doubles' && (
              <div>
                <Label className="text-white">Configuração das Duplas</Label>
                <RadioGroup
                  value={config.doublesMode}
                  onValueChange={(value: 'random' | 'predefined') => saveConfig({ ...config, doublesMode: value })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random" className="text-white">Duplas Aleatórias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="predefined" id="predefined" />
                    <Label htmlFor="predefined" className="text-white">Duplas Pré-definidas</Label>
                  </div>
                </RadioGroup>
                <p className="text-gray-400 text-sm mt-1">
                  {config.doublesMode === 'random' 
                    ? 'As duplas serão formadas automaticamente de forma aleatória' 
                    : 'Configure as duplas manualmente na aba Participantes'
                  }
                </p>

                {config.doublesMode === 'random' && participants.length >= 4 && participants.length % 2 === 0 && (
                  <Button 
                    onClick={generateRandomTeams}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Gerar Duplas Aleatórias
                  </Button>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="rounds" className="text-white">Número de Rodadas</Label>
              <Input
                id="rounds"
                type="number"
                min="1"
                value={config.rounds}
                onChange={(e) => saveConfig({ ...config, rounds: parseInt(e.target.value) || 1 })}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-gray-400 text-sm mt-1">
                {config.mode === 'individual' 
                  ? `Em cada rodada, cada jogador enfrentará todos os outros ${config.matchFormat === 'round-trip' ? 'duas vezes (ida e volta)' : 'uma vez'}`
                  : `Em cada rodada, cada dupla enfrentará todas as outras ${config.matchFormat === 'round-trip' ? 'duas vezes (ida e volta)' : 'uma vez'}`
                }
              </p>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-200 font-semibold mb-2">Resumo do Campeonato:</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• Modo: {config.mode === 'individual' ? 'Individual (X1)' : 'Duplas (2X2)'}</li>
                <li>• Formato: {config.matchFormat === 'round-trip' ? 'Ida e Volta' : 'Jogo Único'}</li>
                {config.mode === 'doubles' && (
                  <li>• Tipo de Duplas: {config.doublesMode === 'random' ? 'Aleatórias' : 'Pré-definidas'}</li>
                )}
                <li>• Participantes: {participants.length}</li>
                {config.mode === 'doubles' && config.doublesMode === 'predefined' && (
                  <li>• Duplas: {config.teams.length}</li>
                )}
                <li>• Rodadas: {config.rounds}</li>
                <li>• Total de partidas: {
                  config.mode === 'individual' 
                    ? (participants.length >= 2 ? participants.length * (participants.length - 1) * config.rounds * (config.matchFormat === 'round-trip' ? 1 : 0.5) : 0)
                    : config.doublesMode === 'predefined'
                      ? (config.teams.length >= 2 ? config.teams.length * (config.teams.length - 1) * config.rounds * (config.matchFormat === 'round-trip' ? 1 : 0.5) : 0)
                      : (participants.length >= 4 && participants.length % 2 === 0 ? (participants.length / 2) * ((participants.length / 2) - 1) * config.rounds * (config.matchFormat === 'round-trip' ? 1 : 0.5) : 0)
                }</li>
              </ul>
            </div>

            <Button 
              onClick={generateMatches}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={
                config.mode === 'individual' 
                  ? participants.length < 2
                  : config.doublesMode === 'predefined'
                    ? config.teams.length < 2
                    : participants.length < 4 || participants.length % 2 !== 0
              }
            >
              <Play className="w-4 h-4 mr-2" />
              Criar Campeonato
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-200 font-semibold mb-2">✅ Campeonato Criado!</h4>
              <ul className="text-green-100 text-sm space-y-1">
                <li>• Modo: {config.mode === 'individual' ? 'Individual (X1)' : 'Duplas (2X2)'}</li>
                <li>• Formato: {config.matchFormat === 'round-trip' ? 'Ida e Volta' : 'Jogo Único'}</li>
                {config.mode === 'doubles' && (
                  <li>• Tipo de Duplas: {config.doublesMode === 'random' ? 'Aleatórias' : 'Pré-definidas'}</li>
                )}
                <li>• Participantes: {config.participants.length}</li>
                {config.mode === 'doubles' && (
                  <li>• Duplas: {config.teams.length}</li>
                )}
                <li>• Rodadas: {config.rounds}</li>
                <li>• Total de partidas: {config.matches.length}</li>
                <li>• Partidas concluídas: {completedMatches}/{totalMatches}</li>
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar Campeonato
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Reset</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá apagar todos os dados do campeonato, incluindo participantes, partidas e resultados. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={resetTournament} className="bg-red-600 hover:bg-red-700">
                    Resetar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
