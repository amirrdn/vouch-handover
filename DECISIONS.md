# Decisions & Trade-offs

**1. What I built and what I deliberately skipped (and why)**
- I built a Next.js App Router project containing a single API route (`/api/handover`) and a simple React frontend.
- **Skipped:** Database setup and Docker. Given the 2-hour timebox, reading the raw files using `fs` directly from the `/data` folder was the most pragmatic approach. I also skipped complex CSS in favor of basic Tailwind utilities ("utility over beauty").

**2. How I handled reconciliation across nights**
- I delegated the data parsing and reconciliation to an LLM (Llama 3.3 via Groq) since the `night-logs.md` contains unstructured, multi-lingual text that would take hours to parse manually via regex. 

**3. Grounding and preventing AI hallucinations**
- I used a very strict System Prompt with a "Zero Hallucination" policy. 
- The model is explicitly instructed *not* to guess when the JSON and Markdown contradict each other (e.g., Room 205 showing in-house in the system but empty in the physical log). Instead, the AI is forced to push these anomalies into a `flagged_for_review` array so the human manager can investigate.
- I set the model temperature to `0.1` to reduce creative variance.

**4. Where AI helped most, and where it got in the way**
- **Helped:** AI was incredible at structuring the messy Markdown log and categorizing the events in seconds. It also generated the React UI flawlessly on the first prompt via Cursor.
- **Got in the way:** When generating the UI, the AI took my "color-coding" instructions very literally, making the urgent sections look almost like system errors! It required a bit of human judgment to realize the code was perfectly fine, just very intensely styled.

**5. What I'd do in hours 3–6**
- Move the file reading logic to a cloud storage bucket (AWS S3 / Supabase).
- Add authentication so only authorized managers can read the handover.
- Add a "Mark as Resolved" button on the frontend that updates a database.

**6. One thing that surprised me**
- How well the open-source Llama-3.3 model handled the mix of English and Mandarin in the raw Markdown logs without needing specialized translation pre-processing.