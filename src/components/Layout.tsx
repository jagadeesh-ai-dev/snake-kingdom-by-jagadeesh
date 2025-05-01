
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Gamepad, Trophy, User, LogOut, Users, MessageSquare, Menu } from "lucide-react";
import { ReactNode, useState } from "react";
import { AppUser } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
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
              Hungry Snake
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white hover:text-purple-200 transition-colors">Home</Link>
            <Link to="/game" className="text-white hover:text-purple-200 transition-colors">Play</Link>
            <Link to="/leaderboard" className="text-white hover:text-purple-200 transition-colors">Leaderboard</Link>
            <Link to="/tournaments" className="text-white hover:text-purple-200 transition-colors">Tournaments</Link>
            <Link to="/friends" className="text-white hover:text-purple-200 transition-colors">Friends</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-white hover:text-purple-200 transition-colors">Dashboard</Link>
            ) : null}
          </nav>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:inline text-white">
                  {user?.username}
                </span>
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
            
            {/* Mobile Menu */}
            <div className="md:hidden ml-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-white p-2 rounded-md hover:bg-purple-800 transition-colors">
                    <Menu size={24} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-snake-background border-snake-grid">
                  <SheetHeader>
                    <SheetTitle className="text-snake-text">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col gap-4">
                    <Link to="/" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                      Home
                    </Link>
                    <Link to="/game" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                      <Gamepad size={20} /> Play
                    </Link>
                    <Link to="/leaderboard" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                      <Trophy size={20} /> Leaderboard
                    </Link>
                    <Link to="/tournaments" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                      <Trophy size={20} /> Tournaments
                    </Link>
                    <Link to="/friends" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                      <Users size={20} /> Friends
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link to="/messages" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                          <MessageSquare size={20} /> Messages
                        </Link>
                        <Link to="/dashboard" className="text-snake-text hover:text-purple-400 transition-colors flex items-center gap-2 py-2">
                          <User size={20} /> Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 py-2 mt-4"
                        >
                          <LogOut size={20} /> Logout
                        </button>
                      </>
                    )}
                    {!isAuthenticated && (
                      <Link 
                        to="/login" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-center mt-4"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="py-6 bg-snake-background border-t border-snake-grid">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-snake-text opacity-70">
              © 2025 Hungry Snake. All rights reserved.
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
          <Link to="/" className="text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
          <Link to="/game" className="text-white p-2">
            <Gamepad />
          </Link>
          <Link to="/leaderboard" className="text-white p-2">
            <Trophy />
          </Link>
          <Link to="/friends" className="text-white p-2">
            <Users />
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/messages" className="text-white p-2">
                <MessageSquare />
              </Link>
              <Link to="/dashboard" className="text-white p-2">
                <User />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
