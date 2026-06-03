export type Token = {
  t: string;           // 单词文本或符号
  note_id: number | null;  // 绑定的知识卡片 ID
};

export type Note = {
  id: number;
  word: string;
  inflections: string[];
  explanation: string;
  tags: string[];
  created_at: string;
};

export type Text = {
  id: number;
  title: string;
  category: string;
  tokens: Token[];
  created_at: string;
};

export type FlashcardItem = {
  note: Note;
  sourceText: Text;
  sourceSentence: string;  // 原句挖空后的句子
};