import { Request, Response, NextFunction } from 'express';

/**
 * Admin Authentication Middleware
 * Checks if the user has admin role before allowing access to admin routes
 */

export interface AdminRequest extends Request {
  userId?: string;
  userRole?: 'admin' | 'teacher' | 'student';
}

/**
 * Mock user database (in production, query from real database)
 * This would be replaced with actual database queries
 */
const ADMIN_USERS = {
  'admin@nook.com': { id: 'user-001', role: 'admin', name: '너굴 관리자' },
  'teacher@nook.com': { id: 'user-002', role: 'teacher', name: '선생님' },
};

/**
 * Middleware: Check admin authentication
 * Validates JWT token and user role
 */
export async function checkAdminAuth(
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Missing authorization header',
      });
      return;
    }

    // Extract token (Bearer <token>)
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid token format',
      });
      return;
    }

    // TODO: In production, verify JWT token here
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // For now, simulate token verification

    // Mock: Parse token (in production, use jwt.verify)
    let userEmail = '';
    try {
      // Simple mock: token = base64(email)
      userEmail = Buffer.from(token, 'base64').toString('utf-8');
    } catch (e) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    // Look up user in database
    const user = ADMIN_USERS[userEmail as keyof typeof ADMIN_USERS];
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Check if user has admin role
    if (user.role !== 'admin' && user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Admin or Teacher role required.',
        requiredRole: 'admin|teacher',
        userRole: user.role,
      });
      return;
    }

    // Attach user info to request
    req.userId = user.id;
    req.userRole = user.role;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Middleware: Check STRICT admin (not teacher)
 */
export async function checkStrictAdminAuth(
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First run the basic admin check
    checkAdminAuth(req, res, () => {
      // Then check if strictly admin
      if (req.userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin only. Teachers cannot perform this action.',
          requiredRole: 'admin',
          userRole: req.userRole,
        });
        return;
      }

      next();
    });
  } catch (error) {
    console.error('Strict admin auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Helper: Create test token (for development)
 * Usage: Authorization: Bearer <token>
 */
export function createTestToken(email: string): string {
  return Buffer.from(email).toString('base64');
}

/**
 * Example usage:
 *
 * // In your route file:
 * import { checkAdminAuth } from '../middleware/adminAuth';
 *
 * router.post('/admin/scenes', checkAdminAuth, async (req, res) => {
 *   // Only admins and teachers can access this
 *   const userId = (req as AdminRequest).userId;
 *   const userRole = (req as AdminRequest).userRole;
 *   // ... implementation
 * });
 *
 * // In your test:
 * const token = createTestToken('admin@nook.com');
 * fetch('/api/admin/scenes', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 */
