import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateTokens } from '@/lib/auth';
import { userSignUpSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate input
    const { error, value } = userSignUpSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.details[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}