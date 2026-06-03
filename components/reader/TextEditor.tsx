"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Token } from "@/types";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  tokens: Token[];
  onTokensChange: (tokens: Token[]) => void;
  onTokenClick: (token: Token, index: number) => void;
  onCreateNote: (text: string, tokenIndex: number | null) => void;
  editMode: boolean;
  activeTokenIndex: number | null;
}

export default function TextEditor({
  tokens,
  onTokensChange,
  onTokenClick,
  onCreateNote,
  editMode,
  activeTokenIndex,
}: TextEditorProps) {
  const [selection, setSelection] = useState<{ text: string; tokenIndex: number | null }>({ text: "", tokenIndex: null });
  const selectionRef = useRef<{ text: string; tokenIndex: number | null }>({ text: "", tokenIndex: null });

  // 合并所有 token 为纯文本
  const plainText = tokens.map((t) => t.t).join("");

  // 处理选择文本创建笔记
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      selectionRef.current = { text: "", tokenIndex: null };
      setSelection({ text: "", tokenIndex: null });
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      selectionRef.current = { text: "", tokenIndex: null };
      setSelection({ text: "", tokenIndex: null });
      return;
    }

    // 计算选区起始位置对应的 token 索引
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const startPos = textarea.selectionStart;
      let charCount = 0;
      let tokenIndex = 0;
      for (let i = 0; i < tokens.length; i++) {
        const tokenLen = tokens[i].t.length;
        if (charCount + tokenLen > startPos) {
          tokenIndex = i;
          break;
        }
        charCount += tokenLen;
      }
      selectionRef.current = { text, tokenIndex };
      setSelection({ text, tokenIndex });
    } else {
      selectionRef.current = { text, tokenIndex: null };
      setSelection({ text, tokenIndex: null });
    }
  }, [tokens]);

  // 划词创建笔记
  const handleCreateNote = useCallback(() => {
    if (selectionRef.current.text) {
      onCreateNote(selectionRef.current.text, selectionRef.current.tokenIndex);
      selectionRef.current = { text: "", tokenIndex: null };
      setSelection({ text: "", tokenIndex: null });
      window.getSelection()?.removeAllRanges();
    }
  }, [onCreateNote]);

  // 编辑模式下显示文本框
  if (editMode) {
    return (
      <div className="relative">
        <textarea
          className="w-full min-h-[300px] p-4 font-serif text-xl leading-relaxed text-zinc-800 border-2 border-dashed border-zinc-300 rounded-lg focus:border-sky-400 focus:outline-none resize-none bg-white"
          value={plainText}
          onChange={(e) => {
            const text = e.target.value;
            // 简单解析：将文本按空格和标点分割为 tokens
            const newTokens: Token[] = text.split(/(\s+|[.,!?;:+-]+)/).filter(Boolean).map((t) => ({
              t,
              note_id: null, // 编辑时暂时清除绑定关系
            }));
            onTokensChange(newTokens);
          }}
          onMouseUp={handleMouseUp}
          placeholder="在此输入课文内容..."
        />

        {/* 划词创建笔记按钮 */}
        {selection.text && (
          <button
            className="absolute bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg hover:bg-zinc-700 z-10"
            style={{ top: 10, left: 20 }}
            onClick={handleCreateNote}
          >
            + 创建笔记
          </button>
        )}
      </div>
    );
  }

  // 阅读模式
  return (
    <div
      className="font-serif text-xl leading-relaxed text-zinc-800 cursor-text"
      onMouseUp={handleMouseUp}
    >
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
              isBound && !isActive && "border-b-2 border-dashed border-zinc-400 hover:border-sky-400 hover:text-sky-700",
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