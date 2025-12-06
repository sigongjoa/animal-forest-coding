import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 테스트 환경에서는 의도된 에러 테스트로 인한 로그 노이즈를 줄임
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error]', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || '요청을 처리할 수 없습니다';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode,
    },
  });
};
