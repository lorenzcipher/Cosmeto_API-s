import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

// JOIN event
export const POST = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;
    const userId = req.user?.userId;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is already attending
    if (event.attendees.includes(userId as any)) {
      return NextResponse.json(
        { success: false, message: 'Already attending this event' },
        { status: 400 }
      );
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return NextResponse.json(
        { success: false, message: 'Event is full' },
        { status: 400 }
      );
    }

    event.attendees.push(userId as any);
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the event'
    });

  } catch (error) {
    console.error('Join event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// LEAVE event
export const DELETE = authenticateToken(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { id } = params;
    const userId = req.user?.userId;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is attending
    if (!event.attendees.includes(userId as any)) {
      return NextResponse.json(
        { success: false, message: 'Not attending this event' },
        { status: 400 }
      );
    }

    event.attendees = event.attendees.filter(attendee => attendee.toString() !== userId);
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully left the event'
    });

  } catch (error) {
    console.error('Leave event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});