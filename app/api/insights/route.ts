export const dynamic = "force-dynamic"

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
      : "No distractions recorded"

    // Collect reflections
    const reflections = input.sessions
      .filter(s => s.reflection)
      .map(s => s.reflection)
      .slice(-5)
      .join(" | ")

    // Build context for AI
    const systemPrompt = `You are an AI coach expert in productivity and "The ONE Thing" methodology. You analyze user data and provide personalized insights.

You must respond in JSON with this exact structure:
{
  "summary": "Summary of the situation in 2-3 sentences (where the user stands, how they're progressing)",
  "insights": [
    "Data-based insight 1",
    "Data-based insight 2",
    "Data-based insight 3"
  ],
  "nextActions": [
    "Concrete suggested action 1",
    "Concrete suggested action 2"
  ],
  "warning": "A warning if necessary (or null if everything is fine)",
  "encouragement": "A personalized encouragement message"
}

RULES:
- Be CONCRETE and SPECIFIC to the user's data
- Use the numbers and patterns you observe
- Give actionable advice, not generic tips
- Adapt your tone: direct but supportive
- If the user is behind schedule, be honest but constructive
- Mention the "primary thief" if relevant to your advice`

    const userPrompt = `USER DATA:

OBJECTIVE:
- Big goal (Someday): "${input.objective.somedayGoal}"
- Month goal: "${input.objective.monthGoal}"
- Week goal: "${input.objective.weekGoal}"
- Today goal: "${input.objective.todayGoal}"
- Immediate action: "${input.objective.rightNowAction}"
- Why: "${input.objective.why}"
- Progress: ${input.objective.progress}%

TIME:
- Deadline: ${deadline.toLocaleDateString('en-US')} (${daysRemaining} days remaining)
- Days elapsed: ${daysElapsed}/${totalDays}
- Expected progress: ~${Math.round((daysElapsed / totalDays) * 100)}%

WORK SESSIONS:
- Total sessions: ${totalSessions}
- Total time: ${totalMinutes} minutes (~${Math.round(totalMinutes / 60)} hours)
- Average session duration: ${avgSessionMinutes} minutes
- Preferred work hour: ${peakHour ? `${peakHour}:00` : 'No data yet'}
- Most productive day: ${peakDay || 'No data yet'}

66-DAY CHALLENGE:
- Current streak: ${input.habitChallenge?.currentStreak || 0} days
- Best streak: ${input.habitChallenge?.longestStreak || 0} days

PRIMARY FOCUS THIEF:
${input.primaryThief || 'Not identified'}

RECENT DISTRACTIONS:
${distractionSummary}

USER REFLECTIONS:
${reflections || 'No reflections recorded yet'}

${input.reviews.length > 0 ? `
LATEST REVIEW:
- Accomplishments: ${input.reviews[input.reviews.length - 1]?.accomplishments || 'N/A'}
- Blockers: ${input.reviews[input.reviews.length - 1]?.blockers || 'N/A'}
` : ''}

Analyze this data and generate personalized insights to help the user achieve their objective.`

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
