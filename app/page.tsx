import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import UserMenu from "@/components/UserMenu";
import QuickAddText from "@/components/QuickAddText";
import type { Text } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: texts } = await supabase
    .from("texts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif text-zinc-800 mb-2">XNote</h1>
          <p className="text-zinc-500">德语锚点笔记系统</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/review"
            className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
          >
            进入复习
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* 快速添加课文 */}
      <section className="mb-12">
        <QuickAddText />
      </section>

      {/* 课文列表 */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-700 mb-4">课文列表</h2>

        {texts && texts.length > 0 ? (
          <ul className="space-y-3">
            {texts.map((text: Text) => (
              <li key={text.id}>
                <Link
                  href={`/reader/${text.id}`}
                  className="block p-4 bg-white rounded-lg border border-zinc-200 hover:border-sky-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-zinc-800">{text.title}</h3>
                      <p className="text-sm text-zinc-500">{text.category}</p>
                    </div>
                    <span className="text-zinc-400">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500 text-center py-12">暂无课文</p>
        )}
      </section>
    </main>
  );
}