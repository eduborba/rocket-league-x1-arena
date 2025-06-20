
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Participant, TournamentConfig } from '@/types/tournament';

interface MatchesTabProps {
  participants: Participant[];
  config: TournamentConfig;
  saveConfig: (config: TournamentConfig) => void;
}

export const MatchesTab: React.FC<MatchesTabProps> = ({
  participants,
  config,
  saveConfig
}) => {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<{[key: string]: {score1: string, score2: string}}>({});

  const getParticipantName = (id: string) => {
    if (!participants || participants.length === 0) return 'Carregando...';
    const participant = participants.find(p => p.id === id);
    return participant ? participant.nickname : 'Desconhecido';
  };

  const getTeamName = (id: string) => {
    if (!participants || participants.length === 0) return 'Carregando...';
    if (!config.teams || config.teams.length === 0) return 'Carregando...';
    const team = config.teams.find(t => t.id === id);
    if (!team) return 'Desconhecido';
    
    const player1 = participants.find(p => p.id === team.player1Id);
    const player2 = participants.find(p => p.id === team.player2Id);
    
    return `${team.name} (${player1?.nickname || 'N/A'} + ${player2?.nickname || 'N/A'})`;
  };

  const updateMatchResult = (matchId: string) => {
    const scores = matchScores[matchId];
    if (!scores || scores.score1 === '' || scores.score2 === '') {
      toast.error('Insira ambos os placares!');
      return;
    }

    const score1 = parseInt(scores.score1);
    const score2 = parseInt(scores.score2);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      toast.error('Placares devem ser números válidos!');
      return;
    }

    const updatedMatches = config.matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          score1,
          score2,
          completed: true
        };
      }
      return match;
    });

    const newConfig = { ...config, matches: updatedMatches };
    saveConfig(newConfig);
    
    setEditingMatch(null);
    setMatchScores(prev => {
      const newScores = { ...prev };
      delete newScores[matchId];
      return newScores;
    });
    toast.success('Resultado salvo com sucesso!');
  };

  const startEditingMatch = (matchId: string) => {
    const match = config.matches.find(m => m.id === matchId);
    setEditingMatch(matchId);
    setMatchScores(prev => ({
      ...prev,
      [matchId]: {
        score1: match?.score1?.toString() || '',
        score2: match?.score2?.toString() || ''
      }
    }));
  };

  const cancelEditingMatch = () => {
    if (editingMatch) {
      setMatchScores(prev => {
        const newScores = { ...prev };
        delete newScores[editingMatch];
        return newScores;
      });
    }
    setEditingMatch(null);
  };

  if (!config.created) {
    return (
      <Card className="bg-black/20 border-orange-500/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <p className="text-white text-lg">Configure e crie o campeonato primeiro</p>
            <p className="text-gray-400">Adicione participantes e configure as rodadas na aba "Campeonato"</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: config.rounds }, (_, roundIndex) => {
        const roundNumber = roundIndex + 1;
        const roundMatches = config.matches.filter(m => m.round === roundNumber);
        
        return (
          <Card key={roundNumber} className="bg-black/20 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rodada {roundNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roundMatches.map((match) => (
                  <div key={match.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <p className="text-white font-medium">
                            {config.mode === 'individual' 
                              ? getParticipantName(match.player1Id || '')
                              : getTeamName(match.team1Id || '')
                            }
                          </p>
                        </div>
                        
                        <div className="text-center px-4">
                          {match.completed ? (
                            <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">
                              {match.score1} - {match.score2}
                            </div>
                          ) : editingMatch === match.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={matchScores[match.id]?.score1 || ''}
                                onChange={(e) => setMatchScores(prev => ({
                                  ...prev,
                                  [match.id]: {
                                    ...prev[match.id],
                                    score1: e.target.value,
                                    score2: prev[match.id]?.score2 || ''
                                  }
                                }))}
                                className="w-16 bg-white/10 border-white/20 text-white text-center"
                              />
                              <span className="text-white">-</span>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={matchScores[match.id]?.score2 || ''}
                                onChange={(e) => setMatchScores(prev => ({
                                  ...prev,
                                  [match.id]: {
                                    score1: prev[match.id]?.score1 || '',
                                    score2: e.target.value
                                  }
                                }))}
                                className="w-16 bg-white/10 border-white/20 text-white text-center"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
                              VS
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className="text-white font-medium">
                            {config.mode === 'individual' 
                              ? getParticipantName(match.player2Id || '')
                              : getTeamName(match.team2Id || '')
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {editingMatch === match.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateMatchResult(match.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingMatch}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => startEditingMatch(match.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
