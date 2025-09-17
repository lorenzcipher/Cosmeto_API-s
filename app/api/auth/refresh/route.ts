import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    return NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid refresh token' },
      { status: 403 }
    );
  }
}