import { initializeSampleData } from '@/lib/sampleData';

export async function GET() {
  try {
    const result = await initializeSampleData();
    
    if (result.skipped) {
      return Response.json({ 
        message: 'Database already has data - initialization skipped to prevent data loss',
        warning: 'To reset the database, you need to manually clear it first'
      }, { status: 200 });
    }
    
    return Response.json({ 
      message: 'Sample data initialized successfully',
      info: 'Database was empty and has been populated with initial data'
    });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return Response.json({ error: 'Failed to initialize sample data' }, { status: 500 });
  }
}
