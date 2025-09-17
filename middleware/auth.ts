import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export const authenticateToken = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (req: AuthenticatedRequest) => {
    try {
      const authHeader = req.headers.get('authorization');
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Access token required' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      req.user = decoded;

      return await handler(req);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 403 }
      );
    }
  };
};

export const requireAdmin = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return authenticateToken(async (req: AuthenticatedRequest) => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    return await handler(req);
  });
};