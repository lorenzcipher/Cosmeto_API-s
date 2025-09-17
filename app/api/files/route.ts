import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

// GET all files
export const GET = authenticateToken(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublic = searchParams.get('public');
    
    let query: any = {};
    
    // Non-admin users can only see public files or their own files
    if (req.user?.role !== 'admin') {
      query = {
        $or: [
          { isPublic: true },
          { uploadedBy: req.user?.userId }
        ]
      };
    }
    
    if (isPublic !== null) {
      query.isPublic = isPublic === 'true';
    }

    const files = await File.find(query)
      .populate('uploadedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await File.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// UPLOAD file
export const POST = authenticateToken(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const isPublic = formData.get('isPublic') === 'true';
    const tags = formData.get('tags') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Max size: 10MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file info to database
    const fileDoc = new File({
      filename,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      path: `/uploads/${filename}`,
      uploadedBy: req.user?.userId,
      isPublic,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });

    await fileDoc.save();
    await fileDoc.populate('uploadedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: { file: fileDoc }
    }, { status: 201 });

  } catch (error) {
    console.error('Upload file error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});