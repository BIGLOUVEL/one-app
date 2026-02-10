import { NextRequest, NextResponse } from "next/server"
import { AIRoadmap, Milestone, WeeklyTarget, RiskAnalysis, KeyMetric } from "@/lib/types"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface RoadmapInput {
  objective: {
    somedayGoal: string
    yearGoal?: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
    deadline: string
    why: string
  }
  context: {
    type: string
    hoursPerWeek: number
  }
  essentialSteps?: string[]
  language?: "en" | "fr"
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    )
  }

  try {
    const input: RoadmapInput = await request.json()
    const isFr = input.language === "fr"

    const startDate = new Date()
    const endDate = new Date(input.objective.deadline)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.ceil(totalDays / 7)

    const systemPrompt = isFr
      ? `Tu es un expert en planification de projet et en méthodologie "The ONE Thing". Tu dois créer une roadmap ultra-détaillée et réaliste pour atteindre un objectif.

CONTEXTE:
- Objectif final: ${input.objective.somedayGoal}
- Objectif du mois: ${input.objective.monthGoal}
- Deadline: ${input.objective.deadline}
- Durée totale: ${totalDays} jours (${totalWeeks} semaines)
- Disponibilité: ${input.context.hoursPerWeek}h/semaine
- Profil: ${input.context.type}
${input.essentialSteps?.length ? `- Étapes essentielles identifiées par l'utilisateur: ${input.essentialSteps.join(", ")}` : ""}

RÈGLES:
1. Crée des milestones RÉALISTES basés sur le temps disponible
2. Chaque milestone a des checkpoints CONCRETS et MESURABLES
3. Les weekly targets doivent être progressifs
4. Identifie les VRAIS risques potentiels
5. Les métriques clés doivent être TRACKABLES
6. Sois HONNÊTE sur la faisabilité
7. RÉPONDS EN FRANÇAIS

RÉPONDS UNIQUEMENT EN JSON VALIDE.`
      : `You are an expert in project planning and "The ONE Thing" methodology. You must create an ultra-detailed and realistic roadmap to achieve an objective.

CONTEXT:
- Final objective: ${input.objective.somedayGoal}
- Monthly goal: ${input.objective.monthGoal}
- Deadline: ${input.objective.deadline}
- Total duration: ${totalDays} days (${totalWeeks} weeks)
- Availability: ${input.context.hoursPerWeek}h/week
- Profile: ${input.context.type}
${input.essentialSteps?.length ? `- Essential steps identified by the user: ${input.essentialSteps.join(", ")}` : ""}

RULES:
1. Create REALISTIC milestones based on available time
2. Each milestone has CONCRETE and MEASURABLE checkpoints
3. Weekly targets should be progressive (not linear if some phases are more intense)
4. Identify REAL potential risks
5. Key metrics must be TRACKABLE
6. Be HONEST about feasibility - if it's too ambitious, say so
7. RESPOND IN ENGLISH

RESPOND ONLY IN VALID JSON.`

    const userPrompt = isFr
      ? `Génère une roadmap détaillée avec cette structure exacte:
{
  "summary": {
    "totalWeeks": ${totalWeeks},
    "totalMilestones": <nombre de milestones recommandé>,
    "estimatedCompletionDate": "${input.objective.deadline}",
    "confidenceLevel": "high" | "medium" | "low",
    "riskLevel": "low" | "moderate" | "high"
  },
  "milestones": [
    {
      "id": "m1",
      "order": 1,
      "title": "Titre court du milestone",
      "description": "Description détaillée",
      "targetDate": "YYYY-MM-DD",
      "targetProgress": 25,
      "checkpoints": [{ "id": "c1", "title": "Checkpoint", "description": "Validation", "targetDate": "YYYY-MM-DD", "isCompleted": false }],
      "status": "upcoming"
    }
  ],
  "weeklyTargets": [{ "weekNumber": 1, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "targetProgress": 5, "targetSessions": 5, "focusArea": "Focus de la semaine", "milestone": "Milestone" }],
  "risks": [{ "id": "r1", "category": "time", "title": "Risque", "description": "Description", "probability": "medium", "impact": "medium", "mitigation": "Stratégie" }],
  "keyMetrics": [{ "id": "km1", "name": "Métrique", "target": 100, "unit": "sessions", "currentValue": 0, "trend": "stable" }],
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}`
      : `Generate a detailed roadmap with this exact structure:
{
  "summary": {
    "totalWeeks": ${totalWeeks},
    "totalMilestones": <recommended number of milestones>,
    "estimatedCompletionDate": "${input.objective.deadline}",
    "confidenceLevel": "high" | "medium" | "low",
    "riskLevel": "low" | "moderate" | "high"
  },
  "milestones": [
    {
      "id": "m1",
      "order": 1,
      "title": "Short milestone title",
      "description": "Detailed description of what needs to be accomplished",
      "targetDate": "YYYY-MM-DD",
      "targetProgress": 25,
      "checkpoints": [{ "id": "c1", "title": "Concrete checkpoint", "description": "What validates this checkpoint", "targetDate": "YYYY-MM-DD", "isCompleted": false }],
      "status": "upcoming"
    }
  ],
  "weeklyTargets": [{ "weekNumber": 1, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "targetProgress": 5, "targetSessions": 5, "focusArea": "What to focus on this week", "milestone": "Milestone name if applicable" }],
  "risks": [{ "id": "r1", "category": "time", "title": "Risk title", "description": "Detailed description", "probability": "medium", "impact": "medium", "mitigation": "Strategy to mitigate this risk" }],
  "keyMetrics": [{ "id": "km1", "name": "Metric name", "target": 100, "unit": "sessions/hours/etc", "currentValue": 0, "trend": "stable" }],
  "recommendations": ["Recommendation 1 to maximize chances of success", "Recommendation 2"]
}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "Failed to generate roadmap" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    try {
      const roadmapData = JSON.parse(content)

      // Build the full AIRoadmap object
      const roadmap: AIRoadmap = {
        id: `roadmap-${Date.now()}`,
        objectiveId: "", // Will be set by the client
        generatedAt: new Date().toISOString(),
        summary: roadmapData.summary,
        milestones: roadmapData.milestones,
        weeklyTargets: roadmapData.weeklyTargets,
        risks: roadmapData.risks,
        keyMetrics: roadmapData.keyMetrics,
        recommendations: roadmapData.recommendations,
      }

      return NextResponse.json({ roadmap })
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const roadmapData = JSON.parse(jsonMatch[0])
        const roadmap: AIRoadmap = {
          id: `roadmap-${Date.now()}`,
          objectiveId: "",
          generatedAt: new Date().toISOString(),
          ...roadmapData,
        }
        return NextResponse.json({ roadmap })
      }
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Roadmap API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
