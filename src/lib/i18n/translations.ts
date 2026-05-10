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
        title: "Level 1: Foundational Arithmetic",
        subtitle: "Speed & Accuracy",
        description: "Perfecting the four fundamental operations and number systems.",
        type: "speed"
      },
      l2: {
        title: "Level 2: Elementary Algebra",
        subtitle: "Variables & Equations",
        description: "Mastering variables (x, y) and solving linear equations.",
        type: "speed"
      },
      l3: {
        title: "Level 3: Optimization Foundations",
        subtitle: "Functions & Logs",
        description: "Understanding quadratic functions and logarithms for neural networks.",
        type: "speed"
      },
      l4: {
        title: "Level 4: Patterns & Uncertainty",
        subtitle: "Sequences & Probability",
        description: "Mastering Sigma (Σ) notation, counting, and basic distributions.",
        type: "concept"
      },
      l5: {
        title: "Level 5: Matrix Foundations",
        subtitle: "Linear Algebra I",
        description: "Training the language of data: vectors and matrix multiplication.",
        type: "visual"
      },
      l6: {
        title: "Level 6: Structural Analysis",
        subtitle: "Linear Algebra II",
        description: "Deep dive into Eigenvalues and SVD for dimensionality reduction.",
        type: "visual"
      },
      l7: {
        title: "Level 7: Gradient Calculus",
        subtitle: "Differentiation & Learning",
        description: "Mastering derivatives and the Chain Rule for backpropagation.",
        type: "visual"
      },
      l8: {
        title: "Level 8: Statistical Inference",
        subtitle: "Bayes & Optimization",
        description: "Advanced reasoning with Bayes' Theorem and convex optimization.",
        type: "concept"
      }
    },
    selection: {
      back: "Back to Curriculum",
      training: "Training",
      complexity: "Complexity",
      digits: "Digits",
      timer: "Timer",
      catArithmetic: "Arithmetic",
      catLogic: "Logic & Number",
      catFractions: "Fractions",
      catIntegers: "Integers (±)",
      catAlgebra: "Basic Algebra",
      catPowers: "Powers & Roots",
      catFunctions: "Functions & Logs",
      catOptimization: "Optimization"
    },
    operations: {
      addition: "Addition",
      subtraction: "Subtraction",
      multiplication: "Multiplication",
      division: "Division",
      gcd: "GCD",
      lcm: "LCM",
      fraction_addition: "Frac +",
      fraction_subtraction: "Frac -",
      fraction_multiplication: "Frac ×",
      fraction_division: "Frac ÷",
      integer_addition: "Integer +",
      integer_multiplication: "Integer ×",
      equation_simple: "Basic Eq (x)",
      exponent_basic: "Exponents",
      square_root: "Square Root",
      quadratic_vertex: "Quadratic Vertex",
      log_basic: "Logarithm",
      exp_neural: "Neural Exponent"
    },
    practiceInstructions: {
      addition: "Add",
      subtraction: "Subtract",
      multiplication: "Multiply",
      division: "Divide",
      gcd: "Find the greatest common divisor",
      lcm: "Find the least common multiple",
      fraction_addition: "Add the fractions",
      fraction_subtraction: "Subtract the fractions",
      fraction_multiplication: "Multiply the fractions",
      fraction_division: "Divide the fractions",
      integer_addition: "Add the integers",
      integer_multiplication: "Multiply the integers",
      equation_simple: "Solve for x",
      exponent_basic: "Calculate the power",
      square_root: "Find the square root",
      quadratic_vertex: "Find the vertex x (minimum point)",
      log_basic: "Calculate the value of the log",
      exp_neural: "Estimate the activation value"
    },
    help: {
      title: "How it works",
      close: "Close",
      ghostTitle: "Ghost Pace",
      ghostDesc: "Racing your past self! This blue bar represents your Personal Best for the current level. Break it to set a new record.",
      botTitle: "Rival Bot",
      botDesc: "Racing the computer! This red bar moves at a steady speed. Don't let it overtake you!"
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
      skip: "Skip Problem",
      numPlaceholder: "Num",
      denPlaceholder: "Den"
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
        title: "Level 1: 기초 연산",
        subtitle: "속도 & 정확도",
        description: "사칙연산과 수 체계를 완벽하게 이해하고 숙달합니다.",
        type: "속도"
      },
      l2: {
        title: "Level 2: 기초 대수",
        subtitle: "변수와 방정식",
        description: "변수(x, y)의 개념을 익히고 일차방정식을 해결합니다.",
        type: "속도"
      },
      l3: {
        title: "Level 3: 최적화 기초",
        subtitle: "함수와 로그",
        description: "이차함수와 지수/로그 등 신경망 기초 수학을 훈련합니다.",
        type: "속도"
      },
      l4: {
        title: "Level 4: 패턴과 확률",
        subtitle: "수열과 통계 기초",
        description: "시그마 기호, 경우의 수, 기본 확률 분포를 마스터합니다.",
        type: "개념"
      },
      l5: {
        title: "Level 5: 선형대수 기초",
        subtitle: "데이터의 언어 I",
        description: "벡터의 개념과 행렬 연산(곱셈)을 시각적으로 훈련합니다.",
        type: "시각화"
      },
      l6: {
        title: "Level 6: 선형대수 심화",
        subtitle: "데이터의 언어 II",
        description: "고유값, SVD 등 차원 축소의 핵심 원리를 이해합니다.",
        type: "시각화"
      },
      l7: {
        title: "Level 7: 미적분과 경사",
        subtitle: "미분과 학습",
        description: "미분계수와 연쇄법칙을 통해 역전파의 원리를 학습합니다.",
        type: "시각화"
      },
      l8: {
        title: "Level 8: 통계적 추론",
        subtitle: "베이즈 & 최적화",
        description: "베이즈 정리, MLE, 볼록 최적화 등 AI 심화 이론을 다룹니다.",
        type: "개념"
      }
    },
    selection: {
      back: "커리큘럼으로 돌아가기",
      training: "트레이닝",
      complexity: "난이도",
      digits: "자릿수",
      timer: "타이머",
      catArithmetic: "기초 연산",
      catLogic: "논리 및 수",
      catFractions: "분수 연산",
      catIntegers: "정수 연산 (±)",
      catAlgebra: "기초 대수",
      catPowers: "거듭제곱 및 제곱근",
      catFunctions: "함수와 로그",
      catOptimization: "최적화 기초"
    },
    operations: {
      addition: "덧셈",
      subtraction: "뺄셈",
      multiplication: "곱셈",
      division: "나눗셈",
      gcd: "최대공약수",
      lcm: "최소공배수",
      fraction_addition: "분수 덧셈",
      fraction_subtraction: "분수 뺄셈",
      fraction_multiplication: "분수 곱셈",
      fraction_division: "분수 나눗셈",
      integer_addition: "정수 덧셈",
      integer_multiplication: "정수 곱셈",
      equation_simple: "기초 방정식 (x)",
      exponent_basic: "거듭제곱",
      square_root: "제곱근",
      quadratic_vertex: "이차함수 꼭짓점",
      log_basic: "로그 계산",
      exp_neural: "신경망 지수"
    },
    practiceInstructions: {
      addition: "더하기",
      subtraction: "빼기",
      multiplication: "곱하기",
      division: "나누기",
      gcd: "최대공약수 구하기",
      lcm: "최소공배수 구하기",
      fraction_addition: "분수 더하기",
      fraction_subtraction: "분수 빼기",
      fraction_multiplication: "분수 곱하기",
      fraction_division: "분수 나누기",
      integer_addition: "정수 더하기",
      integer_multiplication: "정수 곱하기",
      equation_simple: "x 구하기",
      exponent_basic: "거듭제곱 계산",
      square_root: "제곱근 구하기",
      quadratic_vertex: "최솟값 x (꼭짓점) 찾기",
      log_basic: "로그 값 계산하기",
      exp_neural: "활성화 값 추정하기"
    },
    help: {
      title: "기능 설명",
      close: "닫기",
      ghostTitle: "고스트 페이스 (Ghost Pace)",
      ghostDesc: "과거의 나와 경쟁하세요! 파란색 바는 현재 레벨에서의 내 최고 기록(Personal Best)을 나타냅니다. 바보다 앞서나가 새로운 기록을 세워보세요.",
      botTitle: "라이벌 봇 (Rival Bot)",
      botDesc: "컴퓨터와 경쟁하세요! 빨간색 바는 일정한 속도로 움직입니다. 봇에게 추월당하지 않도록 빠르게 문제를 해결하세요!"
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
      skip: "문제 건너뛰기",
      numPlaceholder: "분자",
      denPlaceholder: "분모"
    }
  }
};
