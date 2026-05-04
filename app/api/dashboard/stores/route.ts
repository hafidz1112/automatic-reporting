import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { store } from "@/db/schema";
import { auth } from "@/lib/auth";

function generateId() {
  return "store_" + Math.random().toString(36).substring(2, 10);
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(store)
    .orderBy(desc(store.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, location, targetSpd } = body;
    const id = generateId();
    const dateNow = new Date();

    await db.insert(store).values({
      id,
      name,
      type: type || "Bright Store",
      location,
      targetSpd: targetSpd || 0,
      createdAt: dateNow,
      updatedAt: dateNow,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, type, location, targetSpd } = body;
    const dateNow = new Date();

    await db.update(store)
      .set({ 
        name, 
        type, 
        location, 
        targetSpd, 
        updatedAt: dateNow 
      })
      .where(eq(store.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    await db.delete(store).where(eq(store.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
