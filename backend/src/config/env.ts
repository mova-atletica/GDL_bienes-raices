import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/gdl_bienes_raices',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY || '',
};
