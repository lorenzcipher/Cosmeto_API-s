import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

// GET single file
export const GET = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;

    const file = await File.findById(id).populate('uploadedBy', 'name email');
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (!file.isPublic && file.uploadedBy._id.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { file }
    });

  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// UPDATE file
export const PUT = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const file = await File.findById(id);
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Only file owner or admin can update
    if (file.uploadedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const allowedUpdates = ['isPublic', 'tags'];
    const updates: any = {};
    
    allowedUpdates.forEach(key => {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    });

    const updatedFile = await File.findByIdAndUpdate(id, updates, { new: true })
      .populate('uploadedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
      data: { file: updatedFile }
    });

  } catch (error) {
    console.error('Update file error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE file
export const DELETE = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;

    const file = await File.findById(id);
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Only file owner or admin can delete
    if (file.uploadedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', file.path);
      await unlink(filePath);
    } catch (fsError) {
      console.error('File deletion from filesystem failed:', fsError);
    }

    // Delete file record from database
    await File.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});