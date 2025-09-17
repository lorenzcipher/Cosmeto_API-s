import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateTokens } from '@/lib/auth';
import { userSignInSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate input
    const { error, value } = userSignInSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.details[0].message },
        { status: 400 }
      );
    }

    const { email, password } = value;

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}