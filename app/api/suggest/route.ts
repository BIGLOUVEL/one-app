import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

type StepType = "month" | "week" | "today" | "rightNow" | "why"

interface SuggestInput {
  somedayGoal: string
  stepType: StepType
  monthGoal?: string
  weekGoal?: string
  todayGoal?: string
  language?: "en" | "fr"
}

const stepDescriptionsEn: Record<StepType, { name: string; question: string; rules: string; examples: string }> = {
  month: {
    name: "monthly goal",
    question: "If you could only accomplish ONE thing this month, what would it be?",
    rules: `- It's a RESULT to achieve in ~30 days, not a daily habit
- Phrase as a concrete deliverable (e.g., "Have X", "Complete Y", "Launch Z")
- Must be ambitious yet realistic for 1 month of work
- ONE single goal, not multiple combined`,
    examples: `GOOD: "Have 5 finalized beats published on my platform"
GOOD: "Complete the mixing of my 4-track EP"
BAD: "Make music every day" (that's a habit, not a result)
BAD: "Learn FL Studio and create beats" (that's 2 goals)`
  },
  week: {
    name: "weekly goal",
    question: "If you could only accomplish ONE thing this week (7 days), what would it be?",
    rules: `- It's a RESULT to achieve in exactly 7 days
- Must be a concrete step toward the monthly goal
- Phrase as a deliverable: "Have completed X", "Have created Y"
- Realistic scope for one week of work`,
    examples: `GOOD: "Have completed the structure and melodies of 2 beats"
GOOD: "Have mixed and mastered the first track of the EP"
BAD: "Work 2h per day on my music" (that's a process, not a result)
BAD: "Finish a beat in 1 day" (that's not a weekly goal)`
  },
  today: {
    name: "today's goal",
    question: "If you could only accomplish ONE thing today, what would it be?",
    rules: `- It's a RESULT to achieve today (a few hours of work)
- Must be a step toward the weekly goal
- Phrase as: "Have X completed", "Have created Y"
- Must be doable in 2-4 hours of focus`,
    examples: `GOOD: "Have completed the main melody of beat #1"
GOOD: "Have recorded all percussion for the track"
BAD: "Work on my beat" (too vague)
BAD: "Finish 3 beats" (not realistic for 1 day)`
  },
  rightNow: {
    name: "RIGHT NOW immediate action",
    question: "What is the FIRST micro-action to do right now to get started?",
    rules: `- Ultra-concrete action doable in 5-15 minutes MAX
- Zero thinking required, just execute
- Must be the first domino that triggers everything else
- Start with a precise action verb`,
    examples: `GOOD: "Open FL Studio and load the beat template"
GOOD: "Listen to the current beat and note 3 elements to improve"
BAD: "Work on the music" (too vague)
BAD: "Create a complete beat" (too long for RIGHT NOW)`
  },
  why: {
    name: "motivation WHY",
    question: "Why does this goal truly matter to you?",
    rules: `- A personal and emotional sentence
- Must touch a deep motivation (pride, freedom, proving something)
- Will be re-read when motivation drops`,
    examples: `GOOD: "To prove I can make a living from my passion"
GOOD: "To have no regrets in 10 years"
BAD: "Because it's good" (not personal)
BAD: "To make money" (too generic)`
  }
}

const stepDescriptionsFr: Record<StepType, { name: string; question: string; rules: string; examples: string }> = {
  month: {
    name: "objectif du mois",
    question: "Si tu ne pouvais accomplir qu'UNE SEULE chose ce mois-ci, ce serait quoi?",
    rules: `- C'est un RÉSULTAT à atteindre en ~30 jours, pas une habitude quotidienne
- Formule comme un livrable concret (ex: "Avoir X", "Terminer Y", "Lancer Z")
- Doit être ambitieux mais réaliste pour 1 mois de travail
- UN seul objectif, pas plusieurs combinés`,
    examples: `BON: "Avoir 5 beats finalisés et publiés sur ma plateforme"
BON: "Terminer le mixage de mon EP 4 titres"
MAUVAIS: "Faire de la musique tous les jours" (c'est une habitude, pas un résultat)
MAUVAIS: "Apprendre FL Studio et créer des beats" (c'est 2 objectifs)`
  },
  week: {
    name: "objectif de la semaine",
    question: "Si tu ne pouvais accomplir qu'UNE SEULE chose cette semaine (7 jours), ce serait quoi?",
    rules: `- C'est un RÉSULTAT à atteindre en 7 jours exactement
- Doit être une étape concrète vers l'objectif du mois
- Formule comme un livrable: "Avoir terminé X", "Avoir créé Y"
- Scope réaliste pour une semaine de travail`,
    examples: `BON: "Avoir terminé la structure et les mélodies de 2 beats"
BON: "Avoir mixé et masterisé le premier titre de l'EP"
MAUVAIS: "Travailler 2h par jour sur ma musique" (c'est un process, pas un résultat)
MAUVAIS: "Finir un beat en 1 jour" (ce n'est pas un objectif semaine)`
  },
  today: {
    name: "objectif du jour",
    question: "Si tu ne pouvais accomplir qu'UNE SEULE chose aujourd'hui, ce serait quoi?",
    rules: `- C'est un RÉSULTAT à atteindre aujourd'hui (quelques heures de travail)
- Doit être une étape vers l'objectif de la semaine
- Formule comme: "Avoir X de terminé", "Avoir créé Y"
- Doit être faisable en 2-4 heures de focus`,
    examples: `BON: "Avoir terminé la mélodie principale du beat #1"
BON: "Avoir enregistré toutes les percussions du titre"
MAUVAIS: "Travailler sur mon beat" (trop vague)
MAUVAIS: "Finir 3 beats" (pas réaliste pour 1 jour)`
  },
  rightNow: {
    name: "action immédiate RIGHT NOW",
    question: "Quelle est la PREMIÈRE micro-action à faire maintenant pour démarrer?",
    rules: `- Action ultra-concrète faisable en 5-15 minutes MAX
- Zéro réflexion requise, juste exécuter
- Doit être le premier domino qui lance tout le reste
- Commence par un verbe d'action précis`,
    examples: `BON: "Ouvrir FL Studio et charger le template de beat"
BON: "Écouter le beat en cours et noter 3 éléments à améliorer"
MAUVAIS: "Travailler sur la musique" (trop vague)
MAUVAIS: "Créer un beat complet" (trop long pour RIGHT NOW)`
  },
  why: {
    name: "motivation WHY",
    question: "Pourquoi cet objectif compte vraiment pour toi?",
    rules: `- Une phrase personnelle et émotionnelle
- Doit toucher une motivation profonde (fierté, liberté, prouver quelque chose)
- Sera relue quand la motivation baisse`,
    examples: `BON: "Pour prouver que je peux vivre de ma passion"
BON: "Pour ne plus avoir de regrets dans 10 ans"
MAUVAIS: "Parce que c'est bien" (pas personnel)
MAUVAIS: "Pour faire de l'argent" (trop générique)`
  }
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    )
  }

  try {
    const input: SuggestInput = await request.json()
    const isFr = input.language === "fr"
    const stepDescriptions = isFr ? stepDescriptionsFr : stepDescriptionsEn
    const stepInfo = stepDescriptions[input.stepType]

    const contextParts = []
    if (input.monthGoal) contextParts.push(`- ${isFr ? "Objectif du MOIS" : "MONTH goal"}: "${input.monthGoal}"`)
    if (input.weekGoal) contextParts.push(`- ${isFr ? "Objectif de la SEMAINE" : "WEEK goal"}: "${input.weekGoal}"`)
    if (input.todayGoal) contextParts.push(`- ${isFr ? "Objectif du JOUR" : "TODAY goal"}: "${input.todayGoal}"`)
    const context = contextParts.length > 0 ? `\n\n${isFr ? "CONTEXTE (objectifs déjà définis)" : "CONTEXT (already defined goals)"}:\n${contextParts.join("\n")}` : ""

    const systemPrompt = isFr
      ? `Tu es un coach expert en "The ONE Thing" de Gary Keller. Tu aides à définir des objectifs SMART et cohérents.

QUESTION QUE SE POSE L'UTILISATEUR:
"${stepInfo.question}"

RÈGLES STRICTES POUR ${stepInfo.name.toUpperCase()}:
${stepInfo.rules}

EXEMPLES:
${stepInfo.examples}

IMPORTANT:
- Chaque suggestion doit être DIFFÉRENTE et offrir une approche distincte
- Les suggestions doivent être COHÉRENTES avec l'horizon temporel (${input.stepType === 'month' ? '~30 jours' : input.stepType === 'week' ? '7 jours' : input.stepType === 'today' ? 'quelques heures' : input.stepType === 'rightNow' ? '5-15 minutes' : 'motivation'})
- Adapte au domaine spécifique de l'utilisateur
- Sois CONCRET et PRÉCIS, pas générique
- RÉPONDS EN FRANÇAIS

RÉPONDS UNIQUEMENT EN JSON VALIDE: { "suggestions": ["suggestion1", "suggestion2", "suggestion3"] }`
      : `You are an expert coach in "The ONE Thing" by Gary Keller. You help define SMART and coherent goals.

QUESTION THE USER IS ASKING:
"${stepInfo.question}"

STRICT RULES FOR ${stepInfo.name.toUpperCase()}:
${stepInfo.rules}

EXAMPLES:
${stepInfo.examples}

IMPORTANT:
- Each suggestion must be DIFFERENT and offer a distinct approach
- Suggestions must be CONSISTENT with the time horizon (${input.stepType === 'month' ? '~30 days' : input.stepType === 'week' ? '7 days' : input.stepType === 'today' ? 'a few hours' : input.stepType === 'rightNow' ? '5-15 minutes' : 'motivation'})
- Adapt to the user's specific domain
- Be CONCRETE and PRECISE, not generic
- RESPOND IN ENGLISH

RESPOND ONLY IN VALID JSON: { "suggestions": ["suggestion1", "suggestion2", "suggestion3"] }`

    const userPrompt = isFr
      ? `OBJECTIF SOMEDAY (vision long terme): "${input.somedayGoal}"${context}

Génère 3 suggestions de ${stepInfo.name} qui répondent à la question: "${stepInfo.question}"

Rappel: Ce sont des RÉSULTATS à atteindre, pas des processus ou habitudes.`
      : `SOMEDAY GOAL (long-term vision): "${input.somedayGoal}"${context}

Generate 3 suggestions for ${stepInfo.name} that answer the question: "${stepInfo.question}"

Reminder: These are RESULTS to achieve, not processes or habits.`

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
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "Failed to generate suggestions" },
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
      return NextResponse.json(result)
    } catch {
      // Try to extract JSON from the response
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
    console.error("Suggest API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
