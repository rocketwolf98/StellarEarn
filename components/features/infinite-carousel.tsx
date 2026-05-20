"use client";

import { useState } from "react";

export function InfiniteCarousel({ id, speed = 25, children }: { id: string; speed?: number; children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  
  return (
    <div
      className="relative h-48 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-5 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      
      <div
        className="flex flex-col animate-[scroll-up_linear_infinite]"
        id={id}
        style={{ animationDuration: `${speed}s`, animationPlayState: paused ? "paused" : "running" }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
