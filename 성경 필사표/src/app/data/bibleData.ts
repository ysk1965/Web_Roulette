// 성경 데이터 타입 정의
export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  chapters: Chapter[];
}

// 샘플 성경 데이터 (요한복음 일부)
export const bibleBooks: Book[] = [
  {
    name: "요한복음",
    chapters: [
      {
        chapter: 1,
        verses: [
          { verse: 1, text: "태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라" },
          { verse: 2, text: "그가 태초에 하나님과 함께 계셨고" },
          { verse: 3, text: "만물이 그로 말미암아 지은 바 되었으니 지은 것이 하나도 그가 없이는 된 것이 없느니라" },
          { verse: 4, text: "그 안에 생명이 있었으니 이 생명은 사람들의 빛이라" },
          { verse: 5, text: "빛이 어둠에 비치되 어둠이 깨닫지 못하더라" },
        ],
      },
      {
        chapter: 3,
        verses: [
          { verse: 16, text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라" },
          { verse: 17, text: "하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 그로 말미암아 세상이 구원을 받게 하려 하심이라" },
        ],
      },
    ],
  },
  {
    name: "시편",
    chapters: [
      {
        chapter: 23,
        verses: [
          { verse: 1, text: "여호와는 나의 목자시니 내게 부족함이 없으리로다" },
          { verse: 2, text: "그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다" },
          { verse: 3, text: "내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다" },
          { verse: 4, text: "내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다" },
          { verse: 5, text: "주께서 내 원수의 목전에서 내게 상을 차려 주시고 기름을 내 머리에 부으셨으니 내 잔이 넘치나이다" },
          { verse: 6, text: "내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 살리로다" },
        ],
      },
    ],
  },
  {
    name: "창세기",
    chapters: [
      {
        chapter: 1,
        verses: [
          { verse: 1, text: "태초에 하나님이 천지를 창조하시니라" },
          { verse: 2, text: "땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라" },
          { verse: 3, text: "하나님이 이르시되 빛이 있으라 하시니 빛이 있었고" },
          { verse: 4, text: "빛이 하나님이 보시기에 좋았더라 하나님이 빛과 어둠을 나누사" },
          { verse: 5, text: "하나님이 빛을 낮이라 부르시고 어둠을 밤이라 부르시니라 저녁이 되고 아침이 되니 이는 첫째 날이니라" },
        ],
      },
    ],
  },
];
