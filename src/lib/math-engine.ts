export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'gcd' | 'lcm';

export interface Problem {
  id: string;
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  type: OperationType;
  digits: number;
  factors1?: number[];
  factors2?: number[];
}

const getPrimeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  let temp = n;
  while (temp >= d * d) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d++;
    }
  }
  if (temp > 1) factors.push(temp);
  return factors;
};

const calculateGCD = (a: number, b: number): number => {
  return b === 0 ? a : calculateGCD(b, a % b);
};

export const generateProblem = (type: OperationType, digits: number): Problem => {
  const min = Math.pow(10, Math.max(0, digits - 1));
  const max = Math.pow(10, digits) - 1;

  let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
  let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

  let operator = '';
  let answer = 0;

  switch (type) {
    case 'addition':
      operator = '+';
      answer = num1 + num2;
      break;
    case 'subtraction':
      operator = '-';
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      break;
    case 'multiplication':
      operator = '×';
      const multMax = Math.pow(10, Math.min(digits, 2)) - 1;
      const multMin = Math.pow(10, Math.min(digits, 1) - 1);
      num2 = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
      answer = num1 * num2;
      break;
    case 'division':
      operator = '÷';
      const divMax = Math.pow(10, Math.min(digits, 1)) - 1;
      const divMin = 2;
      num2 = Math.floor(Math.random() * (divMax - divMin + 1)) + divMin;
      answer = Math.floor(Math.random() * (max - min + 1)) + min;
      num1 = answer * num2;
      break;
    case 'gcd':
      operator = 'GCD';
      // Keep GCD numbers slightly smaller for mental math
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
      answer = calculateGCD(num1, num2);
      break;
    case 'lcm':
      operator = 'LCM';
      // For LCM, use smaller numbers to keep the answer within reasonable limits
      const lcmMin = Math.pow(10, Math.max(0, digits - 2));
      const lcmMax = Math.pow(10, Math.max(1, digits - 1)) * 5;
      num1 = Math.floor(Math.random() * (lcmMax - lcmMin + 1)) + lcmMin;
      num2 = Math.floor(Math.random() * (lcmMax - lcmMin + 1)) + lcmMin;
      answer = (num1 * num2) / calculateGCD(num1, num2);
      break;
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    num1,
    num2,
    operator,
    answer,
    type,
    digits,
    factors1: getPrimeFactors(num1),
    factors2: getPrimeFactors(num2),
  };
};

export const validateAnswer = (problem: Problem, userAnswer: number): boolean => {
  return problem.answer === userAnswer;
};
