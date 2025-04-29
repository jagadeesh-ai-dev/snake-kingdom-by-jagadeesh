
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tournament } from "@/services/tournamentService";

interface CreateTournamentFormProps {
  onClose: () => void;
  onCreate: (tournament: Omit<Tournament, 'id' | 'creator_id' | 'status' | 'participants' | 'registered'>) => Promise<boolean>;
}

export const CreateTournamentForm = ({ onClose, onCreate }: CreateTournamentFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !time) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const start_date = `${date}T${time}:00`;
    
    setIsLoading(true);
    try {
      const success = await onCreate({
        name,
        description,
        start_date,
        max_participants: maxParticipants,
      });
      
      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
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
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter tournament description"
          className="bg-gray-800 border-gray-700"
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
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-snake-primary hover:bg-purple-600" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Tournament"}
        </Button>
      </div>
    </form>
  );
};
