import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function GET() {
  try {
    console.log('[TEST] Starting Blobs test...');
    
    // Try to get the store
    const store = getStore('squidgames-db');
    console.log('[TEST] Store created:', !!store);
    
    // Try to write
    await store.setJSON('test-key', { message: 'Hello from Blobs!', timestamp: Date.now() });
    console.log('[TEST] Write successful');
    
    // Try to read
    const data = await store.get('test-key', { type: 'json' });
    console.log('[TEST] Read successful:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blobs working!',
      data 
    });
  } catch (error: any) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

