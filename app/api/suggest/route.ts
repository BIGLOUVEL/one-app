import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

type StepType = "month" | "week" | "today" | "rightNow" | "why"

interface SuggestInput {
  somedayGoal: string
  stepType: StepType
  // Context from previous steps
  monthGoal?: string
  weekGoal?: string
  todayGoal?: string
}

const stepDescriptions: Record<StepType, { name: string; question: string; rules: string; examples: string }> = {
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
    const stepInfo = stepDescriptions[input.stepType]

    const contextParts = []
    if (input.monthGoal) contextParts.push(`- Objectif du MOIS: "${input.monthGoal}"`)
    if (input.weekGoal) contextParts.push(`- Objectif de la SEMAINE: "${input.weekGoal}"`)
    if (input.todayGoal) contextParts.push(`- Objectif du JOUR: "${input.todayGoal}"`)
    const context = contextParts.length > 0 ? `\n\nCONTEXTE (objectifs déjà définis):\n${contextParts.join("\n")}` : ""

    const systemPrompt = `Tu es un coach expert en "The ONE Thing" de Gary Keller. Tu aides à définir des objectifs SMART et cohérents.

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

RÉPONDS UNIQUEMENT EN JSON VALIDE: { "suggestions": ["suggestion1", "suggestion2", "suggestion3"] }`

    const userPrompt = `OBJECTIF SOMEDAY (vision long terme): "${input.somedayGoal}"${context}

Génère 3 suggestions de ${stepInfo.name} qui répondent à la question: "${stepInfo.question}"

Rappel: Ce sont des RÉSULTATS à atteindre, pas des processus ou habitudes.`

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
