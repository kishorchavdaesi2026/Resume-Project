import { NextRequest, NextResponse } from "next/server";
import { aiService } from "../../../../services/aiService";
import { databaseService } from "../../../../services/appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bulletText, title } = body;

    if (!bulletText) {
      return NextResponse.json({ error: "Missing required field: bulletText" }, { status: 400 });
    }

    const improvedText = await aiService.improveResumeBullet(bulletText, title || "");

    try {
      await databaseService.addAILog("user_mock123", "improve-resume", 100, 150, "success");
    } catch (err) {
      console.warn("API improve route database logging error:", err);
    }

    return NextResponse.json({ improvedText });
  } catch (error: any) {
    console.error("AI improve endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to rewrite bullet point" }, { status: 500 });
  }
}
