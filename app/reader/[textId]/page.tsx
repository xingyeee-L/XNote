"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Text, Note, Token } from "@/types";
import TextEditor from "@/components/reader/TextEditor";
import NoteSidebar from "@/components/reader/NoteSidebar";
import ContextModal from "@/components/reader/ContextModal";
import CreateNoteModal from "@/components/reader/CreateNoteModal";

interface NoteCard {
  note: Note;
  contextTexts: Array<{ id: number; title: string }>;
  loading: boolean;
}

export default function ReaderPage() {
  const params = useParams();
  const textId = parseInt(params.textId as string);

  const [text, setText] = useState<Text | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [openNotes, setOpenNotes] = useState<NoteCard[]>([]);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const [createNoteModal, setCreateNoteModal] = useState<{ open: boolean; selectedText: string }>({ open: false, selectedText: "" });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [pendingTokenIndex, setPendingTokenIndex] = useState<number | null>(null);

  const loadText = useCallback(async () => {
    const { data } = await supabase
      .from("texts")
      .select("*")
      .eq("id", textId)
      .single();
    if (data) {
      setText(data);
      setTokens(data.tokens || []);
    }
  }, [textId]);

  useEffect(() => {
    loadText();
  }, [loadText]);

  const handleTokensChange = useCallback((newTokens: Token[]) => {
    setTokens(newTokens);
  }, []);

  const handleSave = useCallback(async () => {
    if (!text) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch(`/api/texts/${textId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      if (res.ok) {
        setSaveStatus("success");
        await loadText();
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }, [text, textId, tokens, loadText]);

  const handleTokenClick = useCallback(async (token: Token, tokenIndex: number) => {
    if (!token.note_id) return;

    setActiveTokenIndex(tokenIndex);
    setTimeout(() => setActiveTokenIndex(null), 300);

    // 如果已存在，不重复添加
    const exists = openNotes.some((item) => item.note.id === token.note_id);
    if (exists) return;

    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("id", token.note_id)
      .single();

    if (data) {
      setOpenNotes((prev) => [...prev, { note: data, contextTexts: [], loading: true }]);

      fetch(`/api/texts/by-note?noteId=${token.note_id}`)
        .then((res) => res.json())
        .then((texts) => {
          setOpenNotes((prev) =>
            prev.map((item) =>
              item.note.id === token.note_id
                ? { ...item, contextTexts: texts || [], loading: false }
                : item
            )
          );
        })
        .catch(() => {
          setOpenNotes((prev) =>
            prev.map((item) =>
              item.note.id === token.note_id ? { ...item, loading: false } : item
            )
          );
        });
    }
  }, [openNotes]);

  const handleCreateNote = useCallback((selectedText: string, tokenIndex: number | null) => {
    setCreateNoteModal({ open: true, selectedText });
    if (tokenIndex !== null) {
      setPendingTokenIndex(tokenIndex);
    }
  }, []);

  const handleNoteCreated = useCallback((note: Note) => {
    setCreateNoteModal({ open: false, selectedText: "" });
    // 如果有待绑定的 token 位置，将新笔记绑定到该 token
    if (pendingTokenIndex !== null) {
      setTokens((prev) => {
        const newTokens = [...prev];
        newTokens[pendingTokenIndex] = { ...newTokens[pendingTokenIndex], note_id: note.id };
        return newTokens;
      });
    }
    setPendingTokenIndex(null);
  }, [pendingTokenIndex]);

  const handleCloseNote = useCallback((noteId: number) => {
    setOpenNotes((prev) => prev.filter((item) => item.note.id !== noteId));
  }, []);

  const handleContextLookup = useCallback((noteId: number) => {
    setSelectedNoteId(noteId);
    setContextModalOpen(true);
  }, []);

  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setOpenNotes((prev) =>
      prev.map((item) =>
        item.note.id === updatedNote.id ? { ...item, note: updatedNote } : item
      )
    );
  }, []);

  return (
    <main className="h-screen flex flex-col bg-warm-50">
      {/* Header */}
      <div className="px-6 py-3 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
        <Link href="/" className="text-zinc-500 hover:text-zinc-700 transition-colors">
          ← 返回
        </Link>
        <div className="flex items-center gap-3">
          {editMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : saveStatus === "success" ? "已保存 ✓" : saveStatus === "error" ? "保存失败" : "保存"}
            </button>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              editMode ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {editMode ? "完成编辑" : "编辑"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          {text ? (
            <article className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-serif text-zinc-800 mb-6">{text.title}</h1>
              <TextEditor
                tokens={tokens}
                onTokensChange={handleTokensChange}
                onTokenClick={handleTokenClick}
                onCreateNote={handleCreateNote}
                editMode={editMode}
                activeTokenIndex={activeTokenIndex}
              />
            </article>
          ) : (
            <p className="text-zinc-500 text-center py-12">加载中...</p>
          )}
        </div>

        {/* Note sidebar */}
        <NoteSidebar
          notes={openNotes}
          onClose={handleCloseNote}
          onContextLookup={handleContextLookup}
          onUpdateNote={handleUpdateNote}
        />
      </div>

      <ContextModal
        noteId={selectedNoteId}
        open={contextModalOpen}
        onClose={() => setContextModalOpen(false)}
      />

      <CreateNoteModal
        open={createNoteModal.open}
        selectedText={createNoteModal.selectedText}
        onClose={() => setCreateNoteModal({ open: false, selectedText: "" })}
        onCreated={handleNoteCreated}
      />
    </main>
  );
}