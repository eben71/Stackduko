import React from "react";
import { StackdokuGame } from "@/game/StackdokuGame";
import { OverlayRoot } from "@/ui/OverlayRoot";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      <StackdokuGame />
      <OverlayRoot />
    </div>
  );
}
