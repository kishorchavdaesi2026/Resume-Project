import { NextRequest, NextResponse } from "next/server";
import { aiService } from "../../../../services/aiService";
import { databaseService } from "../../../../services/appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeContent, jobDescription } = body;

    if (!resumeContent) {
      return NextResponse.json({ error: "Missing required field: resumeContent" }, { status: 400 });
    }

    const ats = await aiService.analyzeATS(resumeContent, jobDescription || "");

    try {
      await databaseService.addAILog("user_mock123", "ats-score", 250, 300, "success");
    } catch (err) {
      console.warn("API ATS route database logging error:", err);
    }

    return NextResponse.json({ ats });
  } catch (error: any) {
    console.error("AI ATS endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to perform ATS compatibility scan" }, { status: 500 });
  }
}
