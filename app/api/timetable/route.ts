import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface TimetableInput {
  image: string
  objective: {
    somedayGoal: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
    why: string
  }
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
    const input: TimetableInput = await request.json()
    const isFr = input.language === "fr"

    if (!input.image || !input.image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      )
    }

    const systemPrompt = isFr
      ? `Tu es un expert en gestion du temps et en méthodologie "The ONE Thing" de Gary Keller. L'utilisateur t'envoie une capture d'écran de son emploi du temps hebdomadaire. Tu dois:

1. EXTRAIRE chaque bloc de temps visible dans l'image (jour, heure début, heure fin, activité)
2. ANALYSER chaque bloc par rapport à l'objectif ONE de l'utilisateur
3. ATTRIBUER une priorité: "high" (vert: avance directement l'objectif), "medium" (jaune: neutre/supportif), "low" (rouge: perte de temps/ne sert pas l'objectif)
4. FOURNIR un résumé avec des insights actionnables

OBJECTIF ONE DE L'UTILISATEUR:
- Vision long terme: ${input.objective.somedayGoal}
- Objectif du mois: ${input.objective.monthGoal}
- Objectif de la semaine: ${input.objective.weekGoal}
- Action aujourd'hui: ${input.objective.todayGoal}
- Action immédiate: ${input.objective.rightNowAction}
- Pourquoi: ${input.objective.why}

RÈGLES:
- Sois HONNÊTE et DIRECT. Si un bloc est du temps perdu, dis-le.
- Catégorise: "Deep Work", "Meeting", "Admin", "Personal", "Class", "Break", "Commute", "Exercise", "Social", "Other"
- Les heures doivent être en format 24h (ex: "09:00", "14:30")
- Les jours en anglais lowercase: "monday", "tuesday", etc.
- RÉPONDS EN FRANÇAIS pour les textes libres, mais garde les clés JSON et valeurs d'enum en anglais
- RÉPONDS UNIQUEMENT EN JSON VALIDE`
      : `You are an expert in time management and "The ONE Thing" methodology by Gary Keller. The user sends you a screenshot of their weekly timetable/schedule. You must:

1. EXTRACT every visible time block from the image (day, start time, end time, activity)
2. ANALYZE each block against the user's ONE objective
3. ASSIGN a priority: "high" (green: directly advances the objective), "medium" (yellow: neutral/supportive), "low" (red: time waster/doesn't serve the goal)
4. PROVIDE a summary with actionable insights

USER'S ONE OBJECTIVE:
- Long-term vision: ${input.objective.somedayGoal}
- Monthly goal: ${input.objective.monthGoal}
- Weekly goal: ${input.objective.weekGoal}
- Today's action: ${input.objective.todayGoal}
- Immediate action: ${input.objective.rightNowAction}
- Why: ${input.objective.why}

RULES:
- Be HONEST and DIRECT. If a block is wasted time, say so.
- Categorize: "Deep Work", "Meeting", "Admin", "Personal", "Class", "Break", "Commute", "Exercise", "Social", "Other"
- Times in 24h format (e.g., "09:00", "14:30")
- Days in lowercase English: "monday", "tuesday", etc.
- RESPOND IN ENGLISH
- RESPOND ONLY IN VALID JSON`

    const userPrompt = isFr
      ? `Analyse cette image d'emploi du temps et génère un JSON avec cette structure exacte:
{
  "blocks": [
    {
      "id": "b1",
      "day": "monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "title": "Nom de l'activité",
      "category": "Deep Work",
      "priority": "high",
      "reasoning": "Pourquoi cette priorité",
      "suggestion": "Suggestion optionnelle d'amélioration"
    }
  ],
  "summary": {
    "totalBlocks": 20,
    "highPriorityCount": 8,
    "mediumPriorityCount": 7,
    "lowPriorityCount": 5,
    "highPriorityHours": 12,
    "mediumPriorityHours": 10.5,
    "lowPriorityHours": 7.5,
    "focusScore": 65
  },
  "insights": {
    "topInsight": "Observation principale sur l'emploi du temps",
    "biggestTimeWaster": "Le plus gros gouffre de temps identifié",
    "bestTimeSlot": "Le meilleur créneau pour avancer sur l'objectif",
    "recommendations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"]
  }
}`
      : `Analyze this timetable image and generate JSON with this exact structure:
{
  "blocks": [
    {
      "id": "b1",
      "day": "monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "title": "Activity name",
      "category": "Deep Work",
      "priority": "high",
      "reasoning": "Why this priority level",
      "suggestion": "Optional improvement suggestion"
    }
  ],
  "summary": {
    "totalBlocks": 20,
    "highPriorityCount": 8,
    "mediumPriorityCount": 7,
    "lowPriorityCount": 5,
    "highPriorityHours": 12,
    "mediumPriorityHours": 10.5,
    "lowPriorityHours": 7.5,
    "focusScore": 65
  },
  "insights": {
    "topInsight": "Main observation about the schedule",
    "biggestTimeWaster": "The biggest time sink identified",
    "bestTimeSlot": "The best slot for advancing the ONE objective",
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  }
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
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: input.image,
                  detail: "high",
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "Failed to analyze timetable" },
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

    try {
      const result = JSON.parse(content)
      return NextResponse.json({ analysis: result })
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json({ analysis: result })
      }
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Timetable API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
