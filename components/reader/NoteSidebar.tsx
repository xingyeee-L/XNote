"use client";

import { useState } from "react";
import { X, ExternalLink, Loader2, Pencil, Save } from "lucide-react";
import type { Note } from "@/types";
import ReactMarkdown from "react-markdown";

interface NoteCard {
  note: Note;
  contextTexts: Array<{ id: number; title: string }>;
  loading: boolean;
}

interface SidebarProps {
  notes: NoteCard[];
  onClose: (noteId: number) => void;
  onContextLookup: (noteId: number) => void;
  onUpdateNote: (note: Note) => void;
}

export default function Sidebar({ notes, onClose, onContextLookup, onUpdateNote }: SidebarProps) {
  if (notes.length === 0) {
    return (
      <aside className="w-[350px] md:w-[400px] shrink-0 border-l border-zinc-200 bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400 text-sm">点击单词查看释义</p>
      </aside>
    );
  }

  return (
    <aside className="w-[350px] md:w-[400px] shrink-0 border-l border-zinc-200 bg-white overflow-y-auto">
      <div className="divide-y divide-zinc-100">
        {notes.map((item) => (
          <CardItem
            key={item.note.id}
            item={item}
            onClose={onClose}
            onContextLookup={onContextLookup}
            onUpdateNote={onUpdateNote}
          />
        ))}
      </div>
    </aside>
  );
}

interface CardItemProps {
  item: NoteCard;
  onClose: (noteId: number) => void;
  onContextLookup: (noteId: number) => void;
  onUpdateNote: (note: Note) => void;
}

function CardItem({ item, onClose, onContextLookup, onUpdateNote }: CardItemProps) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    word: item.note.word,
    inflections: item.note.inflections.join(", "),
    explanation: item.note.explanation,
    tags: item.note.tags.join(", "),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updatedNote: Note = {
      ...item.note,
      word: editForm.word,
      inflections: editForm.inflections.split(",").map((s) => s.trim()).filter(Boolean),
      explanation: editForm.explanation,
      tags: editForm.tags.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(`/api/notes/${item.note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });

      if (res.ok) {
        onUpdateNote(updatedNote);
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="p-4 bg-amber-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-amber-600">编辑模式</span>
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-500">词汇</label>
            <input
              type="text"
              value={editForm.word}
              onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-zinc-300 rounded focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500">变形（逗号分隔）</label>
            <input
              type="text"
              value={editForm.inflections}
              onChange={(e) => setEditForm({ ...editForm, inflections: e.target.value })}
              placeholder="bestellte, bestellt"
              className="w-full mt-1 px-2 py-1.5 text-sm border border-zinc-300 rounded focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500">标签（逗号分隔）</label>
            <input
              type="text"
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              placeholder="vital, Lektion 1"
              className="w-full mt-1 px-2 py-1.5 text-sm border border-zinc-300 rounded focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500">释义（支持 Markdown）</label>
            <textarea
              value={editForm.explanation}
              onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
              rows={4}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-zinc-300 rounded focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h2 className="text-xl font-serif text-zinc-800">{item.note.word}</h2>
          {item.note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-sky-100 text-sky-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"
            title="编辑"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onClose(item.note.id)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Inflections */}
      {item.note.inflections.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-medium text-zinc-400 mb-0.5">变形</h3>
          <p className="text-sm text-zinc-600">{item.note.inflections.join(", ")}</p>
        </div>
      )}

      {/* Explanation */}
      <div className="mb-3">
        <h3 className="text-xs font-medium text-zinc-400 mb-0.5">释义</h3>
        <div className="prose prose-zinc prose-sm">
          <ReactMarkdown>{item.note.explanation}</ReactMarkdown>
        </div>
      </div>

      {/* Context Links */}
      <div className="pt-2 border-t border-zinc-100">
        <h3 className="text-xs font-medium text-zinc-400 mb-1.5">语境回溯</h3>
        {item.loading ? (
          <Loader2 size={14} className="animate-spin text-zinc-400" />
        ) : item.contextTexts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.contextTexts.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => onContextLookup(item.note.id)}
                className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-1 rounded"
              >
                <ExternalLink size={12} />
                {ctx.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">暂无其他语境</p>
        )}
      </div>
    </div>
  );
}