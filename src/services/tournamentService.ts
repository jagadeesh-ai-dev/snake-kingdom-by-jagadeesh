
import { supabase } from "@/integrations/supabase/client";

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  max_participants: number;
  creator_id: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  participants?: number;
  registered?: boolean;
  position?: number;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  created_at: string;
  score: number | null;
}

export async function getAllTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, tournament_participants(*)');
    
  if (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
  
  const currentUserId = (await supabase.auth.getUser()).data.user?.id;
  
  // Transform the data to match our interface
  return data.map(tournament => {
    const participants = tournament.tournament_participants || [];
    const isRegistered = currentUserId ? participants.some((p: any) => p.user_id === currentUserId) : false;
    
    return {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      start_date: tournament.start_date,
      max_participants: tournament.max_participants,
      creator_id: tournament.creator_id,
      status: tournament.status as 'upcoming' | 'in_progress' | 'completed',
      participants: participants.length,
      registered: isRegistered
    };
  });
}

export async function createTournament(tournament: Omit<Tournament, 'id' | 'creator_id' | 'status' | 'participants' | 'registered'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User must be logged in to create a tournament');
  }
  
  // Create the tournament
  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      name: tournament.name,
      description: tournament.description,
      start_date: tournament.start_date,
      max_participants: tournament.max_participants,
      creator_id: userData.user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
  
  // Auto-register the creator
  await registerForTournament(data.id);
  
  return {
    ...data,
    status: data.status as 'upcoming' | 'in_progress' | 'completed',
    participants: 1,
    registered: true
  };
}

export async function registerForTournament(tournamentId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User must be logged in to register for a tournament');
  }
  
  const { error } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournamentId,
      user_id: userData.user.id
    });
  
  if (error) {
    console.error('Error registering for tournament:', error);
    throw error;
  }
  
  return true;
}

export async function unregisterFromTournament(tournamentId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User must be logged in to unregister from a tournament');
  }
  
  const { error } = await supabase
    .from('tournament_participants')
    .delete()
    .match({
      tournament_id: tournamentId,
      user_id: userData.user.id
    });
  
  if (error) {
    console.error('Error unregistering from tournament:', error);
    throw error;
  }
  
  return true;
}
