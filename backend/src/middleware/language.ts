import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      language: 'en' | 'es';
    }
  }
}

export function languageMiddleware(req: Request, _res: Response, next: NextFunction) {
  const acceptLang = req.headers['accept-language'] || '';
  req.language = acceptLang.toLowerCase().startsWith('es') ? 'es' : 'en';
  next();
}
