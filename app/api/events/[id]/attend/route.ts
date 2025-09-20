import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

// GET single event (if this exists)
export const GET = async (req: NextRequest, context: any) => {
  try {
    await connectDB();
    
    const id = context?.params?.id as string;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id).populate('organizer', 'username email');
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};

// UPDATE event
export const PUT = authenticateToken(async (req: AuthenticatedRequest, context) => {
  try {
    await connectDB();
    
    const id = context?.params?.id as string;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Event ID is required' },
        { status: 400 }
      );
    }

    const userId = req.user?.userId;
    const body = await req.json();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this event' },
        { status: 403 }
      );
    }

    // Update event fields
    Object.assign(event, body);
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });

  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE event
export const DELETE = authenticateToken(async (req: AuthenticatedRequest, context) => {
  try {
    await connectDB();
    
    const id = context?.params?.id as string;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Event ID is required' },
        { status: 400 }
      );
    }

    const userId = req.user?.userId;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== userId && req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this event' },
        { status: 403 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});