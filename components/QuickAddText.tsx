"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export default function QuickAddText() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        setTitle("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入课文标题，按回车创建..."
        className="flex-1 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition-all"
      />
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
      </button>
    </form>
  );
}