
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, UserPlus, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { Participant, Team, TournamentConfig } from '@/types/tournament';

interface ParticipantsTabProps {
  participants: Participant[];
  config: TournamentConfig;
  saveParticipants: (participants: Participant[]) => void;
  saveConfig: (config: TournamentConfig) => void;
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participants,
  config,
  saveParticipants,
  saveConfig
}) => {
  const [newParticipant, setNewParticipant] = useState({ name: '', nickname: '' });
  const [newTeam, setNewTeam] = useState({ name: '', player1Id: '', player2Id: '' });

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

  const removeParticipant = (id: string) => {
    if (config.created) {
      toast.error('Não é possível remover participantes com o campeonato já criado!');
      return;
    }
    
    const updatedParticipants = participants.filter(p => p.id !== id);
    saveParticipants(updatedParticipants);
    toast.success('Participante removido com sucesso!');
  };

  const addTeam = () => {
    if (!newTeam.name.trim() || !newTeam.player1Id || !newTeam.player2Id) {
      toast.error('Nome da dupla e ambos os jogadores são obrigatórios!');
      return;
    }

    if (newTeam.player1Id === newTeam.player2Id) {
      toast.error('Os jogadores da dupla devem ser diferentes!');
      return;
    }

    if (config.created) {
      toast.error('Não é possível adicionar duplas com o campeonato já criado!');
      return;
    }

    const playerInTeam = config.teams.some(team => 
      team.player1Id === newTeam.player1Id || team.player2Id === newTeam.player1Id ||
      team.player1Id === newTeam.player2Id || team.player2Id === newTeam.player2Id
    );

    if (playerInTeam) {
      toast.error('Um ou ambos os jogadores já estão em outra dupla!');
      return;
    }

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name.trim(),
      player1Id: newTeam.player1Id,
      player2Id: newTeam.player2Id
    };

    const updatedConfig = {
      ...config,
      teams: [...config.teams, team]
    };

    saveConfig(updatedConfig);
    setNewTeam({ name: '', player1Id: '', player2Id: '' });
    toast.success('Dupla adicionada com sucesso!');
  };

  const removeTeam = (id: string) => {
    if (config.created) {
      toast.error('Não é possível remover duplas com o campeonato já criado!');
      return;
    }
    
    const updatedConfig = {
      ...config,
      teams: config.teams.filter(t => t.id !== id)
    };
    saveConfig(updatedConfig);
    toast.success('Dupla removida com sucesso!');
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
    const teams: Team[] = [];

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

  const getParticipantName = (id: string) => {
    if (!participants || participants.length === 0) return 'Carregando...';
    const participant = participants.find(p => p.id === id);
    return participant ? participant.nickname : 'Desconhecido';
  };

  return (
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

        {config.mode === 'doubles' && config.doublesMode === 'predefined' && (
          <>
            <Separator className="bg-white/20" />
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Configuração de Duplas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="teamName" className="text-white">Nome da Dupla</Label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="Ex: Os Campeões"
                    className="bg-white/10 border-white/20 text-white"
                    disabled={config.created}
                  />
                </div>
                <div>
                  <Label htmlFor="player1" className="text-white">Jogador 1</Label>
                  <Select
                    value={newTeam.player1Id}
                    onValueChange={(value) => setNewTeam({ ...newTeam, player1Id: value })}
                    disabled={config.created}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione o jogador 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((participant) => (
                        <SelectItem key={participant.id} value={participant.id}>
                          {participant.nickname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="player2" className="text-white">Jogador 2</Label>
                  <Select
                    value={newTeam.player2Id}
                    onValueChange={(value) => setNewTeam({ ...newTeam, player2Id: value })}
                    disabled={config.created}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione o jogador 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((participant) => (
                        <SelectItem key={participant.id} value={participant.id}>
                          {participant.nickname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addTeam} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={config.created}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Dupla
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">Duplas Cadastradas ({config.teams.length})</h4>
                {config.teams.length === 0 ? (
                  <p className="text-gray-400">Nenhuma dupla cadastrada.</p>
                ) : (
                  <div className="grid gap-3">
                    {config.teams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div>
                          <p className="text-white font-medium">{team.name}</p>
                          <p className="text-gray-400 text-sm">
                            {getParticipantName(team.player1Id)} + {getParticipantName(team.player2Id)}
                          </p>
                        </div>
                        {!config.created && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTeam(team.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
          </>
        )}
      </CardContent>
    </Card>
  );
};
