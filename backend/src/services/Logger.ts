/**
 * Logger Service - Winston-based Logging System
 *
 * 책임:
 * - 구조화된 로깅
 * - 로그 레벨 관리 (debug, info, warn, error)
 * - 파일 로테이션
 * - 프로덕션/개발 환경 분리
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 로그 디렉토리 생성
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 콘솔용 포맷 (개발 환경)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level} [${service || 'app'}]: ${message} ${metaStr}`;
  })
);

// Winston logger 인스턴스 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'animal-forest-backend' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 전체 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 테스트 환경에서는 로그 레벨 조정
if (process.env.NODE_ENV === 'test') {
  logger.level = 'error'; // 테스트 중에는 에러만 출력
}

/**
 * Logger 유틸리티 클래스
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, meta?: any): void {
    logger.debug(message, { context: this.context, ...meta });
  }

  info(message: string, meta?: any): void {
    logger.info(message, { context: this.context, ...meta });
  }

  warn(message: string, meta?: any): void {
    logger.warn(message, { context: this.context, ...meta });
  }

  error(message: string, error?: Error | any, meta?: any): void {
    const errorMeta = error instanceof Error
      ? { error: error.message, stack: error.stack, ...meta }
      : { error, ...meta };

    logger.error(message, { context: this.context, ...errorMeta });
  }

  // 성능 로깅을 위한 타이머
  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { duration: `${duration}ms` });
    };
  }

  // HTTP 요청 로깅
  logRequest(method: string, path: string, statusCode: number, duration: number, meta?: any): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, `${method} ${path} ${statusCode}`, {
      context: this.context,
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      ...meta,
    });
  }

  // 데이터베이스 쿼리 로깅
  logQuery(query: string, duration: number, meta?: any): void {
    this.debug(`Database query executed`, {
      query: query.substring(0, 100), // 처음 100자만
      duration: `${duration}ms`,
      ...meta,
    });
  }
}

/**
 * Logger 인스턴스 생성 헬퍼
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// 기본 export
export default logger;
