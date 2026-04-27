import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Fonnte token is not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.fonnte.com/get-devices', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Fonnte devices:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
