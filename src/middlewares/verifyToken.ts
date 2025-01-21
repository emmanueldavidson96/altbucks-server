import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import env from '../utils/validateEnv';

interface DecodedToken extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const verifyToken = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.cookies.altbucksToken;
  if (!token) {
    throw next(createHttpError(401, 'No token found!'));
  }
  try {
    const decodedToken = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
    if (!decodedToken) {
      throw createHttpError(401, 'Something wrong with user token');
    }
    request.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.error(error);
    return next(createHttpError(401, 'Token verification failed!'));
  }
};

export default verifyToken;
