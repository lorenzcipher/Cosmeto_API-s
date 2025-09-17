import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // In a production app, you might want to maintain a blacklist of tokens
    // For now, we'll just return a success response
    // The client should remove the tokens from storage
    
    return NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}