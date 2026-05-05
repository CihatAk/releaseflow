import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, owner, repo: repoName, importIssues = false } = body;

    if (!userId || !owner || !repoName) {
      return NextResponse.json(
        { error: "userId, owner ve repo gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    // GitHub token'ı al
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User bulunamadı" },
        { status: 404 }
      );
    }

    // Repo zaten var mı kontrol et
    const existingRepo = await prisma.repo.findFirst({
      where: { full_name: `${owner}/${repoName}` },
    });

    if (existingRepo) {
      return NextResponse.json(
        { error: "Repo zaten import edilmiş", repo: existingRepo },
        { status: 400 }
      );
    }

    // GitHub API'dan repo bilgilerini çek
    // NOT: Gerçek uygulamada GitHub API kullanılır, burası demo
    const newRepo = await prisma.repo.create({
      data: {
        name: repoName,
        full_name: `${owner}/${repoName}`,
        owner,
        user_id: userId,
        description: `Imported from GitHub: ${owner}/${repoName}`,
        stars: 0,
        forks: 0,
      },
    });

    // Eğer importIssues=true ise, issue'ları da çek (demo)
    if (importIssues) {
      // Demo - 3 adet changelog oluştur
      for (let i = 0; i < 3; i++) {
        await prisma.changelog.create({
          data: {
            title: `Imported Changelog ${i + 1}`,
            version: `1.${i}.0`,
            content: `## Features\n- Imported feature ${i + 1}\n\n## Bug Fixes\n- Fix ${i + 1}`,
            published: false,
            repo_id: newRepo.id,
            user_id: userId,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      repo: newRepo,
      message: `${owner}/${repoName} başarıyla import edildi`,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import işlemi başarısız" },
      { status: 500 }
    );
  }
}
