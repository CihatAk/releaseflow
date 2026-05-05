import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, repoIds, data } = body;

    if (!action || !repoIds || !Array.isArray(repoIds)) {
      return NextResponse.json(
        { error: "action ve repoIds (array) gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "delete":
        result = await prisma.changelog.deleteMany({
          where: { repo_id: { in: repoIds } },
        });
        break;

      case "publish":
        result = await prisma.changelog.updateMany({
          where: { repo_id: { in: repoIds }, published: false },
          data: { published: true },
        });
        break;

      case "unpublish":
        result = await prisma.changelog.updateMany({
          where: { repo_id: { in: repoIds }, published: true },
          data: { published: false },
        });
        break;

      case "updateFormat":
        if (!data?.format) {
          return NextResponse.json(
            { error: "format gerekli" },
            { status: 400 }
          );
        }
        result = await prisma.changelog.updateMany({
          where: { repo_id: { in: repoIds } },
          data: { format: data.format },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Geçersiz action (delete/publish/unpublish/updateFormat)" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      affected: (result as any).count || 0,
      message: `Batch ${action} tamamlandı`,
    });
  } catch (error) {
    console.error("Batch operations error:", error);
    return NextResponse.json(
      { error: "Batch işlemi başarısız" },
      { status: 500 }
    );
  }
}
