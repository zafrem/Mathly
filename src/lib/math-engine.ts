export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface Problem {
  id: string;
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  type: OperationType;
  digits: number;
}

export const generateProblem = (type: OperationType, digits: number): Problem => {
  const min = Math.pow(10, digits - 1);
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
      // For multiplication, maybe limit second number digits to keep it manageable
      const multMax = Math.pow(10, Math.min(digits, 2)) - 1;
      const multMin = Math.pow(10, Math.min(digits, 1) - 1);
      num2 = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
      answer = num1 * num2;
      break;
    case 'division':
      operator = '÷';
      // Ensure clean division
      const divMax = Math.pow(10, Math.min(digits, 1)) - 1;
      const divMin = 2;
      num2 = Math.floor(Math.random() * (divMax - divMin + 1)) + divMin;
      answer = Math.floor(Math.random() * (max - min + 1)) + min;
      num1 = answer * num2;
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
  };
};

export const validateAnswer = (problem: Problem, userAnswer: number): boolean => {
  return problem.answer === userAnswer;
};
