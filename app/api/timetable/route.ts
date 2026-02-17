export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface TimetableInput {
  image?: string
  mode?: "image" | "analyze"
  objective: {
    somedayGoal: string
    monthGoal: string
    weekGoal: string
    todayGoal: string
    rightNowAction: string
    why: string
  }
  language?: "en" | "fr"
  existingEvents?: { day: string; startTime: string; endTime: string; title: string; category?: string }[]
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
    const isAnalyzeMode = input.mode === "analyze"

    // In image mode, require an image
    if (!isAnalyzeMode && (!input.image || !input.image.startsWith("data:image/"))) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      )
    }

    // In analyze mode, require existing events
    if (isAnalyzeMode && (!input.existingEvents || input.existingEvents.length === 0)) {
      return NextResponse.json(
        { error: "No events to analyze" },
        { status: 400 }
      )
    }

    const objectiveContext = `USER'S ONE OBJECTIVE:
- Long-term vision: ${input.objective.somedayGoal}
- This month's focus: ${input.objective.monthGoal}
- This week's goal: ${input.objective.weekGoal}
- Today's action: ${input.objective.todayGoal}
- Why it matters: ${input.objective.why}`

    const jsonFormat = `{
  "events": [
    {
      "day": "monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "title": "Event name",
      "category": "Class",
      "priority": "medium",
      "reasoning": "${isFr ? "Explication spécifique de pourquoi cette priorité par rapport à l'objectif de l'utilisateur" : "Specific explanation of why this priority relative to the user's objective"}",
      "suggestion": "${isFr ? "Suggestion concrète d'optimisation ou null" : "Concrete optimization suggestion or null"}"
    }
  ],
  "insights": {
    "focusScore": 65,
    "totalHours": 30,
    "highPriorityHours": 12,
    "mediumPriorityHours": 10.5,
    "lowPriorityHours": 7.5,
    "topInsight": "${isFr ? "L'observation la plus importante sur cet emploi du temps" : "The most important observation about this schedule"}",
    "biggestTimeWaster": "${isFr ? "Le plus gros gouffre de temps identifié" : "The biggest time sink identified"}",
    "bestTimeSlot": "${isFr ? "Le meilleur créneau pour avancer sur l'objectif" : "The best time slot for the objective"}",
    "recommendations": ["${isFr ? "3-5 recommandations concrètes" : "3-5 concrete recommendations"}"]
  }
}`

    let systemPrompt: string
    let userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }>

    if (isAnalyzeMode) {
      // TEXT-ONLY MODE: Analyze existing events against the objective
      const eventsListText = input.existingEvents!.map(e =>
        `- ${e.day} ${e.startTime}-${e.endTime}: "${e.title}" (${e.category || "Other"})`
      ).join("\n")

      systemPrompt = `You are an expert schedule analyst using "The ONE Thing" methodology by Gary Keller.

You will receive a list of events from the user's weekly schedule. Your job is to analyze EACH event and determine how relevant it is to the user's ONE objective.

For EACH event, assign a priority:
- "high" = This activity DIRECTLY advances the user's main goal. It's productive time that moves the needle.
- "medium" = This is necessary but doesn't directly advance the goal (meals, admin, commute). Neutral.
- "low" = This is wasted time or actively harms progress toward the goal.

For EACH event, provide:
- "reasoning": A specific 1-2 sentence explanation of WHY you assigned this priority level, referencing the user's actual objective
- "suggestion": A concrete suggestion to optimize this time slot (can be null if already optimal)

${objectiveContext}

RULES:
- Return ALL events from the input with their analysis
- Keep the exact same day, startTime, endTime, title, category from the input
- Be BRUTALLY HONEST. If something doesn't serve the goal, say so.
- ${isFr ? "Write reasoning, suggestions, and insights text in FRENCH. Keep JSON keys and enum values in English." : "Write all text in English."}
- RESPOND ONLY WITH VALID JSON, no markdown, no backticks.`

      userContent = [{
        type: "text",
        text: `Analyze these events against the user's objective:\n\n${eventsListText}\n\nReturn this EXACT JSON structure:\n${jsonFormat}\n\nIMPORTANT: Return ALL events listed above with their priority analysis. The focusScore (0-100) represents what percentage of the schedule is dedicated to high-impact activities.`
      }]
    } else {
      // IMAGE MODE: Extract events from image + analyze
      const existingEventsContext = input.existingEvents && input.existingEvents.length > 0
        ? `\n\nEXISTING EVENTS ALREADY IN THE USER'S TIMETABLE (DO NOT include these in your response — only extract NEW events visible in the image that are NOT in this list):\n${input.existingEvents.map(e => `- ${e.day} ${e.startTime}-${e.endTime}: "${e.title}"`).join("\n")}`
        : ""

      systemPrompt = `You are an expert schedule analyst using "The ONE Thing" methodology by Gary Keller.

YOUR TASK:
1. CAREFULLY read the schedule/timetable image. Pay extreme attention to:
   - The COLUMN HEADERS: they tell you which day each column represents (Monday/Lundi, Tuesday/Mardi, etc.)
   - The TIME LABELS on the left/right side: they tell you the exact start and end times
   - The TEXT INSIDE each block: that's the event title/activity name
   - If the image shows days in French (Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche), map them to: monday, tuesday, wednesday, thursday, friday, saturday, sunday

2. For EACH event you extract, ANALYZE its relevance to the user's ONE objective:
   - "high" = This activity DIRECTLY advances the user's main goal. It's productive time that moves the needle.
   - "medium" = This is necessary but doesn't directly advance the goal (meals, admin, some classes, commute). Neutral.
   - "low" = This is wasted time or actively harms progress toward the goal (excessive social media, pointless meetings, etc.)

3. For EACH event, provide:
   - "reasoning": A specific 1-2 sentence explanation of WHY you assigned this priority level, referencing the user's actual objective
   - "suggestion": A concrete suggestion to optimize this time slot (can be null if the slot is already optimal)

${objectiveContext}
${existingEventsContext}

CRITICAL RULES:
- READ THE IMAGE CAREFULLY. Match each event to the CORRECT day column and CORRECT time row.
- Days MUST be lowercase English: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
- Times MUST be 24h format: "08:00", "13:30", "17:45"
- If you can't read a time precisely, round to the nearest 15 minutes
- Category must be one of: "Deep Work", "Meeting", "Admin", "Personal", "Class", "Break", "Commute", "Exercise", "Social", "Other"
- Be BRUTALLY HONEST in your priority analysis. If something doesn't serve the goal, say so.
- ${isFr ? "Write reasoning, suggestions, and insights text in FRENCH. Keep JSON keys and enum values in English." : "Write all text in English."}
- RESPOND ONLY WITH VALID JSON, no markdown, no backticks, no explanation outside the JSON.`

      userContent = [
        { type: "text", text: `Extract ALL events from this schedule image and analyze each one against the user's objective.\n\nReturn this EXACT JSON structure:\n${jsonFormat}\n\nIMPORTANT: The insights should analyze the ENTIRE schedule holistically (including any existing events). The focusScore (0-100) represents what percentage of the schedule is dedicated to high-impact activities for the user's ONE objective.` },
        { type: "image_url", image_url: { url: input.image!, detail: "high" } },
      ]
    }

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
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 8000,
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
      return NextResponse.json(result)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json(result)
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
