import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';
import { eventSchema } from '@/lib/validation';

// GET all events
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';
    
    let query: any = { isPublic: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE event
export const POST = authenticateToken(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    // Validate input
    const { error, value } = eventSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.details[0].message },
        { status: 400 }
      );
    }

    const event = new Event({
      ...value,
      organizer: req.user?.userId,
    });

    await event.save();
    await event.populate('organizer', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    }, { status: 201 });

  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});