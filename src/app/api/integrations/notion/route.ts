import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notionToken, databaseId, changelog, title, sections } = body;

    if (!notionToken || !databaseId) {
      return NextResponse.json(
        { error: "notionToken and databaseId are required" },
        { status: 400 }
      );
    }

    const notionContent: any[] = [
      { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: title || "Changelog" } }] } },
    ];

    for (const section of sections || []) {
      notionContent.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ text: { content: `${section.icon} ${section.label}` } }] },
      });

      for (const commit of section.commits || []) {
        notionContent.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { text: { content: commit.message } },
              { text: { content: ` (${commit.sha?.substring(0, 7)})`, link: null }, annotations: { color: "gray" } },
            ],
          },
        });
      }
    }

    const databaseResponse = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}`,
      {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (!databaseResponse.ok) {
      return NextResponse.json(
        { error: "Invalid Notion database ID" },
        { status: 400 }
      );
    }

    const pageResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: title || "Changelog" } }] },
          Date: { date: { start: new Date().toISOString() } },
        },
        children: notionContent,
      }),
    });

    if (!pageResponse.ok) {
      const error = await pageResponse.text();
      return NextResponse.json({ error: `Notion error: ${error}` }, { status: 500 });
    }

    const page = await pageResponse.json();

    return NextResponse.json({
      success: true,
      platform: "notion",
      pageId: page.id,
      url: page.url,
    });
  } catch (error: any) {
    console.error("Notion sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync to Notion" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    instructions: [
      "1. Create a Notion integration at https://www.notion.so/my-integrations",
      "2. Share your database with the integration",
      "3. Copy the database ID from the URL",
      "4. Use the internal integration token",
    ],
    schema: {
      databaseId: "Notion database ID (32 chars)",
      notionToken: "Internal integration token",
      title: "Page title",
      sections: "Changelog sections array",
    },
  });
}