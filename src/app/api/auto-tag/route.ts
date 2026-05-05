import { NextRequest, NextResponse } from "next/server";
import { getRepoTags, getLatestRelease } from "@/lib/github/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, token, commitMessages } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "owner ve repo gerekli" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token gerekli" },
        { status: 401 }
      );
    }

    // Mevcut tag'leri al
    const tags = await getRepoTags(token, owner, repo);
    const latestRelease = await getLatestRelease(token, owner, repo);
    
    let currentVersion = "0.0.0";
    if (latestRelease) {
      currentVersion = latestRelease.tag_name.replace(/^v/, '');
    }

    // Commit mesajlarından version bump belirle
    const messages = commitMessages || [];
    let bumpType: 'major' | 'minor' | 'patch' = 'patch';
    
    // Basit kurallar:
    // - 'breaking' veya '!' varsa -> major
    // - 'feat' varsa -> minor
    // - 'fix' varsa -> patch
    const hasBreaking = messages.some((m: string) => 
      m.includes('breaking') || m.includes('!')
    );
    const hasFeat = messages.some((m: string) => 
      m.startsWith('feat') || m.startsWith('feature')
    );

    if (hasBreaking) {
      bumpType = 'major';
    } else if (hasFeat) {
      bumpType = 'minor';
    }

    // Yeni version hesapla
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    let newVersion: string;

    switch (bumpType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
    }

    const tag = `v${newVersion}`;
    const tagExists = tags.some((t: any) => t.name === tag);

    return NextResponse.json({
      success: true,
      currentVersion,
      suggestedVersion: newVersion,
      tag,
      bumpType,
      tagExists,
      message: `Suggested tag: ${tag} (${bumpType} bump)`,
    });
  } catch (error) {
    console.error("Auto-tag error:", error);
    return NextResponse.json(
      { error: "Auto-tag oluşturulamadı" },
      { status: 500 }
    );
  }
}
