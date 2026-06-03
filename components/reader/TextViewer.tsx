"use client";

import type { Token } from "@/types";
import { cn } from "@/lib/utils";

interface TextViewerProps {
  tokens: Token[];
  onTokenClick: (token: Token, index: number) => void;
  activeTokenIndex: number | null;
}

export default function TextViewer({ tokens, onTokenClick, activeTokenIndex }: TextViewerProps) {
  return (
    <div className="font-serif text-xl leading-relaxed text-zinc-800">
      {tokens.map((token, index) => {
        const isBound = token.note_id !== null;
        const isActive = activeTokenIndex === index;

        return (
          <span
            key={index}
            onClick={() => isBound && onTokenClick(token, index)}
            className={cn(
              "transition-all duration-200",
              isBound ? "cursor-pointer" : "cursor-default",
              // 锚点下划线样式
              isBound && !isActive && "border-b-2 border-dashed border-zinc-400 hover:border-sky-400 hover:text-sky-700",
              // 点击时的批注高亮效果
              isActive && "bg-amber-200 text-amber-900 rounded px-0.5 -mx-0.5 border-b-2 border-amber-400"
            )}
          >
            {token.t}
          </span>
        );
      })}
    </div>
  );
}