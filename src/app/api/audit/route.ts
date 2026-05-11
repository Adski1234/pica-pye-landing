import type { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "You are an expert digital transformation consultant at PicaPye, targeting SMEs and Voluntary Orgs. The user will provide a description of their business and a workflow bottleneck. Provide a concise, highly actionable 3-step digital transformation plan resolving their issue. Focus on PicaPye's services: AI integration, Workflow Optimization, GDPR AI Audits, or Local LLMs. Keep the tone encouraging, professional, and slightly tech-forward. Format the response as clean HTML using only <h3> for step titles, <p> for descriptions, and <ul>/<li> for bullet points. Do not include markdown formatting ticks (```html). Start directly with the first <h3>.";

export async function POST(request: NextRequest) {
  const { businessInput } = await request.json();

  if (!businessInput?.trim()) {
    return Response.json({ error: "Missing input" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(businessInput);
  const text = result.response.text();
  const html = text.replace(/```html/g, "").replace(/```/g, "");

  return Response.json({ html });
}
