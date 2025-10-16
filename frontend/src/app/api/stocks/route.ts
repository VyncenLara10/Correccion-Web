import { NextResponse } from 'next/server';

// ESTE ARCHIVO ES OPCIONAL
// Solo úsalo si quieres datos mock mientras no tienes backend

export async function GET() {
  // Mock data de acciones
  const mockStocks = [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 178.50,
      change_24h: 2.5,
      change_percent: 1.42,
      sector: 'Tecnología',
      market_cap: 2800000000000,
      volume: 50000000,
      available_quantity: 1000,
      is_active: true
    },
    {
      id: '2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.30,
      change_24h: -1.2,
      change_percent: -0.84,
      sector: 'Tecnología',
      market_cap: 1800000000000,
      volume: 25000000,
      available_quantity: 800,
      is_active: true
    },
    {
      id: '3',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 380.90,
      change_24h: 5.8,
      change_percent: 1.55,
      sector: 'Tecnología',
      market_cap: 2900000000000,
      volume: 30000000,
      available_quantity: 500,
      is_active: true
    },
    {
      id: '4',
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 175.20,
      change_24h: 3.1,
      change_percent: 1.80,
      sector: 'Consumo',
      market_cap: 1800000000000,
      volume: 40000000,
      available_quantity: 600,
      is_active: true
    },
    {
      id: '5',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 245.60,
      change_24h: -4.5,
      change_percent: -1.80,
      sector: 'Tecnología',
      market_cap: 780000000000,
      volume: 100000000,
      available_quantity: 400,
      is_active: true
    }
  ];

  return NextResponse.json({ stocks: mockStocks });
}

// Si necesitas POST, PUT, DELETE, etc.
export async function POST(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({ 
    message: 'Stock created (mock)', 
    stock: body 
  });
}