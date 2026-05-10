export type Language = 'en' | 'ko';

export type TranslationType = typeof translations.en;

export const translations = {
  en: {
    launcher: {
      tag: "Mathematical Training System",
      title: "Mathly",
      placeholder: "Enter your name to start...",
      unlockHint: "← Type your name to unlock the curriculum!",
      startTraining: "Start Training",
      topTrainees: "Top Trainees",
      noRankings: "No rankings yet",
      points: "Points",
      footer: "Specialized Mathematical Training System"
    },
    levels: {
      l1: {
        title: "Level 1: Basic Arithmetic",
        subtitle: "Speed & Accuracy Training",
        description: "Master the foundations of arithmetic: addition, subtraction, multiplication, and division.",
        type: "speed"
      },
      l2: {
        title: "Level 2: Number Systems & Algebra",
        subtitle: "Advanced Speed Training",
        description: "Explore integers, rational numbers, and basic algebraic operations.",
        type: "speed"
      },
      l3: {
        title: "Level 3: Discrete Math",
        subtitle: "Concept & Logic",
        description: "Develop logical thinking through sets, propositions, and combinatorics.",
        type: "concept"
      },
      l4: {
        title: "Level 4: Statistics",
        subtitle: "Concept & Analysis",
        description: "Learn the basics of data analysis: mean, variance, and probability.",
        type: "concept"
      },
      l5: {
        title: "Level 5: Linear Algebra",
        subtitle: "Visualization & Matrix",
        description: "Understand vectors and matrices through visual intuition and practice.",
        type: "visual"
      },
      l6: {
        title: "Level 6: Calculus",
        subtitle: "Visualization & AI Basics",
        description: "Master the concepts of derivatives and integrals with visual aids.",
        type: "visual"
      }
    },
    selection: {
      back: "Back to Curriculum",
      training: "Training",
      complexity: "Complexity",
      digits: "Digits",
      timer: "Timer"
    },
    practice: {
      getReady: "Get Ready",
      ghostPace: "Ghost Pace",
      rivalBot: "Rival Bot",
      sprintOver: "Sprint Over!",
      youScored: "you scored:",
      newPersonalBest: "NEW PERSONAL BEST!",
      beatBot: "YOU BEAT THE BOT!",
      lostToBot: "THE BOT WAS FASTER!",
      solved: "Solved",
      maxStreak: "Max Streak",
      tryAgain: "Try Again",
      backToSelection: "Back to Selection",
      skip: "Skip Problem"
    }
  },
  ko: {
    launcher: {
      tag: "수학적 사고 트레이닝 시스템",
      title: "Mathly",
      placeholder: "이름을 입력하고 시작하세요...",
      unlockHint: "← 이름을 입력하면 커리큘럼이 열립니다!",
      startTraining: "트레이닝 시작",
      topTrainees: "명예의 전당",
      noRankings: "기록이 없습니다",
      points: "점수",
      footer: "전문적인 수학 교육 트레이닝 시스템"
    },
    levels: {
      l1: {
        title: "Level 1: 기초연산",
        subtitle: "속도 & 정확도 트레이닝",
        description: "덧셈, 뺄셈, 곱셈, 나눗셈 등 연산의 기초를 다집니다.",
        type: "속도"
      },
      l2: {
        title: "Level 2: 수 체계와 대수",
        subtitle: "심화 속도 트레이닝",
        description: "정수, 유리수 및 기초 대수학 연산을 익힙니다.",
        type: "속도"
      },
      l3: {
        title: "Level 3: 이산수학",
        subtitle: "개념 & 논리",
        description: "집합, 명제, 경우의 수 등 논리적 사고를 기릅니다.",
        type: "개념"
      },
      l4: {
        title: "Level 4: 통계",
        subtitle: "개념 & 분석",
        description: "평균, 분산, 확률 등 데이터 분석의 기초를 배웁니다.",
        type: "개념"
      },
      l5: {
        title: "Level 5: 선형대수",
        subtitle: "시각화 & 행렬",
        description: "벡터와 행렬을 시각적으로 이해하고 연습합니다.",
        type: "시각화"
      },
      l6: {
        title: "Level 6: 미적분",
        subtitle: "시각화 & AI 기초",
        description: "변화율과 적분의 개념을 시각화로 마스터합니다.",
        type: "시각화"
      }
    },
    selection: {
      back: "커리큘럼으로 돌아가기",
      training: "트레이닝",
      complexity: "난이도",
      digits: "자릿수",
      timer: "타이머"
    },
    practice: {
      getReady: "준비하세요",
      ghostPace: "고스트 페이스",
      rivalBot: "라이벌 봇",
      sprintOver: "스프린트 종료!",
      youScored: "최종 점수:",
      newPersonalBest: "새로운 최고 기록!",
      beatBot: "봇을 이겼습니다!",
      lostToBot: "봇이 더 빨랐습니다!",
      solved: "해결함",
      maxStreak: "최대 스트릭",
      tryAgain: "다시 도전",
      backToSelection: "메뉴로 돌아가기",
      skip: "문제 건너뛰기"
    }
  }
};
