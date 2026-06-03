"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { Note } from "@/types";

interface CreateNoteModalProps {
  open: boolean;
  selectedText: string;
  onClose: () => void;
  onCreated: (note: Note) => void;
}

export default function CreateNoteModal({ open, selectedText, onClose, onCreated }: CreateNoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState("");
  const [inflections, setInflections] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");

  // 当弹窗打开且有选中文本时，初始化词汇
  useEffect(() => {
    if (open && selectedText) {
      setWord(selectedText);
    }
  }, [open, selectedText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !explanation) return;

    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          inflections: inflections.split(",").map((s) => s.trim()).filter(Boolean),
          explanation,
          tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const note = await res.json();
        onCreated(note);
        // 重置表单
        setWord("");
        setInflections("");
        setExplanation("");
        setTags("");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="font-medium text-zinc-800">创建笔记</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">词汇 *</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none"
              placeholder="输入词汇"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">变形（逗号分隔）</label>
            <input
              type="text"
              value={inflections}
              onChange={(e) => setInflections(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none"
              placeholder="bestellte, bestellt"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">标签（逗号分隔）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none"
              placeholder="vital, Lektion 1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">释义 *</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none resize-none"
              placeholder="输入释义"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            创建
          </button>
        </form>
      </div>
    </div>
  );
}