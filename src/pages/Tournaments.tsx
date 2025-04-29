
import { useState, useEffect } from "react";
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
import { Trophy, Loader2 } from "lucide-react";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { CreateTournamentForm } from "@/components/tournaments/CreateTournamentForm";
import { getAllTournaments, registerForTournament, unregisterFromTournament, createTournament, Tournament } from "@/services/tournamentService";

const Tournaments = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const tournamentsData = await getAllTournaments();
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");
  const completedTournaments = tournaments.filter(t => t.status === "completed");
  
  const filteredUpcoming = upcomingTournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompleted = completedTournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRegister = async (tournamentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to register for tournaments.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await registerForTournament(tournamentId);
      
      // Update local state
      setTournaments(tournaments.map(t => 
        t.id === tournamentId 
          ? { ...t, registered: true, participants: (t.participants || 0) + 1 } 
          : t
      ));
      
      toast({
        title: "Registration Successful",
        description: "You've successfully registered for the tournament!",
      });
    } catch (error) {
      console.error('Error registering for tournament:', error);
      toast({
        title: "Registration Failed",
        description: "There was a problem with your registration. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUnregister = async (tournamentId: string) => {
    try {
      await unregisterFromTournament(tournamentId);
      
      // Update local state
      setTournaments(tournaments.map(t => 
        t.id === tournamentId 
          ? { ...t, registered: false, participants: Math.max(0, (t.participants || 0) - 1) } 
          : t
      ));
      
      toast({
        title: "Registration Canceled",
        description: "You've canceled your tournament registration.",
      });
    } catch (error) {
      console.error('Error unregistering:', error);
      toast({
        title: "Cancellation Failed",
        description: "There was a problem canceling your registration. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateTournament = async (newTournament: Omit<Tournament, 'id' | 'creator_id' | 'status' | 'participants' | 'registered'>) => {
    try {
      const createdTournament = await createTournament(newTournament);
      setTournaments([createdTournament, ...tournaments]);
      
      toast({
        title: "Tournament Created",
        description: "Your tournament has been created successfully!",
      });
      
      return true;
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Creation Failed",
        description: "There was a problem creating the tournament. Please try again.",
        variant: "destructive",
      });
      return false;
    }
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
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-snake-primary" />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Tournaments;
