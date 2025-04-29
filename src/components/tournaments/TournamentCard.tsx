
import { Trophy, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tournament } from "@/services/tournamentService";

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: (id: string) => void;
  onUnregister: (id: string) => void;
}

export const TournamentCard = ({ tournament, onRegister, onUnregister }: TournamentCardProps) => {
  const isUpcoming = tournament.status === "upcoming";
  const isCompleted = tournament.status === "completed";
  const isFull = (tournament.participants || 0) >= tournament.max_participants;
  
  const formatDate = (dateString: string) => {
    const options = { 
      month: "short" as const, 
      day: "numeric" as const, 
      hour: "2-digit" as const, 
      minute: "2-digit" as const
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  
  return (
    <div className="bg-gray-800 bg-opacity-30 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold">{tournament.name}</h3>
        {isCompleted && tournament.position === 1 && (
          <Trophy className="h-6 w-6 text-yellow-400" />
        )}
      </div>
      
      {tournament.description && (
        <p className="text-gray-400 mt-2 text-sm">{tournament.description}</p>
      )}
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-gray-300">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(tournament.start_date)}</span>
        </div>
        
        <div className="flex items-center text-gray-300">
          <Users className="h-4 w-4 mr-2" />
          <span>{tournament.participants || 0}/{tournament.max_participants} participants</span>
        </div>
      </div>
      
      <div className="mt-6">
        {isCompleted ? (
          <div className="bg-gray-700 text-center py-2 px-4 rounded">
            {tournament.position ? (
              <span className="font-medium">
                Finished {tournament.position === 1 ? "1st 🏆" : 
                        tournament.position === 2 ? "2nd 🥈" : 
                        tournament.position === 3 ? "3rd 🥉" : 
                        `${tournament.position}th`}
              </span>
            ) : (
              <span>Completed</span>
            )}
          </div>
        ) : tournament.registered ? (
          <div className="flex flex-col space-y-2">
            <div className="bg-green-800 bg-opacity-30 text-center py-2 rounded">
              <span className="text-green-400 font-medium">Registered</span>
            </div>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-900 hover:text-white hover:border-red-900"
              onClick={() => onUnregister(tournament.id)}
            >
              Cancel Registration
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full bg-snake-primary hover:bg-purple-600"
            disabled={isFull}
            onClick={() => onRegister(tournament.id)}
          >
            {isFull ? "Tournament Full" : "Register Now"}
          </Button>
        )}
      </div>
    </div>
  );
};
