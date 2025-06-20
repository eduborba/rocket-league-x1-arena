
import { useState, useEffect } from 'react';
import { Participant, TournamentConfig } from '@/types/tournament';

export const useTournament = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [config, setConfig] = useState<TournamentConfig>({
    rounds: 1,
    participants: [],
    teams: [],
    matches: [],
    created: false,
    mode: 'individual',
    doublesMode: 'random',
    matchFormat: 'round-trip'
  });

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

  return {
    participants,
    config,
    saveParticipants,
    saveConfig,
    setParticipants,
    setConfig
  };
};
