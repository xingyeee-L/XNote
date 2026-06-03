"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Text, Token } from "@/types";
import { cn } from "@/lib/utils";

interface ContextModalProps {
  noteId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function ContextModal({ noteId, open, onClose }: ContextModalProps) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<Text | null>(null);
  const [highlightedTokens, setHighlightedTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (noteId && open) {
      setLoading(true);
      // 获取包含此 note_id 的课文
      fetch(`/api/texts/by-note?noteId=${noteId}`)
        .then((res) => res.json())
        .then(async (texts) => {
          if (texts && texts.length > 0) {
            const textData = texts[0];
            // 查找并高亮该词
            const highlighted = textData.tokens.map((token: Token) => ({
              ...token,
              highlighted: token.note_id === noteId,
            }));
            setText(textData);
            setHighlightedTokens(highlighted);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [noteId, open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="font-medium text-zinc-700">语境预览</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-zinc-400" />
            </div>
          ) : text ? (
            <div>
              <h4 className="font-serif text-xl text-zinc-800 mb-4">{text.title}</h4>
              <p className="font-serif text-lg leading-relaxed text-zinc-800">
                {highlightedTokens.map((token, index) => (
                  <span
                    key={index}
                    className={cn(
                      (token as Token & { highlighted?: boolean }).highlighted && "bg-sky-200 text-sky-800 px-1 rounded"
                    )}
                  >
                    {token.t}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-12">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}