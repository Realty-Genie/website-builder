import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUsersCollection } from '@/lib/server/mongodb';
import { generateToken, generateRefreshToken, COOKIE_OPTIONS } from '@/lib/server/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-min-32-chars';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'me') {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne({ _id: new (await import('mongodb')).ObjectId(decoded.userId) });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: { id: user._id.toString(), email: user.email, createdAt: user.createdAt },
      });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
  }

  if (action === 'refresh') {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'No refresh token' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne({ _id: new (await import('mongodb')).ObjectId(decoded.userId) });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
      }

      const newToken = generateToken(user._id.toString());
      const newRefreshToken = generateRefreshToken(user._id.toString());

      const response = NextResponse.json({ success: true, token: newToken });
      response.cookies.set('token', newToken, COOKIE_OPTIONS);
      response.cookies.set('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });
      return response;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'register') {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const usersCollection = await getUsersCollection();
      const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await usersCollection.insertOne({
        email: email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });

      const token = generateToken(result.insertedId.toString());
      const refreshToken = generateRefreshToken(result.insertedId.toString());

      const response = NextResponse.json(
        {
          success: true,
          token,
          user: { id: result.insertedId.toString(), email: email.toLowerCase() },
        },
        { status: 201 }
      );

      response.cookies.set('token', token, COOKIE_OPTIONS);
      response.cookies.set('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return response;
    } catch (error) {
      console.error('Register error:', error);
      return NextResponse.json(
        { success: false, error: 'Server error' },
        { status: 500 }
      );
    }
  }

  if (action === 'login') {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne({ email: email.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const token = generateToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      const response = NextResponse.json({
        success: true,
        token,
        user: { id: user._id.toString(), email: user.email },
      });

      response.cookies.set('token', token, COOKIE_OPTIONS);
      response.cookies.set('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { success: false, error: 'Server error' },
        { status: 500 }
      );
    }
  }

  if (action === 'logout') {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}