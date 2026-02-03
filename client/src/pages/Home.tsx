import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackdokuGame } from '@/game/StackdokuGame';
import { GameOverlay } from '@/components/ui/GameOverlay';
import { useGameStore, Difficulty } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Play, Settings, Trophy, Info } from 'lucide-react';
import { useScores } from '@/hooks/use-game-api';

function MainMenu() {
  const { startGame } = useGameStore();
  const [showScores, setShowScores] = useState(false);
  const { data: scores } = useScores();

  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 items-center">
        
        {/* Left Column: Title & Actions */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          <div>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-xs tracking-widest mb-4">
                WEB PUZZLE BETA
            </span>
            <h1 className="text-7xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 leading-[0.9]">
              Stack<br/>doku
            </h1>
            <p className="text-xl text-muted-foreground mt-6 font-medium max-w-md leading-relaxed">
              Unstack the tiles. Reveal the numbers. Solve the Sudoku hidden beneath.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-xs">
            <Button 
                size="lg" 
                className="h-16 text-xl rounded-2xl bg-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                onClick={() => startGame('medium')}
            >
                <Play className="mr-3 w-6 h-6 fill-current" /> Play Now
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
                <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl border-2 hover:bg-white hover:border-primary/50"
                    onClick={() => setShowScores(true)}
                >
                    <Trophy className="mr-2 w-5 h-5 text-yellow-500" /> Scores
                </Button>
                <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl border-2 hover:bg-white hover:border-primary/50"
                >
                    <Settings className="mr-2 w-5 h-5 text-slate-500" /> Options
                </Button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Hero Visual / High Scores */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative hidden lg:block h-[500px]"
        >
            {/* Abstract 3D stack visual constructed with CSS/Divs for the menu */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 relative transform rotate-x-6 rotate-y-6 rotate-z-12 preserve-3d animate-float">
                    <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-2 p-4 w-full h-full opacity-50">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-slate-100 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                    {/* Floating elements */}
                    <motion.div 
                        animate={{ y: [0, -20, 0] }} 
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute -top-10 -right-10 w-24 h-24 bg-primary rounded-2xl shadow-xl flex items-center justify-center text-white text-4xl font-display"
                    >
                        5
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, -15, 0] }} 
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-10 -left-10 w-20 h-20 bg-secondary rounded-2xl shadow-xl flex items-center justify-center text-white text-3xl font-display"
                    >
                        9
                    </motion.div>
                </div>
            </div>

            {/* High Score Panel Overlay */}
            <AnimatePresence>
                {showScores && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-display text-foreground">Leaderboard</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowScores(false)}>
                                <Info className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {scores?.map((score, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {i + 1}
                                        </div>
                                        <span className="font-semibold text-slate-700">{score.user?.username || 'Anonymous'}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-primary">{score.score}</div>
                                        <div className="text-xs text-muted-foreground">{score.difficulty}</div>
                                    </div>
                                </div>
                            ))}
                            {!scores?.length && (
                                <div className="text-center text-muted-foreground py-10">
                                    No scores yet. Be the first!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isPlaying } = useGameStore();

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="absolute inset-0 z-20"
          >
            <MainMenu />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <StackdokuGame />
            <GameOverlay />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
