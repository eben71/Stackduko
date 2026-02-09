import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { getProgress } from "@/game/state/storage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("settings-high-contrast", settings.highContrast);
    root.classList.toggle("settings-large-text", settings.largeText);
    root.setAttribute("data-tutorial-tips", settings.tutorialTips ? "on" : "off");
  }, [settings.highContrast, settings.largeText, settings.tutorialTips]);

  useEffect(() => {
    getProgress();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
