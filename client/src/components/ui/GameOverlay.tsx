import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSubmitScore } from '@/hooks/use-game-api';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Input } from './input';
import { Trophy, Clock, RotateCcw, Play, Pause, X } from 'lucide-react';
import { format } from 'date-fns';

export function GameOverlay() {
  const { 
    score, 
    timeSeconds, 
    isPaused, 
    isGameOver, 
    gameWon,
    difficulty,
    incrementTime,
    pauseGame,
    resumeGame,
    resetGame,
    startGame,
    username,
    userId,
    setUser
  } = useGameStore();

  const [inputName, setInputName] = useState(username || '');
  const submitScoreMutation = useSubmitScore();

  // Timer Effect
  useEffect(() => {
    if (!isPaused && !isGameOver && score > 0) { // Start timer when first points scored or game active
        const interval = setInterval(incrementTime, 1000);
        return () => clearInterval(interval);
    }
  }, [isPaused, isGameOver, score]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitScore = async () => {
    if (!userId) {
        // In a real app we'd create the user first
        // For MVP we just submit
    }
    
    // For this demo, let's pretend we have a user ID if one isn't set
    const finalUserId = userId || 1; 

    try {
        await submitScoreMutation.mutateAsync({
            userId: finalUserId,
            score,
            timeSeconds,
            difficulty,
            completed: gameWon,
            seed: 'daily-123'
        });
        resetGame();
    } catch (e) {
        console.error("Failed to submit score", e);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-6 pointer-events-none">
      {/* HUD Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-4"
        >
            <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-center min-w-[120px]">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Score</span>
                <span className="text-3xl font-display text-primary">{score}</span>
            </div>
            
            <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-center min-w-[100px]">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Time</span>
                <div className="flex items-center gap-1 text-xl font-mono text-foreground">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatTime(timeSeconds)}
                </div>
            </div>
        </motion.div>

        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2"
        >
            <Button 
                variant="outline" 
                size="icon" 
                className="glass-button w-12 h-12 rounded-xl"
                onClick={isPaused ? resumeGame : pauseGame}
            >
                {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            </Button>
            <Button 
                variant="destructive" 
                size="icon" 
                className="w-12 h-12 rounded-xl shadow-lg shadow-destructive/20"
                onClick={resetGame}
            >
                <X className="w-5 h-5" />
            </Button>
        </motion.div>
      </div>

      {/* Game Over / Pause Modals */}
      <AnimatePresence>
        {isPaused && (
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto flex items-center justify-center">
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel p-8 rounded-3xl max-w-md w-full text-center"
             >
                <h2 className="text-4xl font-display mb-2 text-primary">Paused</h2>
                <p className="text-muted-foreground mb-8">Take a breath, the tiles aren't going anywhere.</p>
                <Button onClick={resumeGame} size="lg" className="w-full text-lg h-14 rounded-xl">
                    Resume Game
                </Button>
             </motion.div>
           </div>
        )}

        {isGameOver && (
           <div className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto flex items-center justify-center">
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border-4 border-primary/10"
             >
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                
                <h2 className="text-4xl font-display mb-2 text-foreground">
                    {gameWon ? "Level Complete!" : "Game Over"}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                    You scored <strong className="text-primary">{score}</strong> points in {formatTime(timeSeconds)}.
                </p>

                <div className="space-y-4">
                    {!username && (
                        <div className="text-left bg-muted/30 p-4 rounded-xl">
                            <label className="text-xs font-bold text-muted-foreground mb-1 block">ENTER NAME TO SAVE SCORE</label>
                            <Input 
                                placeholder="Player One" 
                                value={inputName} 
                                onChange={(e) => setInputName(e.target.value)}
                                className="bg-white border-2 border-primary/20 focus:border-primary"
                            />
                        </div>
                    )}
                    
                    <Button 
                        onClick={handleSubmitScore} 
                        size="lg" 
                        className="w-full text-lg h-14 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/25"
                        disabled={submitScoreMutation.isPending}
                    >
                        {submitScoreMutation.isPending ? "Saving..." : "Save & Continue"}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        onClick={resetGame}
                        className="w-full"
                    >
                        Return to Menu
                    </Button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
