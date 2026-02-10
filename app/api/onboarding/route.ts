import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface OnboardingInput {
  somedayGoal: string
  context: {
    type: "student" | "freelance" | "startup" | "employee" | "other"
    horizon: string // "1 month", "3 months", "6 months", "1 year"
  }
  constraints: {
    hoursPerWeek: number
    deadline?: string
    resources?: string
  }
  language?: "en" | "fr"
}

interface AIGeneratedPlan {
  cascade: {
    somedayGoal: string
    yearGoal: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
  }
  oneThingStatement: string
  focusBlockPlan: {
    duration: number // 90 minutes
    steps: Array<{
      order: number
      action: string
      duration: number // minutes
    }>
  }
  risks: {
    primaryThief: "say-no" | "fear-chaos" | "poor-health" | "unsupportive-environment"
    thiefDescription: string
    parade: string // Counter-strategy
  }
  why: string
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    )
  }

  try {
    const input: OnboardingInput = await request.json()
    const lang = input.language || "en"
    const isFr = lang === "fr"

    const systemPrompt = isFr
      ? `Tu es un coach de productivité expert en "The ONE Thing" de Gary Keller. Tu aides les utilisateurs à clarifier leur objectif et à le découper en actions concrètes.

CONTEXTE:
- L'utilisateur est: ${input.context.type}
- Horizon temporel: ${input.context.horizon}
- Disponibilité: ${input.constraints.hoursPerWeek}h/semaine
${input.constraints.deadline ? `- Deadline: ${input.constraints.deadline}` : ""}
${input.constraints.resources ? `- Ressources/contraintes: ${input.constraints.resources}` : ""}

RÈGLES STRICTES:
1. Chaque niveau de la cascade doit être PLUS SPÉCIFIQUE que le précédent
2. Le "rightNowAction" doit être ULTRA ATOMIQUE (faisable en 5-15 minutes)
3. Le "ONE Thing Statement" suit le format: "Quelle est la SEULE chose que je peux faire telle que si je la fais, tout le reste devient plus facile ou inutile?"
4. Les 4 voleurs (Four Thieves) sont:
   - "say-no": Incapacité à dire non aux autres
   - "fear-chaos": Peur du chaos (perfectionnisme, procrastination)
   - "poor-health": Mauvaise santé (sommeil, énergie, exercice)
   - "unsupportive-environment": Environnement non supportif (distractions, personnes négatives)
5. Le focus block plan est pour une session de 90 minutes avec 3 étapes claires
6. RÉPONDS EN FRANÇAIS

RÉPONDS UNIQUEMENT EN JSON VALIDE (pas de markdown, pas de commentaires).`
      : `You are a productivity coach expert in "The ONE Thing" by Gary Keller. You help users clarify their objective and break it down into concrete actions.

CONTEXT:
- User profile: ${input.context.type}
- Time horizon: ${input.context.horizon}
- Availability: ${input.constraints.hoursPerWeek}h/week
${input.constraints.deadline ? `- Deadline: ${input.constraints.deadline}` : ""}
${input.constraints.resources ? `- Resources/constraints: ${input.constraints.resources}` : ""}

STRICT RULES:
1. Each cascade level must be MORE SPECIFIC than the previous one
2. The "rightNowAction" must be ULTRA ATOMIC (doable in 5-15 minutes)
3. The "ONE Thing Statement" follows the format: "What is the ONE thing I can do such that by doing it, everything else becomes easier or unnecessary?"
4. The Four Thieves are:
   - "say-no": Inability to say no to others
   - "fear-chaos": Fear of chaos (perfectionism, procrastination)
   - "poor-health": Poor health (sleep, energy, exercise)
   - "unsupportive-environment": Unsupportive environment (distractions, negative people)
5. The focus block plan is for a 90-minute session with 3 clear steps
6. RESPOND IN ENGLISH

RESPOND ONLY IN VALID JSON (no markdown, no comments).`

    const userPrompt = isFr
      ? `${input.somedayGoal ? `Objectif Someday de l'utilisateur: "${input.somedayGoal}"` : `L'utilisateur n'a pas encore d'objectif précis. En te basant sur son profil (${input.context.type}, horizon ${input.context.horizon}, ${input.constraints.hoursPerWeek}h/semaine), propose-lui un objectif ambitieux mais réaliste et construis le plan autour.`}

Génère un plan complet en JSON avec cette structure exacte:
{
  "cascade": {
    "somedayGoal": "objectif long terme reformulé et clarifié",
    "yearGoal": "ce qui doit être accompli cette année pour y arriver",
    "monthGoal": "ce qui doit être accompli ce mois-ci",
    "weekGoal": "ce qui doit être accompli cette semaine",
    "todayGoal": "ce qui doit être accompli aujourd'hui",
    "rightNowAction": "l'action immédiate ultra-spécifique à faire maintenant (5-15 min)"
  },
  "oneThingStatement": "La question focalisante personnalisée",
  "focusBlockPlan": {
    "duration": 90,
    "steps": [
      { "order": 1, "action": "action concrète 1", "duration": 30 },
      { "order": 2, "action": "action concrète 2", "duration": 30 },
      { "order": 3, "action": "action concrète 3", "duration": 30 }
    ]
  },
  "risks": {
    "primaryThief": "un des 4 voleurs",
    "thiefDescription": "pourquoi ce voleur est le plus probable pour cet utilisateur",
    "parade": "stratégie concrète pour contrer ce voleur"
  },
  "why": "une phrase de motivation qui capture l'essence du pourquoi"
}`
      : `${input.somedayGoal ? `User's Someday Goal: "${input.somedayGoal}"` : `The user doesn't have a clear objective yet. Based on their profile (${input.context.type}, horizon ${input.context.horizon}, ${input.constraints.hoursPerWeek}h/week), suggest an ambitious but realistic objective and build the plan around it.`}

Generate a complete plan in JSON with this exact structure:
{
  "cascade": {
    "somedayGoal": "long-term goal rephrased and clarified",
    "yearGoal": "what needs to be accomplished this year to get there",
    "monthGoal": "what needs to be accomplished this month",
    "weekGoal": "what needs to be accomplished this week",
    "todayGoal": "what needs to be accomplished today",
    "rightNowAction": "the ultra-specific immediate action to do now (5-15 min)"
  },
  "oneThingStatement": "The personalized focusing question",
  "focusBlockPlan": {
    "duration": 90,
    "steps": [
      { "order": 1, "action": "concrete action 1", "duration": 30 },
      { "order": 2, "action": "concrete action 2", "duration": 30 },
      { "order": 3, "action": "concrete action 3", "duration": 30 }
    ]
  },
  "risks": {
    "primaryThief": "one of the 4 thieves",
    "thiefDescription": "why this thief is the most probable for this user",
    "parade": "concrete strategy to counter this thief"
  },
  "why": "a motivational sentence that captures the essence of why"
}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "Failed to generate plan" },
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
      const plan: AIGeneratedPlan = JSON.parse(content)
      return NextResponse.json({ plan })
    } catch {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const plan: AIGeneratedPlan = JSON.parse(jsonMatch[0])
        return NextResponse.json({ plan })
      }
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Onboarding API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
