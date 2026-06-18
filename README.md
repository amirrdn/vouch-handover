# Vouch Builder Test - Night-Shift Handover

A timeboxed (2-hour) take-home assignment to build an automated night-shift handover service for hotel managers. 

This project takes unstructured, multi-lingual night shift logs and structured event data, reconciling them into a clean, action-first dashboard using an LLM.

## Live Demo

- **Frontend Dashboard:** [https://vouch-handover-psi.vercel.app/](https://vouch-handover-psi.vercel.app/)
- **API Endpoint:** `https://vouch-handover-psi.vercel.app/api/handover`

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI / LLM:** Groq API (Llama-3.3-70b-versatile)

## Testing the API

The core reconciliation engine reads from the local `/data` directory and parses the unstructured logs using an LLM with a strict "Zero-Hallucination" system prompt.

You can test the endpoint directly using curl:
bash
curl [https://vouch-handover-psi.vercel.app/api/handover](https://vouch-handover-psi.vercel.app/api/handover)


## Running Locally

If you want to run this project on your local machine:

1. Clone the repository:
  bash
   git clone [https://github.com/amirrdn/vouch-handover.git](https://github.com/amirrdn/vouch-handover.git)
   cd vouch-handover
   
2. Install dependencies:
  bash
   npm install
   
3. Set up environment variables:
  Create a `.env.local` file in the root directory and add your Groq API Key:
   env
   GROQ_API_KEY=your_groq_api_key_here
   
4. Start the development server:
  bash
   npm run dev
   
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation & Decisions

Please refer to [DECISIONS.md](./DECISIONS.md) for a detailed breakdown of trade-offs, architecture decisions, and how AI was used (and constrained) during this build. 

The AI IDE rules used during development are located in `.cursorrules`.