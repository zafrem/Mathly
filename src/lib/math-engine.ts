export type OperationType = 
  | 'addition' | 'subtraction' | 'multiplication' | 'division' 
  | 'gcd' | 'lcm' 
  | 'fraction_addition' | 'fraction_subtraction' | 'fraction_multiplication' | 'fraction_division'
  // Level 2
  | 'integer_addition' | 'integer_multiplication' 
  | 'equation_simple' | 'exponent_basic' | 'square_root'
  // Level 3
  | 'quadratic_vertex' | 'log_basic' | 'exp_neural';

export interface Problem {
  id: string;
  num1: number;
  num2: number;
  denom1?: number;
  denom2?: number;
  operator: string;
  answer: number;
  answerDenom?: number;
  type: OperationType;
  digits: number;
  factors1?: number[];
  factors2?: number[];
  equationVar?: string;
  base?: number;
}

const calculateGCD = (a: number, b: number): number => {
  return b === 0 ? a : calculateGCD(b, a % b);
};

const simplify = (num: number, denom: number): [number, number] => {
  const common = calculateGCD(Math.abs(num), Math.abs(denom));
  return [num / common, denom / common];
};

const getPrimeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  let temp = Math.abs(n);
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

export const generateProblem = (type: OperationType, digits: number): Problem => {
  const min = Math.pow(10, Math.max(0, digits - 1));
  const max = Math.pow(10, digits) - 1;

  let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
  let num2 = Math.floor(Math.random() * (max - min + 1)) + min;
  let operator = '';
  let answer = 0;
  let denom1, denom2, answerDenom;
  let equationVar;
  let base;

  // Helpers for fractions
  const genFrac = () => {
    const d = Math.floor(Math.random() * 8) + 2;
    const n = Math.floor(Math.random() * (d - 1)) + 1;
    return [n, d];
  };

  // Helper for signed numbers
  const genSigned = (d: number) => {
    const val = Math.floor(Math.random() * (Math.pow(10, d) - 1)) + 1;
    return Math.random() > 0.5 ? val : -val;
  };

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
      num2 = Math.floor(Math.random() * (Math.pow(10, Math.min(digits, 2)) - 1)) + 1;
      answer = num1 * num2;
      break;
    case 'division':
      operator = '÷';
      num2 = Math.floor(Math.random() * 8) + 2;
      answer = Math.floor(Math.random() * (max - min + 1)) + min;
      num1 = answer * num2;
      break;
    case 'gcd':
      operator = 'GCD';
      answer = calculateGCD(num1, num2);
      break;
    case 'lcm':
      operator = 'LCM';
      const lMin = Math.pow(10, Math.max(0, digits - 2));
      const lMax = Math.max(lMin + 5, Math.pow(10, Math.max(1, digits - 1)) * 3);
      num1 = Math.floor(Math.random() * (lMax - lMin + 1)) + lMin;
      num2 = Math.floor(Math.random() * (lMax - lMin + 1)) + lMin;
      answer = (num1 * num2) / calculateGCD(num1, num2);
      break;
    
    case 'fraction_addition':
      operator = '+';
      [num1, denom1] = genFrac(); [num2, denom2] = genFrac();
      [answer, answerDenom] = simplify(num1 * denom2 + num2 * denom1, denom1 * denom2);
      break;
    case 'fraction_subtraction':
      operator = '-';
      [num1, denom1] = genFrac(); [num2, denom2] = genFrac();
      if (num1/denom1 < num2/denom2) { [num1, num2] = [num2, num1]; [denom1, denom2] = [denom2, denom1]; }
      [answer, answerDenom] = simplify(num1 * denom2 - num2 * denom1, denom1 * denom2);
      break;
    case 'fraction_multiplication':
      operator = '×';
      [num1, denom1] = genFrac(); [num2, denom2] = genFrac();
      [answer, answerDenom] = simplify(num1 * num2, denom1 * denom2);
      break;
    case 'fraction_division':
      operator = '÷';
      [num1, denom1] = genFrac(); [num2, denom2] = genFrac();
      [answer, answerDenom] = simplify(num1 * denom2, denom1 * num2);
      break;

    // Level 2
    case 'integer_addition':
      num1 = genSigned(digits);
      num2 = genSigned(digits);
      operator = '+';
      answer = num1 + num2;
      break;
    case 'integer_multiplication':
      num1 = genSigned(Math.min(digits, 2));
      num2 = genSigned(Math.min(digits, 2));
      operator = '×';
      answer = num1 * num2;
      break;
    case 'equation_simple':
      // x + a = b or x - a = b
      answer = genSigned(digits); // x
      num2 = Math.floor(Math.random() * (Math.pow(10, digits) - 1)) + 1; // a (always positive)
      const isAdd = Math.random() > 0.5;
      operator = isAdd ? '+' : '-';
      num1 = isAdd ? answer + num2 : answer - num2; // b
      equationVar = 'x';
      break;
    case 'exponent_basic':
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 3) + 2;
      operator = '^';
      answer = Math.pow(num1, num2);
      break;
    case 'square_root':
      answer = Math.floor(Math.random() * 20) + 2;
      num1 = answer * answer;
      operator = '√';
      break;

    // Level 3
    case 'quadratic_vertex':
      // f(x) = (x - h)^2 + k
      answer = genSigned(1); // h
      num1 = answer;
      num2 = Math.floor(Math.random() * 10) + 1; // k
      operator = 'min';
      break;
    case 'log_basic':
      base = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
      answer = Math.floor(Math.random() * 3) + 1;
      num1 = Math.pow(base, answer);
      num2 = base;
      operator = 'log';
      break;
    case 'exp_neural':
      num1 = [2, 3][Math.floor(Math.random() * 2)];
      num2 = Math.floor(Math.random() * 5);
      answer = Math.pow(num1, num2);
      operator = 'exp';
      break;
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    num1, num2, denom1, denom2,
    operator, answer, answerDenom,
    type, digits,
    factors1: getPrimeFactors(num1),
    factors2: getPrimeFactors(num2),
    equationVar,
  };
};
