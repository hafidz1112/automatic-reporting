import { auth } from "@/lib/auth";
import {
  buildWaReportMessage,
  WaReportMessageError
} from "@/lib/build-wa-report-message";
import { z } from "zod";

const shareWaLinkSchema = z.object({
  reportId: z.string().min(1),
  target: z.string().optional()
});

function normalizeWaTarget(target: string) {
  const digits = target.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = shareWaLinkSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: "Payload tidak valid" },
      { status: 400 }
    );
  }

  try {
    const { message } = await buildWaReportMessage({
      reportId: parsed.data.reportId,
      sessionUserId: session.user.id
    });

    const encoded = encodeURIComponent(message);
    const target = parsed.data.target
      ? normalizeWaTarget(parsed.data.target)
      : "";

    if (parsed.data.target && !target) {
      return Response.json(
        { success: false, error: "Nomor tujuan tidak valid" },
        { status: 400 }
      );
    }

    const waLink = target
      ? `https://wa.me/${target}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    return Response.json({ success: true, waLink, message });
  } catch (error) {
    if (error instanceof WaReportMessageError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    return Response.json(
      { success: false, error: "Gagal menyiapkan preview WhatsApp" },
      { status: 500 }
    );
  }
}
