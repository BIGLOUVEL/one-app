import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface InsightInput {
  // Objective data
  objective: {
    title: string
    somedayGoal: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
    deadline: string
    createdAt: string
    progress: number
    why: string
  }
  // Session data
  sessions: Array<{
    startedAt: string
    endedAt?: string
    duration: number
    actualDuration?: number
    distractions: Array<{ text: string; timestamp: string }>
    reflection?: string
    nextAction?: string
  }>
  // Habit data
  habitChallenge?: {
    startDate: string
    currentStreak: number
    longestStreak: number
    days: Array<{ date: string; completed: boolean; sessionMinutes?: number }>
  }
  // Thieves assessment
  primaryThief?: string
  // Reviews
  reviews: Array<{
    weekOf: string
    accomplishments: string
    blockers: string
    nextWeekOneThink: string
  }>
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    )
  }

  try {
    const input: InsightInput = await request.json()

    // Calculate stats
    const now = new Date()
    const deadline = new Date(input.objective.deadline)
    const createdAt = new Date(input.objective.createdAt)
    const totalDays = Math.ceil((deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    // Analyze sessions
    const totalSessions = input.sessions.length
    const totalMinutes = input.sessions.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0)
    const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0

    // Analyze work patterns
    const sessionsByHour: Record<number, number> = {}
    const sessionsByDay: Record<string, number> = {}
    input.sessions.forEach(s => {
      const date = new Date(s.startedAt)
      const hour = date.getHours()
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1
      sessionsByDay[dayOfWeek] = (sessionsByDay[dayOfWeek] || 0) + 1
    })

    const peakHour = Object.entries(sessionsByHour).sort((a, b) => b[1] - a[1])[0]?.[0]
    const peakDay = Object.entries(sessionsByDay).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Collect all distractions
    const allDistractions = input.sessions.flatMap(s => s.distractions.map(d => d.text))
    const distractionSummary = allDistractions.length > 0
      ? allDistractions.slice(-10).join("; ")
      : "Aucune distraction enregistrée"

    // Collect reflections
    const reflections = input.sessions
      .filter(s => s.reflection)
      .map(s => s.reflection)
      .slice(-5)
      .join(" | ")

    // Build context for AI
    const systemPrompt = `Tu es un coach IA expert en productivité et "The ONE Thing". Tu analyses les données d'un utilisateur et fournis des insights personnalisés.

Tu dois répondre en JSON avec cette structure exacte:
{
  "summary": "Résumé de la situation en 2-3 phrases (où en est l'utilisateur, comment il avance)",
  "insights": [
    "Insight 1 basé sur les données",
    "Insight 2 basé sur les données",
    "Insight 3 basé sur les données"
  ],
  "nextActions": [
    "Action concrète suggérée 1",
    "Action concrète suggérée 2"
  ],
  "warning": "Un avertissement si nécessaire (ou null si tout va bien)",
  "encouragement": "Un message d'encouragement personnalisé"
}

RÈGLES:
- Sois CONCRET et SPÉCIFIQUE aux données de l'utilisateur
- Utilise les chiffres et patterns que tu observes
- Donne des conseils actionnables, pas génériques
- Adapte ton ton: direct mais bienveillant
- Si l'utilisateur est en retard, sois honnête mais constructif
- Mentionne le "primary thief" si pertinent pour les conseils`

    const userPrompt = `DONNÉES DE L'UTILISATEUR:

📎 OBJECTIF:
- Grand objectif (Someday): "${input.objective.somedayGoal}"
- Objectif du mois: "${input.objective.monthGoal}"
- Objectif de la semaine: "${input.objective.weekGoal}"
- Objectif du jour: "${input.objective.todayGoal}"
- Action immédiate: "${input.objective.rightNowAction}"
- Pourquoi: "${input.objective.why}"
- Progression: ${input.objective.progress}%

⏱️ TEMPS:
- Deadline: ${deadline.toLocaleDateString('fr-FR')} (dans ${daysRemaining} jours)
- Jours écoulés: ${daysElapsed}/${totalDays}
- Progression attendue: ~${Math.round((daysElapsed / totalDays) * 100)}%

📊 SESSIONS DE TRAVAIL:
- Total sessions: ${totalSessions}
- Temps total: ${totalMinutes} minutes (~${Math.round(totalMinutes / 60)} heures)
- Durée moyenne par session: ${avgSessionMinutes} minutes
- Heure de travail préférée: ${peakHour ? `${peakHour}h` : 'Pas encore de données'}
- Jour le plus productif: ${peakDay || 'Pas encore de données'}

🎯 CHALLENGE 66 JOURS:
- Streak actuel: ${input.habitChallenge?.currentStreak || 0} jours
- Meilleur streak: ${input.habitChallenge?.longestStreak || 0} jours

⚠️ PRINCIPAL VOLEUR DE FOCUS:
${input.primaryThief || 'Non identifié'}

📝 DISTRACTIONS RÉCENTES:
${distractionSummary}

💭 RÉFLEXIONS DE L'UTILISATEUR:
${reflections || 'Aucune réflexion enregistrée'}

${input.reviews.length > 0 ? `
📋 DERNIÈRE REVIEW:
- Accomplissements: ${input.reviews[input.reviews.length - 1]?.accomplishments || 'N/A'}
- Blockers: ${input.reviews[input.reviews.length - 1]?.blockers || 'N/A'}
` : ''}

Analyse ces données et génère des insights personnalisés pour aider l'utilisateur à atteindre son objectif.`

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
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "Failed to generate insights" },
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
      const result = JSON.parse(content)
      return NextResponse.json({
        ...result,
        stats: {
          totalSessions,
          totalMinutes,
          avgSessionMinutes,
          peakHour: peakHour ? parseInt(peakHour) : null,
          peakDay,
          daysRemaining,
          daysElapsed,
          totalDays,
          expectedProgress: Math.round((daysElapsed / totalDays) * 100),
          actualProgress: input.objective.progress,
        }
      })
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          ...result,
          stats: {
            totalSessions,
            totalMinutes,
            avgSessionMinutes,
            peakHour: peakHour ? parseInt(peakHour) : null,
            peakDay,
            daysRemaining,
            daysElapsed,
            totalDays,
            expectedProgress: Math.round((daysElapsed / totalDays) * 100),
            actualProgress: input.objective.progress,
          }
        })
      }
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Insights API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
