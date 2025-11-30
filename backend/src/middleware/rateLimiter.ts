import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitRecord;
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // 주기적으로 오래된 항목 정리
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();

      if (!this.store[key]) {
        this.store[key] = { count: 1, resetTime: now + this.windowMs };
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', this.maxRequests - 1);
        res.setHeader('X-RateLimit-Reset', this.store[key].resetTime);
        return next();
      }

      const record = this.store[key];

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + this.windowMs;
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', this.maxRequests - 1);
        res.setHeader('X-RateLimit-Reset', record.resetTime);
        return next();
      }

      record.count++;

      if (record.count > this.maxRequests) {
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', record.resetTime);
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));

        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '너무 많은 요청이 발생했습니다',
            statusCode: 429,
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          },
        });
      }

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - record.count);
      res.setHeader('X-RateLimit-Reset', record.resetTime);

      next();
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  destroy() {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
    }
  }
}
