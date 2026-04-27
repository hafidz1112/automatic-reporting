import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Fonnte token is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { device } = body;

    const formData = new FormData();
    formData.append('type', 'qr');
    formData.append('whatsapp', device);

    const response = await fetch('https://api.fonnte.com/qr', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Fonnte QR:', error);
    return NextResponse.json({ error: 'Failed to fetch QR' }, { status: 500 });
  }
}
