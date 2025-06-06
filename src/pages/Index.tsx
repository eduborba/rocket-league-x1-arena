
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Trophy, Calendar, BarChart3, RotateCcw, Plus, Trash2, Edit, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  nickname: string;
}

interface Match {
  id: string;
  round: number;
  player1Id: string;
  player2Id: string;
  score1?: number;
  score2?: number;
  completed: boolean;
}

interface TournamentConfig {
  rounds: number;
  participants: Participant[];
  matches: Match[];
  created: boolean;
}

interface PlayerStats {
  id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
}

const Index = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [config, setConfig] = useState<TournamentConfig>({
    rounds: 1,
    participants: [],
    matches: [],
    created: false
  });
  const [newParticipant, setNewParticipant] = useState({ name: '', nickname: '' });
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<{[key: string]: {score1: string, score2: string}}>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem('rl-tournament-participants');
    const savedConfig = localStorage.getItem('rl-tournament-config');
    
    if (savedParticipants) {
      setParticipants(JSON.parse(savedParticipants));
    }
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save participants to localStorage
  const saveParticipants = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    localStorage.setItem('rl-tournament-participants', JSON.stringify(newParticipants));
  };

  // Save config to localStorage
  const saveConfig = (newConfig: TournamentConfig) => {
    setConfig(newConfig);
    localStorage.setItem('rl-tournament-config', JSON.stringify(newConfig));
  };

  // Add participant
  const addParticipant = () => {
    if (!newParticipant.name.trim() || !newParticipant.nickname.trim()) {
      toast.error('Nome e apelido são obrigatórios!');
      return;
    }

    if (config.created) {
      toast.error('Não é possível adicionar participantes com o campeonato já criado!');
      return;
    }

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name.trim(),
      nickname: newParticipant.nickname.trim()
    };

    saveParticipants([...participants, participant]);
    setNewParticipant({ name: '', nickname: '' });
    toast.success('Participante adicionado com sucesso!');
  };

  // Remove participant
  const removeParticipant = (id: string) => {
    if (config.created) {
      toast.error('Não é possível remover participantes com o campeonato já criado!');
      return;
    }
    
    const updatedParticipants = participants.filter(p => p.id !== id);
    saveParticipants(updatedParticipants);
    toast.success('Participante removido com sucesso!');
  };

  // Generate matches for all rounds
  const generateMatches = () => {
    if (participants.length < 2) {
      toast.error('É necessário pelo menos 2 participantes!');
      return;
    }

    const matches: Match[] = [];
    let matchId = 1;

    for (let round = 1; round <= config.rounds; round++) {
      // Generate all possible pairs for each round
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          // Ida
          matches.push({
            id: `${matchId++}`,
            round,
            player1Id: participants[i].id,
            player2Id: participants[j].id,
            completed: false
          });
          
          // Volta
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

    const newConfig = {
      ...config,
      participants: [...participants],
      matches,
      created: true
    };

    saveConfig(newConfig);
    toast.success('Campeonato criado com sucesso!');
  };

  // Update match result
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
    setMatchScores({ ...matchScores, [matchId]: { score1: '', score2: '' } });
    toast.success('Resultado salvo com sucesso!');
  };

  // Calculate player statistics
  const calculateStats = (): PlayerStats[] => {
    const stats: PlayerStats[] = participants.map(p => ({
      id: p.id,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      matchesPlayed: 0
    }));

    config.matches.forEach(match => {
      if (match.completed && match.score1 !== undefined && match.score2 !== undefined) {
        const player1Stats = stats.find(s => s.id === match.player1Id);
        const player2Stats = stats.find(s => s.id === match.player2Id);

        if (player1Stats && player2Stats) {
          player1Stats.matchesPlayed++;
          player2Stats.matchesPlayed++;
          
          player1Stats.goalsFor += match.score1;
          player1Stats.goalsAgainst += match.score2;
          player2Stats.goalsFor += match.score2;
          player2Stats.goalsAgainst += match.score1;

          if (match.score1 > match.score2) {
            player1Stats.wins++;
            player1Stats.points += 3;
            player2Stats.losses++;
          } else if (match.score1 < match.score2) {
            player2Stats.wins++;
            player2Stats.points += 3;
            player1Stats.losses++;
          } else {
            player1Stats.draws++;
            player1Stats.points += 1;
            player2Stats.draws++;
            player2Stats.points += 1;
          }
        }
      }
    });

    stats.forEach(stat => {
      stat.goalDifference = stat.goalsFor - stat.goalsAgainst;
    });

    // Sort by points, then goal difference, then goals for
    return stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  // Reset tournament
  const resetTournament = () => {
    localStorage.removeItem('rl-tournament-participants');
    localStorage.removeItem('rl-tournament-config');
    setParticipants([]);
    setConfig({
      rounds: 1,
      participants: [],
      matches: [],
      created: false
    });
    setMatchScores({});
    toast.success('Campeonato resetado com sucesso!');
  };

  const getParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.nickname : 'Desconhecido';
  };

  const stats = calculateStats();
  const completedMatches = config.matches.filter(m => m.completed).length;
  const totalMatches = config.matches.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-800 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Rocket League X1
          </h1>
          <p className="text-xl text-gray-300">Sistema de Gerenciamento de Campeonato</p>
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
            <Card className="bg-black/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Cadastro de Participantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                      placeholder="Ex: João Silva"
                      className="bg-white/10 border-white/20 text-white"
                      disabled={config.created}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nickname" className="text-white">Apelido/Gamertag</Label>
                    <Input
                      id="nickname"
                      value={newParticipant.nickname}
                      onChange={(e) => setNewParticipant({ ...newParticipant, nickname: e.target.value })}
                      placeholder="Ex: JoãoRL"
                      className="bg-white/10 border-white/20 text-white"
                      disabled={config.created}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={addParticipant} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={config.created}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {config.created && (
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-orange-200 text-sm">
                      ⚠️ Campeonato já foi criado. Para adicionar/remover participantes, resete o campeonato.
                    </p>
                  </div>
                )}

                <Separator className="bg-white/20" />

                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Participantes Cadastrados ({participants.length})</h3>
                  {participants.length === 0 ? (
                    <p className="text-gray-400">Nenhum participante cadastrado.</p>
                  ) : (
                    <div className="grid gap-3">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <p className="text-white font-medium">{participant.name}</p>
                            <p className="text-gray-400 text-sm">{participant.nickname}</p>
                          </div>
                          {!config.created && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournament" className="space-y-6">
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
                      <Label htmlFor="rounds" className="text-white">Número de Rodadas</Label>
                      <Input
                        id="rounds"
                        type="number"
                        min="1"
                        value={config.rounds}
                        onChange={(e) => setConfig({ ...config, rounds: parseInt(e.target.value) || 1 })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-gray-400 text-sm mt-1">
                        Em cada rodada, cada jogador enfrentará todos os outros duas vezes (ida e volta)
                      </p>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-200 font-semibold mb-2">Resumo do Campeonato:</h4>
                      <ul className="text-blue-100 text-sm space-y-1">
                        <li>• Participantes: {participants.length}</li>
                        <li>• Rodadas: {config.rounds}</li>
                        <li>• Total de partidas: {participants.length >= 2 ? participants.length * (participants.length - 1) * config.rounds : 0}</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={generateMatches}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={participants.length < 2}
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
                        <li>• Participantes: {config.participants.length}</li>
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
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {!config.created ? (
              <Card className="bg-black/20 border-orange-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <p className="text-white text-lg">Configure e crie o campeonato primeiro</p>
                    <p className="text-gray-400">Adicione participantes e configure as rodadas na aba "Campeonato"</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
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
                                    <p className="text-white font-medium">{getParticipantName(match.player1Id)}</p>
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
                                          onChange={(e) => setMatchScores({
                                            ...matchScores,
                                            [match.id]: {
                                              ...matchScores[match.id],
                                              score1: e.target.value
                                            }
                                          })}
                                          className="w-16 bg-white/10 border-white/20 text-white text-center"
                                        />
                                        <span className="text-white">-</span>
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="0"
                                          value={matchScores[match.id]?.score2 || ''}
                                          onChange={(e) => setMatchScores({
                                            ...matchScores,
                                            [match.id]: {
                                              ...matchScores[match.id],
                                              score2: e.target.value
                                            }
                                          })}
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
                                    <p className="text-white font-medium">{getParticipantName(match.player2Id)}</p>
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
                                        onClick={() => {
                                          setEditingMatch(null);
                                          setMatchScores({ ...matchScores, [match.id]: { score1: '', score2: '' } });
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setEditingMatch(match.id);
                                        setMatchScores({
                                          ...matchScores,
                                          [match.id]: {
                                            score1: match.score1?.toString() || '',
                                            score2: match.score2?.toString() || ''
                                          }
                                        });
                                      }}
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
            )}
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            {!config.created ? (
              <Card className="bg-black/20 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-white text-lg">Configure e crie o campeonato primeiro</p>
                    <p className="text-gray-400">O ranking será exibido conforme os resultados forem inseridos</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-black/20 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Classificação Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left text-white p-2">Pos</th>
                            <th className="text-left text-white p-2">Jogador</th>
                            <th className="text-center text-white p-2">J</th>
                            <th className="text-center text-white p-2">V</th>
                            <th className="text-center text-white p-2">E</th>
                            <th className="text-center text-white p-2">D</th>
                            <th className="text-center text-white p-2">GM</th>
                            <th className="text-center text-white p-2">GS</th>
                            <th className="text-center text-white p-2">SG</th>
                            <th className="text-center text-white p-2">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.map((stat, index) => {
                            const participant = participants.find(p => p.id === stat.id);
                            return (
                              <tr key={stat.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-bold">{index + 1}º</span>
                                    {index === 0 && <Trophy className="w-4 h-4 text-yellow-400" />}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div>
                                    <p className="text-white font-medium">{participant?.nickname}</p>
                                    <p className="text-gray-400 text-xs">{participant?.name}</p>
                                  </div>
                                </td>
                                <td className="text-center text-white p-2">{stat.matchesPlayed}</td>
                                <td className="text-center text-green-400 p-2">{stat.wins}</td>
                                <td className="text-center text-yellow-400 p-2">{stat.draws}</td>
                                <td className="text-center text-red-400 p-2">{stat.losses}</td>
                                <td className="text-center text-white p-2">{stat.goalsFor}</td>
                                <td className="text-center text-white p-2">{stat.goalsAgainst}</td>
                                <td className="text-center text-white p-2">
                                  <span className={stat.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {stat.goalDifference > 0 ? '+' : ''}{stat.goalDifference}
                                  </span>
                                </td>
                                <td className="text-center p-2">
                                  <Badge variant="secondary" className="bg-blue-600 text-white">
                                    {stat.points}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {completedMatches > 0 && (
                      <div className="mt-4 text-sm text-gray-400">
                        <p>Critérios de desempate: 1º Pontuação, 2º Saldo de gols, 3º Gols marcados</p>
                        <p>Progresso: {completedMatches}/{totalMatches} partidas concluídas ({Math.round((completedMatches / totalMatches) * 100)}%)</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {stats.length > 0 && (
                  <Card className="bg-black/20 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Estatísticas Detalhadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.map((stat) => {
                          const participant = participants.find(p => p.id === stat.id);
                          const winRate = stat.matchesPlayed > 0 ? (stat.wins / stat.matchesPlayed * 100).toFixed(1) : '0.0';
                          
                          return (
                            <div key={stat.id} className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-2">{participant?.nickname}</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Taxa de vitória:</span>
                                  <span className="text-white">{winRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Média de gols/jogo:</span>
                                  <span className="text-white">
                                    {stat.matchesPlayed > 0 ? (stat.goalsFor / stat.matchesPlayed).toFixed(1) : '0.0'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Defesa/jogo:</span>
                                  <span className="text-white">
                                    {stat.matchesPlayed > 0 ? (stat.goalsAgainst / stat.matchesPlayed).toFixed(1) : '0.0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
