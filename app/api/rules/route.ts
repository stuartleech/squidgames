import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function GET() {
  try {
    const rules = await dbOperations.getAllRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, section, order } = await request.json();

    if (!title || !content || !section || order === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await dbOperations.createRule({
      title,
      content,
      section,
      order,
    });

    return NextResponse.json({ 
      message: 'Rule created successfully', 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}
