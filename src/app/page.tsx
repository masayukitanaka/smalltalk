'use client';

import { useState } from 'react';
import questionsData from '../docs/questions-ja.json';

interface CardData {
  id: number;
  category: string;
  topic: string;
  backgroundColor: string;
}

// シード値付き疑似乱数ジェネレーター
function seededRandom(seed: number) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// シード値を使ったFisher-Yatesシャッフルアルゴリズム
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// JSONデータからカードデータを生成してランダムに並び替え（固定シード値で毎回同じ順序）
const conversationTopics: CardData[] = shuffleArray(
  Object.entries(questionsData)
    .filter(([key]) => key !== 'lang')
    .flatMap(([_key, value]) => {
      const categoryData = value as { category: string; backgroundColor: string; questions: string[] };
      return categoryData.questions.map((question, index) => ({
        id: `${_key}-${index}`,
        category: categoryData.category,
        backgroundColor: categoryData.backgroundColor,
        topic: question,
      }));
    })
    .map((item, index) => ({
      ...item,
      id: index + 1,
    })),
  12345 // 固定シード値（変更すると並び順が変わります）
);

function Card({ card }: { card: CardData }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="card-container h-40 w-full cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`card-inner relative h-full w-full transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* カード表面 */}
        <div className={`card-face card-front absolute h-full w-full backface-hidden rounded-lg bg-gradient-to-br ${card.backgroundColor} p-6 flex items-center justify-center shadow-lg`}>
          <div className="text-white text-center">
            <div className="text-lg font-bold">{card.category}</div>
          </div>
        </div>

        {/* カード裏面 */}
        <div className="card-face card-back absolute h-full w-full backface-hidden rounded-lg bg-white p-6 flex items-center justify-center shadow-lg rotate-y-180 border-2 border-gray-200">
          <p className="text-gray-800 text-center text-sm font-medium leading-relaxed">
            {card.topic}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-white">
          雑談ネタカード
        </h1>
        <div className="text-center mb-4">
          <a
            href="https://forms.gle/1oYUy1vV6k4AsbcK9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline"
          >
            要望や質問などはこちら
          </a>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          カードをタップして話題を見つけよう
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {conversationTopics.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
