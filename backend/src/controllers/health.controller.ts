import type { Request, Response } from 'express';

export const getHealth = async (_request: Request, response: Response): Promise<void> => {
  response.status(200).json({ status: 'ok' });
};
