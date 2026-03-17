import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Az előbb létrehozott kliens

export async function POST(request: Request) {
  try {
    // 1. Adatok kinyerése a kérésből
    const body = await request.json();
    const { name } = body;

    // 2. Validálás (alap szinten)
    if (!name) {
      return NextResponse.json(
        { error: "A kategória neve kötelező!" },
        { status: 400 }
      );
    }

    // 3. Mentés az adatbázisba a Prismával
    const newCategory = await prisma.categories.create({
      data: {
        name: name
      }
    });

    // 4. Siker visszajelzése
    return NextResponse.json(newCategory, { status: 201 });

  } catch (error: any) {
    console.error("Hiba a kategória létrehozásakor:", error);
    
    return NextResponse.json(
      { error: "Szerverhiba történt az adatbázis művelet közben." },
      { status: 500 }
    );
  }
}