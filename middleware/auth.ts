// Alternative approach: Create a separate middleware for routes that require params
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

type RouteContext = {
  params: { [key: string]: string | string[] };
};

type RouteHandler = (
  req: AuthenticatedRequest,
  context?: RouteContext
) => Promise<NextResponse>;

type RouteHandlerWithParams = (
  req: AuthenticatedRequest,
  context: RouteContext
) => Promise<NextResponse>;

export const authenticateToken = (handler: RouteHandler) => {
  return async (req: NextRequest, context?: RouteContext) => {
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
      
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = decoded;

      return await handler(authenticatedReq, context);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 403 }
      );
    }
  };
};

// Middleware specifically for routes with required params
export const authenticateTokenWithParams = (handler: RouteHandlerWithParams) => {
  return async (req: NextRequest, context: RouteContext) => {
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
      
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = decoded;

      return await handler(authenticatedReq, context);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 403 }
      );
    }
  };
};

export const requireAdmin = (handler: RouteHandler) => {
  return authenticateToken(async (req: AuthenticatedRequest, context?: RouteContext) => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    return await handler(req, context);
  });
};