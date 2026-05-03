import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jiraDomain, jiraEmail, jiraApiToken, projectKey, issueSummary, issueDescription, issueType } = body;

    if (!jiraDomain || !jiraApiToken || !projectKey) {
      return NextResponse.json(
        { error: "jiraDomain, jiraApiToken, and projectKey are required" },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64");

    const issueData = {
      fields: {
        project: { key: projectKey },
        summary: issueSummary || "Release Notes Summary",
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: issueDescription || "Release notes content" }],
            },
          ],
        },
        issuetype: { name: issueType || "Task" },
      },
    };

    const response = await fetch(
      `https://${jiraDomain}.atlassian.net/rest/api/3/issue`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Jira error: ${errorText}` },
        { status: response.status }
      );
    }

    const issue = await response.json();

    return NextResponse.json({
      success: true,
      platform: "jira",
      issueKey: issue.key,
      issueId: issue.id,
      issueUrl: `https://${jiraDomain}.atlassian.net/browse/${issue.key}`,
    });
  } catch (error: any) {
    console.error("Jira integration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect to Jira" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    instructions: [
      "1. Go to https://id.atlassian.com/manage-profile/security/api-tokens",
      "2. Create an API token",
      "3. Use your Jira email and token",
    ],
    required: ["jiraDomain", "jiraEmail", "jiraApiToken", "projectKey"],
    example: {
      jiraDomain: "yourcompany",
      jiraEmail: "you@company.com",
      jiraApiToken: "your-api-token-here",
      projectKey: "PROJ",
    },
  });
}