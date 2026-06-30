import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requirements = await prisma.requirement.findMany({
      select: {
        id: true,
        requirementId: true,
        title: true,
      },
      orderBy: {
        requirementId: 'asc',
      }
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Fetch requirements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
