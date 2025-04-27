import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { CreateTournamentForm } from "@/components/tournaments/CreateTournamentForm";

// Mock data for tournaments
const MOCK_TOURNAMENTS = [
  { 
    id: "t1", 
    name: "Snake Masters Championship", 
    startDate: "2025-05-15T14:00:00", 
    participants: 32,
    maxParticipants: 32,
    status: "upcoming",
    registered: false
  },
  { 
    id: "t2", 
    name: "Weekly Snake Challenge", 
    startDate: "2025-05-05T18:30:00", 
    participants: 12,
    maxParticipants: 16,
    status: "upcoming",
    registered: true
  },
  { 
    id: "t3", 
    name: "Pixel Serpent Cup", 
    startDate: "2025-04-20T15:00:00", 
    participants: 24,
    maxParticipants: 24,
    status: "completed",
    registered: true,
    position: 3
  },
  { 
    id: "t4", 
    name: "Snake Speedrun", 
    startDate: "2025-04-15T12:00:00", 
    participants: 8,
    maxParticipants: 8,
    status: "completed",
    registered: true,
    position: 1
  }
];

const Tournaments = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");
  const completedTournaments = tournaments.filter(t => t.status === "completed");
  
  const filteredUpcoming = upcomingTournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompleted = completedTournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRegister = (tournamentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to register for tournaments.",
        variant: "destructive",
      });
      return;
    }
    
    setTournaments(tournaments.map(t => 
      t.id === tournamentId 
        ? { ...t, registered: true, participants: t.participants + 1 } 
        : t
    ));
    
    toast({
      title: "Registration Successful",
      description: "You've successfully registered for the tournament!",
    });
  };
  
  const handleUnregister = (tournamentId: string) => {
    setTournaments(tournaments.map(t => 
      t.id === tournamentId 
        ? { ...t, registered: false, participants: t.participants - 1 } 
        : t
    ));
    
    toast({
      title: "Registration Canceled",
      description: "You've canceled your tournament registration.",
    });
  };
  
  const handleCreateTournament = (newTournament: any) => {
    setTournaments([newTournament, ...tournaments]);
    
    toast({
      title: "Tournament Created",
      description: "Your tournament has been created successfully!",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-snake-text">Tournaments</h1>
        
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-snake-primary hover:bg-purple-600">
                <Trophy className="mr-2 h-5 w-5" /> Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle>Create New Tournament</DialogTitle>
                <DialogDescription>
                  Set up a new tournament for other players to join.
                </DialogDescription>
              </DialogHeader>
              <CreateTournamentForm 
                onClose={() => setDialogOpen(false)}
                onCreate={handleCreateTournament}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-800 border-gray-700"
        />
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {filteredUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcoming.map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {searchQuery ? (
                <p>No upcoming tournaments match your search.</p>
              ) : (
                <>
                  <p className="text-xl mb-2">No upcoming tournaments</p>
                  {isAuthenticated && (
                    <p>Click "Create Tournament" to organize one!</p>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {filteredCompleted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompleted.map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {searchQuery ? (
                <p>No completed tournaments match your search.</p>
              ) : (
                <p>No tournaments have been completed yet.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tournaments;
