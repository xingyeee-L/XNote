-- 插入示例课文
insert into texts (title, category, tokens) values
(
  'Lektion 1: Im Restaurant',
  'oral',
  '[
    {"t": "Guten", "note_id": null},
    {"t": " ", "note_id": null},
    {"t": "Abend", "note_id": 1},
    {"t": "!", "note_id": null},
    {"t": " ", "note_id": null},
    {"t": "Wir", "note_id": null},
    {"t": " ", "note_id": null},
    {"t": "möchten", "note_id": 2},
    {"t": " ", "note_id": null},
    {"t": "bestellen", "note_id": 3},
    {"t": ".", "note_id": null}
  ]'::jsonb
),
(
  'Lektion 2: Auf der Straße',
  'oral',
  '[
    {"t": "Entschuldigung", "note_id": 4},
    {"t": ", ", "note_id": null},
    {"t": "wo", "note_id": 5},
    {"t": " ", "note_id": null},
    {"t": "ist", "note_id": 6},
    {"t": " ", "note_id": null},
    {"t": "der", "note_id": 7},
    {"t": " ", "note_id": null},
    {"t": "Bahnhof", "note_id": 8},
    {"t": "?", "note_id": null}
  ]'::jsonb
);

-- 插入示例单词卡片
insert into notes (word, inflections, explanation, tags) values
(
  'Abend',
  ARRAY['Abende', 'Abends'],
  '**n.** 晚上，傍晚\n\n- Guten Abend! 晚上好！\n- Heute Abend 有空吗？',
  ARRAY['greeting', 'Lektion 1']
),
(
  'möchten',
  ARRAY['möchte', 'gemocht'],
  '**v.** 想要（委婉语气）\n\n对比：wollen（想要，语气直接）\n\n- Ich möchte bestellen. 我想点餐。',
  ARRAY['modal verb', 'Lektion 1']
),
(
  'bestellen',
  ARRAY['bestellte', 'bestellt'],
  '**v.** 点餐，预订\n\n固定搭配：etwas bestellen 点某物\n\n- Wir möchten bestellen. 我们想点餐。',
  ARRAY['vital', 'restaurant', 'Lektion 1']
),
(
  'Entschuldigung',
  ARRAY['Entschuldigungen'],
  '**interj.** 抱歉/打扰一下\n\n用于：\n1. 引起注意：Excuse me\n2. 道歉：Sorry\n3. 问路：Excuse me, where is...?',
  ARRAY['greeting', 'Lektion 2']
),
(
  'wo',
  ARRAY['wo'],
  '**adv.** 哪里，在哪里\n\n疑问词，用于询问地点\n\n- Wo ist der Bahnhof? 火车站在哪里？',
  ARRAY['question word', 'Lektion 2']
),
(
  'ist',
  ARRAY['bin', 'bist', 'sind', 'war', 'gewesen'],
  '**v.** 是（sein 的第三人称单数）\n\n- Wo ist der Bahnhof? 火车站在哪里？',
  ARRAY['verb', 'Lektion 2']
),
(
  'der',
  ARRAY['der', 'die', 'das', 'den', 'dem', 'des'],
  '**art.** 定冠词（阳性）\n\n德语有三个冠词：der（阳）, die（阴）, das（中）',
  ARRAY['grammar', 'Lektion 2']
),
(
  'Bahnhof',
  ARRAY['Bahnhöfe'],
  '**n.** 火车站\n\n词根：Bahn（火车）+ Hof（院子）\n\n- Der Bahnhof ist dort. 火站就在那里。',
  ARRAY['vocabulary', 'Lektion 2']
);