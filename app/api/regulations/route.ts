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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { authority: { contains: search } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const regulations = await prisma.regulation.findMany({
      where,
      include: {
        _count: {
          select: { requirements: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(regulations);
  } catch (error) {
    console.error('Fetch regulations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, authority, country, region, category, version, effectiveDate, externalUrl, status } = body;

    if (!name || !authority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const regulation = await prisma.regulation.create({
      data: {
        name,
        description,
        authority,
        country,
        region,
        category,
        version,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        externalUrl,
        status: status || 'ACTIVE',
      },
    });

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'CREATE',
        entityType: 'REGULATION',
        entityId: regulation.id,
        userId: user.id,
        description: `Created regulation: ${regulation.name}`,
        newValue: JSON.stringify(regulation),
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'REGULATION_CREATED',
        title: `Regulation "${regulation.name}" added`,
        entityType: 'REGULATION',
        entityId: regulation.id,
      },
    });

    return NextResponse.json(regulation);
  } catch (error) {
    console.error('Create regulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
