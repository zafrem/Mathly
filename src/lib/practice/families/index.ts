import type { ComponentType } from 'react';
import type { CardProps, Family } from '../types';
import { ArithmeticCard } from './arithmetic';
import { FractionCard } from './fraction';
import { FactorHintCard } from './factor-hint';
import { NotationCard } from './notation';
import { EquationCard } from './equation';

export const FAMILY_CARDS: Record<Family, ComponentType<CardProps>> = {
  arithmetic: ArithmeticCard,
  fraction: FractionCard,
  'factor-hint': FactorHintCard,
  notation: NotationCard,
  equation: EquationCard,
};
