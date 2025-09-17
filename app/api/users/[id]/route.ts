import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '@/middleware/auth';
import { userUpdateSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';

// GET single user
export const GET = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;

    // Users can only access their own data unless they're admin
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// UPDATE user
export const PUT = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    // Users can only update their own data unless they're admin
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Validate input
    const { error, value } = userUpdateSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.details[0].message },
        { status: 400 }
      );
    }

    // Only admins can change roles
    if (value.role && req.user?.role !== 'admin') {
      delete value.role;
    }

    // Hash new password if provided
    if (value.password) {
      value.password = await hashPassword(value.password);
    }

    const user = await User.findByIdAndUpdate(id, value, { new: true });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE user (Admin only)
export const DELETE = requireAdmin(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});