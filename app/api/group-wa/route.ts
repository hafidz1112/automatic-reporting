import { db } from "@/db";
import { waGroups } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createGroupSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1),
  storeId: z.string().optional()
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10)
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params = paginationSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined
  });
  if (!params.success) {
    return NextResponse.json(
      { error: "Parameter pagination tidak valid" },
      { status: 400 }
    );
  }

  const { page, pageSize } = params.data;
  const offset = (page - 1) * pageSize;

  const [totalResult, groups] = await Promise.all([
    db.select({ total: sql<number>`count(*)` }).from(waGroups),
    db.select().from(waGroups).orderBy(waGroups.name).limit(pageSize).offset(offset)
  ]);

  const total = totalResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({ data: groups, total, page, pageSize, totalPages });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", detail: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { groupId, name, storeId } = parsed.data;

  const existing = await db
    .select()
    .from(waGroups)
    .where(eq(waGroups.groupId, groupId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Group ID sudah terdaftar" },
      { status: 409 }
    );
  }

  const id = crypto.randomUUID();
  await db.insert(waGroups).values({ id, groupId, name, storeId });

  return NextResponse.json({ success: true, id });
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.FONNTE_TOKEN_WA;
  if (!token) {
    return NextResponse.json(
      { error: "Fonnte Token is not configured" },
      { status: 500 }
    );
  }

  const res = await fetch("https://api.fonnte.com/get-whatsapp-group", {
    method: "POST",
    headers: { Authorization: token }
  });
  const data = await res.json();

  if (!data?.data || !Array.isArray(data.data)) {
    return NextResponse.json(
      { error: "Gagal mendapatkan grup dari Fonnte", raw: data },
      { status: 502 }
    );
  }

  const synced: { groupId: string; name: string; action: "created" | "updated" | "skipped" }[] = [];

  for (const group of data.data) {
    const groupId: string = group.id || group.group_id;
    const name: string = group.name || group.subject || "-";

    if (!groupId) continue;

    const existing = await db
      .select()
      .from(waGroups)
      .where(eq(waGroups.groupId, groupId))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].name !== name) {
        await db
          .update(waGroups)
          .set({ name, updatedAt: new Date() })
          .where(eq(waGroups.groupId, groupId));
        synced.push({ groupId, name, action: "updated" });
      } else {
        synced.push({ groupId, name, action: "skipped" });
      }
    } else {
      const id = crypto.randomUUID();
      await db.insert(waGroups).values({ id, groupId, name });
      synced.push({ groupId, name, action: "created" });
    }
  }

  return NextResponse.json({ success: true, synced });
}