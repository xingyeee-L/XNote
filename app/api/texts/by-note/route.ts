import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  if (!noteId) {
    return NextResponse.json({ error: "noteId required" }, { status: 400 });
  }

  // 查询所有包含指定 note_id 的课文
  const { data, error } = await supabase
    .from("texts")
    .select("id, title, tokens")
    .contains("tokens", [{ note_id: parseInt(noteId) }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}