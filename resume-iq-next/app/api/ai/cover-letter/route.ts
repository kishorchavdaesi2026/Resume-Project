import { NextRequest, NextResponse } from "next/server";
import { aiService } from "../../../../services/aiService";
import { databaseService } from "../../../../services/appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeSummary, jobDescription, companyName } = body;

    if (!resumeSummary || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields: resumeSummary and jobDescription" }, { status: 400 });
    }

    const coverLetter = await aiService.generateCoverLetter(resumeSummary, jobDescription, companyName || "");

    try {
      await databaseService.addAILog("user_mock123", "cover-letter", 200, 400, "success");
    } catch (err) {
      console.warn("API cover letter route database logging error:", err);
    }

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error("AI cover letter endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate tailored cover letter" }, { status: 500 });
  }
}
