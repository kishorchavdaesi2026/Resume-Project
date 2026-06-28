import { NextRequest, NextResponse } from "next/server";
import { aiService } from "../../../../services/aiService";
import { databaseService } from "../../../../services/appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, title, skills, experience } = body;

    if (!name || !title) {
      return NextResponse.json({ error: "Missing required fields: name and title" }, { status: 400 });
    }

    // Call AI service
    const summary = await aiService.generateSummary(name, title, skills || [], experience || "");

    // Log AI Request (default to user_mock123 for sandbox / demo)
    try {
      await databaseService.addAILog("user_mock123", "generate-summary", 150, 200, "success");
    } catch (err) {
      console.warn("API summary route database logging error:", err);
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("AI summary endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate professional summary" }, { status: 500 });
  }
}
