
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, BarChart3 } from 'lucide-react';
import { Participant, TournamentConfig, PlayerStats, TeamStats } from '@/types/tournament';

interface RankingTabProps {
  participants: Participant[];
  config: TournamentConfig;
}

export const RankingTab: React.FC<RankingTabProps> = ({
  participants,
  config
}) => {
  const calculatePlayerStats = (): PlayerStats[] => {
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
      if (match.completed && match.score1 !== undefined && match.score2 !== undefined && match.player1Id && match.player2Id) {
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

    return stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const calculateTeamStats = (): TeamStats[] => {
    const stats: TeamStats[] = config.teams.map(t => ({
      id: t.id,
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
      if (match.completed && match.score1 !== undefined && match.score2 !== undefined && match.team1Id && match.team2Id) {
        const team1Stats = stats.find(s => s.id === match.team1Id);
        const team2Stats = stats.find(s => s.id === match.team2Id);

        if (team1Stats && team2Stats) {
          team1Stats.matchesPlayed++;
          team2Stats.matchesPlayed++;
          
          team1Stats.goalsFor += match.score1;
          team1Stats.goalsAgainst += match.score2;
          team2Stats.goalsFor += match.score2;
          team2Stats.goalsAgainst += match.score1;

          if (match.score1 > match.score2) {
            team1Stats.wins++;
            team1Stats.points += 3;
            team2Stats.losses++;
          } else if (match.score1 < match.score2) {
            team2Stats.wins++;
            team2Stats.points += 3;
            team1Stats.losses++;
          } else {
            team1Stats.draws++;
            team1Stats.points += 1;
            team2Stats.draws++;
            team2Stats.points += 1;
          }
        }
      }
    });

    stats.forEach(stat => {
      stat.goalDifference = stat.goalsFor - stat.goalsAgainst;
    });

    return stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const getParticipantName = (id: string) => {
    if (!participants || participants.length === 0) return 'Carregando...';
    const participant = participants.find(p => p.id === id);
    return participant ? participant.nickname : 'Desconhecido';
  };

  if (!config.created) {
    return (
      <Card className="bg-black/20 border-green-500/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-white text-lg">Configure e crie o campeonato primeiro</p>
            <p className="text-gray-400">O ranking será exibido conforme os resultados forem inseridos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const playerStats = config.mode === 'individual' ? calculatePlayerStats() : [];
  const teamStats = config.mode === 'doubles' ? calculateTeamStats() : [];
  const completedMatches = config.matches.filter(m => m.completed).length;
  const totalMatches = config.matches.length;

  return (
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
                  <th className="text-left text-white p-2">{config.mode === 'individual' ? 'Jogador' : 'Dupla'}</th>
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
                {config.mode === 'individual' ? (
                  playerStats.map((stat, index) => {
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
                  })
                ) : (
                  teamStats.map((stat, index) => {
                    const team = config.teams.find(t => t.id === stat.id);
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
                            <p className="text-white font-medium">{team?.name}</p>
                            <p className="text-gray-400 text-xs">
                              {getParticipantName(team?.player1Id || '')} + {getParticipantName(team?.player2Id || '')}
                            </p>
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
                  })
                )}
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

      {(playerStats.length > 0 || teamStats.length > 0) && (
        <Card className="bg-black/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.mode === 'individual' ? (
                playerStats.map((stat) => {
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
                })
              ) : (
                teamStats.map((stat) => {
                  const team = config.teams.find(t => t.id === stat.id);
                  const winRate = stat.matchesPlayed > 0 ? (stat.wins / stat.matchesPlayed * 100).toFixed(1) : '0.0';
                  
                  return (
                    <div key={stat.id} className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">{team?.name}</h4>
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
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
