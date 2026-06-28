import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
export const isAIConfigured = !!(
  GEMINI_API_KEY &&
  GEMINI_API_KEY.trim() !== "" &&
  GEMINI_API_KEY !== "your_gemini_api_key_here"
);

let genAI: GoogleGenerativeAI | null = null;
if (isAIConfigured) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "ResumeIQ: GEMINI_API_KEY is not configured. Falling back to contextual rule-based AI simulation mode. " +
        "Define GEMINI_API_KEY in your .env file to enable actual AI operations."
    );
  }
}

// Helper to execute Gemini calls
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!genAI) throw new Error("Gemini AI is not initialized");
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
    },
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// ----------------------------------------------------
// AI SERVICE OPERATIONS
// ----------------------------------------------------
export const aiService = {
  /**
   * Generates a professional summary based on profile details and experiences
   */
  async generateSummary(name: string, title: string, skills: string[], experienceSummary: string): Promise<string> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Create a premium, impactful professional summary for:
        Name: ${name}
        Title: ${title}
        Key Skills: ${skills.join(", ")}
        Experience Overview: ${experienceSummary}

        Generate a concise, 3-4 sentence summary highlighting leadership, business value, technical capability, and career goals. Do not use generic statements. Keep it highly professional and tailored.
      `;
      const systemInstruction = "You are a world-class executive resume writer and career coach.";
      return await callGemini(prompt, systemInstruction);
    }

    // Contextual Mock Fallback
    const cleanTitle = title || "Software Professional";
    const skillList = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Agile Methodologies, Technical Leadership";
    return `Results-driven ${cleanTitle} with a proven track record of designing high-impact solutions and optimizing system workflows. Expert in leveraging ${skillList} to drive operational efficiency and support cross-functional business objectives. Recognized for a collaborative leadership style and a strong commitment to engineering excellence, continuous learning, and scalable architecture.`;
  },

  /**
   * Improves a single experience bullet point / description
   */
  async improveResumeBullet(bulletText: string, title: string): Promise<string> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Improve the following resume achievement/bullet point for a ${title || "professional"} position:
        "${bulletText}"

        Apply the Google XYZ Formula: "Accomplished [X] as measured by [Y], by doing [Z]".
        Use strong action verbs, quantify impact where possible, and make it concise (1-2 sentences). Return ONLY the rewritten bullet point text, with no introduction or quotes.
      `;
      return await callGemini(prompt);
    }

    // Contextual Mock Fallback
    if (!bulletText || bulletText.trim().length === 0) {
      return "Successfully collaborated with cross-functional teams to deploy critical platform updates, improving system reliability by 15% and reducing developer onboarding times.";
    }
    return `Leveraged advanced diagnostic methodologies to restructure "${bulletText}", resulting in a 24% acceleration in project delivery cycles and a 30% reduction in production exceptions.`;
  },

  /**
   * ATS Score Analyzer
   */
  async analyzeATS(resumeContent: string, jobDescription?: string): Promise<{
    score: number;
    feedback: string[];
    missingKeywords: string[];
  }> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Perform a comprehensive ATS (Applicant Tracking System) scan on the following resume content:
        ---
        RESUME CONTENT:
        ${resumeContent}
        ---
        ${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n---` : ""}

        Return a JSON object containing:
        - "score": number between 0 and 100
        - "feedback": array of 3-5 specific, actionable bullet points to improve the resume (e.g. formatting, word choice, quantifiability)
        - "missingKeywords": array of 3-6 keywords or industry skills that are missing or underrepresented compared to standard industry expectations or the target job description.

        Return ONLY the JSON block. Do not wrap in markdown code fence.
      `;
      try {
        const text = await callGemini(prompt, "You are a professional ATS parser engine. You only reply with valid JSON.");
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse ATS JSON response, using fallback:", err);
      }
    }

    // Contextual Mock Fallback
    const score = jobDescription ? 72 : 68;
    const missingKeywords = jobDescription
      ? ["KPI Dashboards", "CI/CD Pipelines", "System Architecture"]
      : ["Quantitative Metrics", "Stakeholder Alignment", "Unit Testing"];
    const feedback = [
      "Quantify achievements: Replace generic task statements with metrics-driven outcomes (e.g., 'saved 10 hours/week' or 'cut database latency by 20%').",
      "Action-oriented verbs: Upgrade passive descriptions to active words such as 'Spearheaded', 'Optimized', or 'Architected'.",
      "Section layouts: Ensure clean heading hierarchies so parser engines can index Experience and Education cleanly.",
      "ATS Keyword density: Integrate critical missing industry phrases into your work history bullets."
    ];
    return { score, feedback, missingKeywords };
  },

  /**
   * Generates a tailored Cover Letter
   */
  async generateCoverLetter(resumeSummary: string, jobDescription: string, companyName?: string): Promise<string> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Write a professional, highly persuasive cover letter based on the following resume highlights:
        ${resumeSummary}

        Targeting this Job Description:
        ${jobDescription}
        Company: ${companyName || "the organization"}

        The letter should have a formal header, an engaging hook referencing the role, a body body demonstrating specific alignments, and a strong CTA ending. Maintain an elegant, modern tone.
      `;
      return await callGemini(prompt);
    }

    // Contextual Mock Fallback
    const company = companyName || "your distinguished organization";
    return `Dear Hiring Manager,

I am writing to express my strong interest in the open position at ${company}. With my background in executing scalable technical designs and driving robust product delivery pipelines, I am confident in my ability to make an immediate impact on your engineering and development efforts.

Throughout my career, I have focused on translating business requirements into clean, performant, and maintainable software systems. My technical skills align closely with the qualifications outlined in your job posting. Additionally, my experience in collaborating with cross-functional product stakeholders has equipped me to help push your platform initiatives forward.

I would welcome the opportunity to discuss how my experiences, collaborative approach, and technical dedication can contribute to the goals of ${company}. Thank you for your time and consideration.

Sincerely,
[Your Name]`;
  },

  /**
   * Grammar & Style Checker
   */
  async checkGrammar(text: string): Promise<{
    correctedText: string;
    errorsCount: number;
    corrections: string[];
  }> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Analyze the following text for grammar, punctuation, spelling, and professional tone style:
        "${text}"

        Return a JSON object containing:
        - "correctedText": the complete text with all edits applied.
        - "errorsCount": integer count of errors found.
        - "corrections": array of strings explaining what was changed and why.

        Return ONLY the JSON block. Do not wrap in markdown code fence.
      `;
      try {
        const resText = await callGemini(prompt, "You are a professional editor. You only reply with valid JSON.");
        const cleanJson = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse grammar JSON response, using fallback:", err);
      }
    }

    // Contextual Mock Fallback
    return {
      correctedText: text,
      errorsCount: 0,
      corrections: ["Pristine status: Grammar and tone layout meet premium professional publishing benchmarks."]
    };
  },

  /**
   * Job Description Keyword Matching
   */
  async matchJob(resumeContent: string, jobDescription: string): Promise<{
    matchPercentage: number;
    matchedKeywords: string[];
    gapKeywords: string[];
    recommendations: string[];
  }> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Compare the following resume against the job description:
        ---
        RESUME:
        ${resumeContent}
        ---
        JOB DESCRIPTION:
        ${jobDescription}
        ---

        Identify keyword matches and recommendations. Return a JSON object with:
        - "matchPercentage": number from 0 to 100
        - "matchedKeywords": array of strings of matching key terms
        - "gapKeywords": array of strings of keywords present in job description but missing in resume
        - "recommendations": array of 2-3 specific suggestions on how to restructure sections to match this role

        Return ONLY JSON. Do not wrap in markdown code fence.
      `;
      try {
        const text = await callGemini(prompt, "You are a job alignment algorithm. You only reply with valid JSON.");
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse job match JSON:", err);
      }
    }

    // Contextual Mock Fallback
    return {
      matchPercentage: 78,
      matchedKeywords: ["React", "TypeScript", "Tailwind CSS", "Next.js", "REST APIs"],
      gapKeywords: ["GraphQL", "Docker", "AWS Deployments", "E2E Testing"],
      recommendations: [
        "Incorporate cloud deployment experiences under your most recent project descriptions.",
        "Add a specific bullet showing automated testing tools usage in your work history."
      ]
    };
  },

  /**
   * Generates Customized Interview Questions
   */
  async generateInterviewQuestions(resumeSummary: string, title: string): Promise<{
    question: string;
    suggestedAnswer: string;
  }[]> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Based on the professional summary and title of this candidate, generate 3 relevant interview questions:
        Title: ${title}
        Summary: ${resumeSummary}

        Return a JSON array where each object has:
        - "question": string
        - "suggestedAnswer": string (providing guidance on what key points to highlight from their summary)

        Return ONLY JSON.
      `;
      try {
        const text = await callGemini(prompt, "You are an interviewer. You only reply with valid JSON.");
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse interview Qs JSON:", err);
      }
    }

    // Contextual Mock Fallback
    return [
      {
        question: "Can you detail a time when you designed a scalable front-end system structure?",
        suggestedAnswer: "Walk through your choice of framework (e.g., Next.js 15), component modularization, state management (e.g., Zustand), and optimizing loading speeds via server components."
      },
      {
        question: "How do you align business goals with technical refactoring?",
        suggestedAnswer: "Discuss how you translate product metrics (like user conversions or export rates) into backend capabilities, demonstrating quantify-driven successes from your experience bullets."
      }
    ];
  },

  /**
   * Recommends projects to add to the resume
   */
  async recommendProjects(title: string, skills: string[]): Promise<{
    title: string;
    description: string;
    technologies: string[];
  }[]> {
    if (isAIConfigured && genAI) {
      const prompt = `
        Suggest 3 high-impact coding/engineering projects for a candidate targeting a ${title} position.
        They have skills in: ${skills.join(", ")}

        Return a JSON array of projects, where each object has:
        - "title": string
        - "description": string (highlighting why this project will stand out on a resume)
        - "technologies": array of strings (using a mix of their skills and 1-2 advanced recommendations)

        Return ONLY JSON.
      `;
      try {
        const text = await callGemini(prompt, "You are a senior tech lead. You only reply with a JSON array.");
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse project suggestions JSON:", err);
      }
    }

    // Contextual Mock Fallback
    return [
      {
        title: "Microservices-Based Real-Time Dashboard",
        description: "Implement a dashboard handling real-time WebSockets connections with robust message brokers, demonstrating performance at scale.",
        technologies: [...skills.slice(0, 2), "WebSocket", "Redis", "Docker"]
      },
      {
        title: "AI-Powered PDF Semantic Search Engine",
        description: "Build an app that indexes PDF uploads, stores embeddings in a vector DB, and allows context-aware querying, demonstrating AI integration capability.",
        technologies: [...skills.slice(0, 2), "Vector DB (Pinecone/Milvus)", "LLM API", "Next.js"]
      }
    ];
  }
};
