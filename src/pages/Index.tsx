
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Gamepad, Trophy, Settings } from "lucide-react";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-[calc(100vh-13rem)] flex flex-col">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-snake-background to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Welcome to PixelDash Snake
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                Test your skills with our modern take on the classic snake game. Compete with friends, earn achievements, and climb the global leaderboard.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/game">
                  <Button className="pixel-button flex items-center gap-2 bg-snake-primary hover:bg-purple-600 text-white rounded-md px-6 py-3 text-lg">
                    <Gamepad size={20} />
                    Play Now
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" className="flex items-center gap-2 border-snake-primary text-snake-primary hover:bg-snake-primary hover:text-white rounded-md px-6 py-3 text-lg transition-colors">
                    <Trophy size={20} />
                    Leaderboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center animate-pulse-gentle">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-lg p-4 flex items-center justify-center shadow-lg">
                <div className="relative w-full h-full border-2 border-snake-grid grid grid-cols-10 grid-rows-10 gap-0.5">
                  {/* Sample snake visualization */}
                  <div className="absolute top-[40%] left-[10%] w-[10%] h-[10%] bg-snake-primary rounded-sm"></div>
                  <div className="absolute top-[40%] left-[20%] w-[10%] h-[10%] bg-snake-primary rounded-sm"></div>
                  <div className="absolute top-[40%] left-[30%] w-[10%] h-[10%] bg-snake-primary rounded-sm"></div>
                  <div className="absolute top-[40%] left-[40%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[30%] left-[40%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[20%] left-[40%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[20%] left-[50%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[20%] left-[60%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[30%] left-[60%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[40%] left-[60%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[50%] left-[60%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[60%] left-[60%] w-[10%] h-[10%] bg-snake-secondary rounded-sm"></div>
                  <div className="absolute top-[70%] left-[70%] w-[10%] h-[10%] bg-snake-food rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-snake-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-snake-text">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-700/50 rounded-full flex items-center justify-center mb-4">
                <Settings className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-snake-text">Multiple Difficulty Levels</h3>
              <p className="text-snake-text opacity-80">Challenge yourself with Easy, Medium, Hard, and Extreme modes to test your skills.</p>
            </div>
            <div className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-700/50 rounded-full flex items-center justify-center mb-4">
                <Trophy className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-snake-text">Global Leaderboard</h3>
              <p className="text-snake-text opacity-80">Compete with players worldwide and see your ranking on our global leaderboard.</p>
            </div>
            <div className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-700/50 rounded-full flex items-center justify-center mb-4">
                <Gamepad className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-snake-text">Modern Controls</h3>
              <p className="text-snake-text opacity-80">Enjoy smooth touch controls on mobile and keyboard controls on desktop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Play?</h2>
          <p className="text-xl mb-8 text-gray-200">Join thousands of players competing for the top score!</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link to="/game">
                <Button className="pixel-button flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-900 rounded-md px-8 py-4 text-lg">
                  <Gamepad size={20} />
                  Start Game
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button className="pixel-button flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-900 rounded-md px-8 py-4 text-lg">
                    Register Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-purple-900 rounded-md px-8 py-4 text-lg transition-colors">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
