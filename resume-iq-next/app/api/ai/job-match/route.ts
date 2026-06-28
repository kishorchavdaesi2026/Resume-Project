import { NextRequest, NextResponse } from "next/server";
import { aiService } from "../../../../services/aiService";
import { databaseService } from "../../../../services/appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeContent, jobDescription } = body;

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields: resumeContent and jobDescription" }, { status: 400 });
    }

    const match = await aiService.matchJob(resumeContent, jobDescription);

    try {
      await databaseService.addAILog("user_mock123", "job-match", 300, 350, "success");
    } catch (err) {
      console.warn("API match route database logging error:", err);
    }

    return NextResponse.json({ match });
  } catch (error: any) {
    console.error("AI job match endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze job matching alignment" }, { status: 500 });
  }
}
