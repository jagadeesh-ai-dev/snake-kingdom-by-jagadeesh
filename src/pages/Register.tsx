
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const { success, error } = await register(email, username, password);
      
      if (success) {
        setSuccess(true);
        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account.",
        });
      } else {
        setError(error || "Username or email already exists");
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
        <div className="w-full max-w-md px-8 py-10 bg-snake-background border border-snake-primary/30 rounded-lg shadow-xl">
          <div className="text-center mb-6">
            <div className="bg-green-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-gray-400">
              We've sent a confirmation email to <span className="font-medium text-snake-primary">{email}</span>.
            </p>
          </div>
          
          <Alert className="mb-6 bg-gray-800 border-snake-primary/50">
            <Info className="h-4 w-4 text-snake-primary" />
            <AlertDescription>
              Please check your inbox (and spam folder) and click the confirmation link to activate your account.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-snake-primary hover:bg-purple-600"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
            
            <p className="text-center text-sm text-gray-400">
              Didn't receive the email? Check your spam folder or{" "}
              <Button variant="link" className="p-0 h-auto text-sm text-snake-primary" onClick={() => setSuccess(false)}>
                try again
              </Button>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-8 py-10 bg-snake-background border border-snake-primary/30 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">Join Snake Kingdom and start playing</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="coolsnake123"
              disabled={isLoading}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <Alert className="bg-gray-800 border-snake-primary/30">
            <AlertTriangle className="h-4 w-4 text-snake-primary" />
            <AlertDescription>
              You will need to confirm your email before being able to login.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              I agree to the{" "}
              <Link to="#" className="text-snake-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-snake-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-snake-primary hover:bg-purple-600"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-snake-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
