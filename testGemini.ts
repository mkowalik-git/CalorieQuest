import dotenv from 'dotenv';
dotenv.config();

import { analyzeMeal } from './services/geminiService.ts';

async function testAnalyzeMeal() {
  try {
    const result = await analyzeMeal('A plate of chicken breast with mashed potatoes and carrots');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnalyzeMeal();
