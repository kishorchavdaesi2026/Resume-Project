import { NextRequest, NextResponse } from "next/server";
import { aiService } from "../../../../services/aiService";
import { databaseService } from "../../../../services/appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeSummary, title } = body;

    if (!resumeSummary || !title) {
      return NextResponse.json({ error: "Missing required fields: resumeSummary and title" }, { status: 400 });
    }

    const questions = await aiService.generateInterviewQuestions(resumeSummary, title);

    try {
      await databaseService.addAILog("user_mock123", "interview-prep", 150, 250, "success");
    } catch (err) {
      console.warn("API interview prep route database logging error:", err);
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("AI interview prep endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate interview preparation questions" }, { status: 500 });
  }
}
