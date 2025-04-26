
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Gamepad, Trophy, User, LogOut, Settings } from "lucide-react";

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 py-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-bold tracking-tight text-white bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
              Snake Kingdom
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white hover:text-purple-200 transition-colors">Home</Link>
            <Link to="/game" className="text-white hover:text-purple-200 transition-colors">Play</Link>
            <Link to="/leaderboard" className="text-white hover:text-purple-200 transition-colors">Leaderboard</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-purple-200 transition-colors">Dashboard</Link>
                <Link to="/profile" className="text-white hover:text-purple-200 transition-colors">Profile</Link>
              </>
            ) : null}
          </nav>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="hidden md:flex items-center gap-2 text-white hover:text-purple-200 transition-colors">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.username} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-white" />
                  )}
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-red-300 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="py-6 bg-snake-background border-t border-snake-grid">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-snake-text opacity-70">
              © 2025 Snake Kingdom. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-snake-text hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-snake-text hover:text-purple-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      
      <div className="fixed bottom-4 left-4 right-4 md:hidden">
        <div className="bg-snake-primary bg-opacity-90 rounded-full flex justify-around p-3 shadow-lg">
          <Link to="/" className={`text-white p-2 ${location.pathname === "/" ? "bg-purple-700 rounded-full" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
          <Link to="/game" className={`text-white p-2 ${location.pathname === "/game" ? "bg-purple-700 rounded-full" : ""}`}>
            <Gamepad />
          </Link>
          <Link to="/leaderboard" className={`text-white p-2 ${location.pathname === "/leaderboard" ? "bg-purple-700 rounded-full" : ""}`}>
            <Trophy />
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`text-white p-2 ${location.pathname === "/dashboard" ? "bg-purple-700 rounded-full" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
              </Link>
              <Link to="/profile" className={`text-white p-2 ${location.pathname === "/profile" ? "bg-purple-700 rounded-full" : ""}`}>
                <Settings />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
