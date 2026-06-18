import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `
You are an expert Hotel Operations Manager and Data Reconciler. 
Your task is to read two pieces of handover data from the night shift: 
1. A structured JSON log of events.
2. A free-text Markdown log written by relief staff (may contain multiple languages).

You must reconcile these sources and output a single, coherent Morning Handover Report in strictly valid JSON format.

## CRITICAL RULES (GROUNDING & NO HALLUCINATION)
1. You MUST NOT invent, guess, or assume any facts. Every single claim must trace directly back to the provided JSON or Markdown.
2. If the JSON and Markdown contradict each other (e.g., JSON says guest is in-house, but Markdown says room is empty/unslept), DO NOT guess who is right. You MUST put this issue into the "flagged_for_review" array.
3. Be concise and action-first.

## OUTPUT JSON SCHEMA
You must respond with a JSON object containing EXACTLY these keys (arrays of objects):
{
  "urgent_action_required": [{"room": "...", "guest": "...", "issue": "...", "source": ["..."], "action_needed": "..."}],
  "still_open": [],
  "new_tonight": [],
  "newly_resolved": [],
  "flagged_for_review": []
}
`;

export async function GET() {
  try {
    const eventsPath = path.join(process.cwd(), 'data', 'events.json');
    const logsPath = path.join(process.cwd(), 'data', 'night-logs.md');
    
    const eventsData = fs.readFileSync(eventsPath, 'utf8');
    const logsData = fs.readFileSync(logsPath, 'utf8');

    const userContent = `
    === EVENTS.JSON ===
    ${eventsData}

    === NIGHT-LOGS.MD ===
    ${logsData}
    `;

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" }, 
        temperature: 0.1 
    });

    const rawJson = response.choices[0].message.content;
    return NextResponse.json(JSON.parse(rawJson || '{}'));

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to process handover data" }, { status: 500 });
  }
}