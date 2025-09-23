import { initializeSampleData } from '@/lib/sampleData';

export async function GET() {
  try {
    initializeSampleData();
    return Response.json({ message: 'Sample data initialized successfully' });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return Response.json({ error: 'Failed to initialize sample data' }, { status: 500 });
  }
}
