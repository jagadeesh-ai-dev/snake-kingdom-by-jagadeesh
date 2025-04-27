
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
import { Trophy, Calendar, Users, Clock } from "lucide-react";

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

const TournamentCard = ({ tournament, onRegister, onUnregister }) => {
  const isUpcoming = tournament.status === "upcoming";
  const isCompleted = tournament.status === "completed";
  const isFull = tournament.participants >= tournament.maxParticipants;
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
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
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-gray-300">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(tournament.startDate)}</span>
        </div>
        
        <div className="flex items-center text-gray-300">
          <Users className="h-4 w-4 mr-2" />
          <span>{tournament.participants}/{tournament.maxParticipants} participants</span>
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

const CreateTournamentForm = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const { toast } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !date || !time) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a combined date/time string
    const startDate = `${date}T${time}:00`;
    
    // Create new tournament
    const newTournament = {
      id: `t${Date.now()}`,
      name,
      startDate,
      participants: 1, // Creator is first participant
      maxParticipants,
      status: "upcoming",
      registered: true,
    };
    
    onCreate(newTournament);
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tournament Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter tournament name"
          className="bg-gray-800 border-gray-700"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Maximum Participants</label>
        <Input
          type="number"
          min={2}
          max={64}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
          className="bg-gray-800 border-gray-700"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-snake-primary hover:bg-purple-600">
          Create Tournament
        </Button>
      </div>
    </form>
  );
};

const Tournaments = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filter tournaments by status
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");
  const completedTournaments = tournaments.filter(t => t.status === "completed");
  
  // Filter by search query
  const filteredUpcoming = upcomingTournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompleted = completedTournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRegister = (tournamentId) => {
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
  
  const handleUnregister = (tournamentId) => {
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
  
  const handleCreateTournament = (newTournament) => {
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
