
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const success = await resetPassword(email);
      
      if (success) {
        setIsSubmitted(true);
        toast({
          title: "Password Reset Initiated",
          description: "Check your email for password reset instructions.",
        });
      } else {
        setError("Email not found. Please check your email address.");
      }
    } catch (err) {
      setError("An error occurred during password reset");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-8 py-10 bg-snake-background border border-snake-primary/30 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-gray-400">
            {!isSubmitted 
              ? "Enter your email to reset your password" 
              : "Check your email for reset instructions"}
          </p>
        </div>
        
        {!isSubmitted ? (
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
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-snake-primary hover:bg-purple-600"
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-snake-primary hover:underline">
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-gray-300">
              If an account exists with this email, you'll receive reset instructions.
              <br /><br />
              <span className="text-yellow-300">
                Note: For this demo, we've reset your password to "resetpassword"
              </span>
            </p>
            <Button 
              onClick={() => navigate("/login")} 
              className="bg-snake-primary hover:bg-purple-600"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
