import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Fonnte token is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { name, device } = body;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('device', device);
    formData.append('autoread', 'false');
    formData.append('personal', 'false');
    formData.append('group', 'false');

    const response = await fetch('https://api.fonnte.com/add-device', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding Fonnte device:', error);
    return NextResponse.json({ error: 'Failed to add device' }, { status: 500 });
  }
}
