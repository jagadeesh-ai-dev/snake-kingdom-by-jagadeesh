
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface CreateTournamentFormProps {
  onClose: () => void;
  onCreate: (tournament: any) => void;
}

export const CreateTournamentForm = ({ onClose, onCreate }: CreateTournamentFormProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !time) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const startDate = `${date}T${time}:00`;
    
    const newTournament = {
      id: `t${Date.now()}`,
      name,
      startDate,
      participants: 1,
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
