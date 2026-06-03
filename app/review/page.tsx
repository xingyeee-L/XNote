"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Check, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Note, Text } from "@/types";
import ReactMarkdown from "react-markdown";

interface FlashcardItem {
  note: Note;
  sourceText: Text;
  sourceSentence: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hardCount, setHardCount] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    // 获取所有卡片
    const { data: notes } = await supabase.from("notes").select("*");

    if (!notes) return;

    // 随机获取一些卡片作为复习材料 (V1 简化版)
    const shuffled = [...notes].sort(() => Math.random() - 0.5).slice(0, 10);

    // 获取每张卡片关联的课文原句
    const flashcardItems: FlashcardItem[] = [];

    for (const note of shuffled) {
      const { data: texts } = await supabase
        .from("texts")
        .select("*")
        .contains("tokens", [{ note_id: note.id }])
        .limit(1);

      if (texts && texts.length > 0) {
        const text = texts[0];
        // 提取包含该词的句子
        const sentence = extractSentence(text.tokens, note.id);
        flashcardItems.push({
          note,
          sourceText: text,
          sourceSentence: sentence,
        });
      }
    }

    setCards(flashcardItems);
  };

  const extractSentence = (tokens: any[], noteId: number): string => {
    // 简单实现：找到包含 noteId 的 token 附近文本
    let result = "";
    let found = false;

    for (const token of tokens) {
      result += token.t;
      if (token.note_id === noteId) found = true;
      if (found && token.t.includes(".")) break;
      if (result.length > 200) break;
    }

    return result || "无法提取句子";
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  const handleHard = () => {
    const currentCard = cards[currentIndex];
    const currentCount = hardCount[currentCard.note.id] || 0;

    if (currentCount >= 1) {
      // 达到2次Hard后，视为已掌握，移出队列
      // 使用 filter 彻底移除该卡片
      setCards(prev => prev.filter(c => c.note.id !== currentCard.note.id));
      // 如果当前是最后一张，标记完成
      if (currentIndex >= cards.length - 1) {
        setFinished(true);
      }
    } else {
      // 第一次Hard：插入到队列末尾
      setHardCount((prev) => ({ ...prev, [currentCard.note.id]: currentCount + 1 }));
      const newCards = [...cards];
      const [removed] = newCards.splice(currentIndex, 1);
      newCards.push(removed);
      setCards(newCards);
      setRevealed(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setRevealed(false);
    setHardCount({});
    setFinished(false);
    loadCards();
  };

  if (cards.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">加载中...</p>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-serif text-zinc-800 mb-4">复习完成!</h2>
          <p className="text-zinc-500 mb-8">今天的任务已完成，记得明天再来</p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            重新开始
          </button>
        </div>
      </main>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-500" />
          </Link>
          <span className="text-sm text-zinc-500">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Card */}
        <div className="relative bg-white rounded-xl shadow-lg p-8 min-h-[300px]">
          {/* Front - Question */}
          <div className="flashcard-front">
            <p className="text-lg text-zinc-600 mb-4">填入恰当的词汇：</p>
            <p className="text-2xl font-serif text-zinc-800 leading-relaxed">
              {maskWord(currentCard.sourceSentence, currentCard.note.word)}
            </p>
          </div>

          {/* Back - Answer */}
          <div className="flashcard-back">
            <p className="text-lg text-zinc-600 mb-2">{currentCard.note.word}</p>
            {currentCard.note.inflections.length > 0 && (
              <p className="text-sm text-zinc-400 mb-4">
                变形: {currentCard.note.inflections.join(", ")}
              </p>
            )}
            <div className="prose prose-zinc prose-sm">
              <ReactMarkdown>{currentCard.note.explanation}</ReactMarkdown>
            </div>
          </div>

          {/* Blur overlay when not revealed */}
          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-sm w-full h-full rounded-xl flex items-center justify-center">
                <button
                  onClick={handleReveal}
                  className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  揭晓答案
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {revealed && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handleHard}
              className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors min-w-[120px] justify-center"
            >
              <X size={20} />
              困难
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors min-w-[120px] justify-center"
            >
              <Check size={20} />
              记住
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function maskWord(sentence: string, word: string): string {
  // 将句子中的 word 替换为 ____
  const regex = new RegExp(word, "gi");
  return sentence.replace(regex, "______");
}