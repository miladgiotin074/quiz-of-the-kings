import { NextResponse } from 'next/server';

// App configuration data
const appConfig = {
  version: '1.0.0',
  status: 'Active',
  features: {
    quiz: true,
    chat: true,
    notifications: true,
    leaderboard: true,
    multiplayer: false,
    premium: true
  },
  maintenance: null, // Set to { message: 'Maintenance message' } when needed
  serverTime: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: appConfig
    });
  } catch (error) {
    console.error('Config API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load configuration' 
      },
      { status: 500 }
    );
  }
}