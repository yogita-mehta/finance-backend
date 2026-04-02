import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Zod Validation Middleware
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
        return;
      }
      res.status(400).json({ error: 'Invalid data' });
      return;
    }
  };
};

// Global Error Handler Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error:', err.message || err, ']');

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON payload format' });
    return;
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
  return;
};
