'use client';

import { useState, useEffect } from 'react';
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
  // ユニークなカテゴリーを取得
  const categories = Array.from(new Set(conversationTopics.map(card => card.category)));

  // 各カテゴリーの表示状態を管理（初期値は全て表示）
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories)
  );

  // 表示中のカードIDを管理
  const [visibleCardIds, setVisibleCardIds] = useState<Set<number>>(
    new Set(conversationTopics.map(card => card.id))
  );

  // フェードアウト中のカードIDを管理
  const [fadingOutCardIds, setFadingOutCardIds] = useState<Set<number>>(new Set());

  // カテゴリー選択が変更されたときの処理
  useEffect(() => {
    const newVisibleIds = new Set(
      conversationTopics
        .filter(card => selectedCategories.has(card.category))
        .map(card => card.id)
    );

    // 削除されるカードを特定
    const cardsToRemove = Array.from(visibleCardIds).filter(id => !newVisibleIds.has(id));

    if (cardsToRemove.length > 0) {
      // フェードアウトアニメーションを開始
      setFadingOutCardIds(new Set(cardsToRemove));

      // アニメーション完了後にカードを削除
      setTimeout(() => {
        setVisibleCardIds(newVisibleIds);
        setFadingOutCardIds(new Set());
      }, 250); // アニメーション時間と同じ
    } else {
      // 追加のみの場合は即座に反映
      setVisibleCardIds(newVisibleIds);
    }
  }, [selectedCategories]);

  // チェックボックスの状態を切り替える
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // すべて選択
  const selectAll = () => {
    setSelectedCategories(new Set(categories));
  };

  // すべて解除
  const deselectAll = () => {
    setSelectedCategories(new Set());
  };

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
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          カードをタップして話題を見つけよう
        </p>

        {/* カテゴリーフィルター */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              カテゴリーを選択
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              >
                すべて選択
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                すべて解除
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {conversationTopics
            .filter(card => visibleCardIds.has(card.id) || fadingOutCardIds.has(card.id))
            .map((card, index) => {
              const isFadingOut = fadingOutCardIds.has(card.id);
              const isFadingIn = visibleCardIds.has(card.id) && !isFadingOut;

              return (
                <div
                  key={card.id}
                  className={isFadingOut ? 'animate-fadeOut' : 'animate-fadeIn'}
                  style={{
                    animationDelay: isFadingIn ? `${index * 20}ms` : '0ms',
                    animationFillMode: 'both'
                  }}
                >
                  <Card card={card} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
