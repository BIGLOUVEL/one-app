# THE ONE LOOP — Design Document

> **Version 1.0 — Mars 2026**
> Ce document décrit le fonctionnement exact du loop quotidien et hebdomadaire de ONE.
> Il est la référence pour toute décision de product, design, et code sur le flow utilisateur.

---

## Philosophie

ONE n'est pas un dashboard à consulter. C'est un **rythme à suivre**.

L'app doit guider le user comme un coach silencieux :
- Le matin : "Voilà ce que tu fais aujourd'hui."
- Pendant la journée : "Tu es en session. Ferme tout le reste."
- Le soir : "Tu as avancé. Voilà ce que tu fais demain."
- Le lundi : "Nouvelle semaine. Voilà tes 3 outcomes."

Le user ne doit **jamais se demander quoi faire ensuite**. L'app le lui dit.

---

## Les 2 niveaux du loop

### LOOP QUOTIDIEN

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│   [1. PLAN]          [2. FOCUS]          [3. ENREGISTRE]         │
│                                                                   │
│   "Qu'est-ce que    "Fais-le. 50min.    "Domino tombé.           │
│    je fais           Tout le reste       Demain tu fais quoi ?"  │
│    aujourd'hui ?"    peut attendre."                              │
│                                                                   │
│   → Confirme ou     → Bunker check      → Reflection             │
│     modifie           → Timer            → Next action           │
│     rightNowAction   → Session active   → Streak +1              │
│                       → Reflection       → Home: DONE            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Étape 1 — PLAN (Home: état EMPTY ou READY)**
- L'app affiche le daily check si c'est le premier accès du jour
- L'user confirme ou ajuste son `rightNowAction`
- Le home passe en état `READY` : action définie, session pas encore commencée
- CTA unique : "Start Focus Session"

**Étape 2 — FOCUS (/app/focus)**
- Bunker checklist (phone off, notifs off, porte fermée, bruit géré)
- Choix de durée : 15 / 30 / 50 min
- Timer actif — l'app est en mode bunker
- À la fin : état REFLECTION

**Étape 3 — ENREGISTRE (Reflection → Recenter → Home DONE)**
- Reflection : "Qu'est-ce que j'ai accompli ?" + next action optionnelle
- Recenter : confirmation de la prochaine rightNowAction
- Auto : habit day ✓ + domino +1 + progression recalculée + contract stabilisé
- Home DONE : "Un domino est tombé. Demain tu fais quoi ?"

---

### LOOP HEBDOMADAIRE

```
LUNDI MATIN
│
├─ Home affiche: "Semaine non planifiée — 3 outcomes à définir"
│
├─ → /app/411 (Plan)
│    ├─ Outcome 1: _______________
│    ├─ Outcome 2: _______________  ← aligné avec l'objectif mensuel
│    └─ Outcome 3: _______________
│
├─ → Home: "Semaine planifiée ✓"
│
└─ Loop quotidien × 5 jours
     └─ Vendredi soir: "Semaine terminée — revoir ?"  → /app/review


DIMANCHE SOIR (optionnel)
└─ Nudge: "Planifie ta semaine avant lundi" → /app/411
```

---

## Les états de la Home

| État | Condition | Ce que l'user voit | CTA principal |
|------|-----------|-------------------|---------------|
| `empty` | Pas de `rightNowAction` définie | Champ texte + message guide | "Quelle est ton action maintenant ?" |
| `ready` | Action définie, session pas commencée | L'action en grand + contexte | "Start Focus Session" |
| `in-session` | Session active en cours | Timer animé + lien retour | "Return to session" |
| `done` | `todayGoalCompleted = true` | Action barrée + streak | "Définir l'action de demain" |

---

## Les transitions automatiques (store)

Ces événements se déclenchent **sans action du user** :

| Trigger | Auto-déclenché | Résultat |
|---------|----------------|----------|
| `endSession()` | ✅ | Habit day marqué, domino +1, progress recalculé, contract stabilisé |
| `completeTodayGoal()` | ✅ | Domino +1, contract stabilisé, TomorrowModal affiché |
| Nouveau jour (app open) | ✅ `DailyDominoCheck` | Reset `rightNowCompleted` + `todayGoalCompleted`, DailyCheck modal |
| App open (toujours) | ✅ `updateContractState()` | Tension recalculée selon inactivité et deadline |

---

## Les nudges contextuels (Bloc 2)

### Après une session (écran RECENTER)
```
✅ Session enregistrée

🔥 Streak : X jours    📊 X sessions    ⚡ X dominos tombés

[ Ton prochain focus : _________________________ ]

[si lundi ou 4-1-1 pas remplie cette semaine]
┌────────────────────────────────────────────┐
│  📋 Ta semaine n'est pas encore planifiée  │
│  Définis tes 3 outcomes →                  │
└────────────────────────────────────────────┘
```

### Sur Home (état DONE)
```
✓ Journée complète.

[Demain tu fais quoi ?]  ← TomorrowModal

[si lundi]
┌──────────────────────────────────────────────┐
│  Nouvelle semaine.                            │
│  Planifie tes 3 outcomes pour avancer vite.  │
│  → Plan de la semaine                        │
└──────────────────────────────────────────────┘
```

---

## Le Loop Indicator (Bloc 3)

Un composant minimaliste visible sur Home en permanence.
Il montre où en est le user dans le loop du jour.

```
PLAN  ──●──  FOCUS  ──○──  DONE
         ↑ étape active
```

3 états possibles :
- `plan` — action pas encore confirmée (état home: `empty`)
- `focus` — action confirmée, session pas encore faite (état home: `ready` ou `in-session`)
- `done` — session faite (état home: `done`)

---

## La cascade complète (Bloc 4)

Chaque objectif a 6 niveaux qui se déclinent du grand vers le petit :

```
SOMEDAY GOAL     "Devenir un auteur publié"
      ↓
YEAR GOAL        "Finir le premier manuscrit"
      ↓
MONTH GOAL       "Écrire les chapitres 1-5"
      ↓
WEEK GOAL        "Écrire 3 000 mots cette semaine"
      ↓
TODAY GOAL       "Écrire le chapitre 2"
      ↓
RIGHT NOW        "Écrire 500 mots sur le personnage principal"  ← l'action immédiate
```

La page `/app/define` doit afficher toute cette cascade.
Le user peut modifier `todayGoal` et `rightNowAction` sans toucher à l'objectif verrouillé.

---

## Ce qui est verrouillé vs modifiable

| Champ | Verrouillé ? | Raison |
|-------|--------------|--------|
| `somedayGoal` | 🔒 Oui | Lock Principle — un seul objectif à la fois |
| `yearGoal` | 🔒 Oui | Défini en onboarding, stable |
| `monthGoal` | 🔒 Oui | Défini en onboarding, stable |
| `weekGoal` | ✏️ Modifiable via 4-1-1 | Change chaque semaine |
| `todayGoal` | ✏️ Modifiable | Change chaque jour |
| `rightNowAction` | ✏️ Modifiable | Change souvent |

---

## Règles de design

1. **Un seul CTA par état** — jamais deux boutons d'égale importance
2. **Le next step doit être évident** — si l'user doit réfléchir à quoi faire, on a échoué
3. **Feedback immédiat** — chaque action (session terminée, jour marqué, streak) doit donner un retour visuel
4. **Pas de menu, juste un chemin** — la sidebar est là pour naviguer, pas pour décider
5. **Le streak est sacré** — le 66-day tracker est le fil d'Ariane émotionnel de l'app

---

## Anti-patterns à éviter

- ❌ Montrer 3 CTA sur le même écran
- ❌ Laisser l'user sur un écran sans next step
- ❌ Laisser le contractMeter en tension sans le signaler
- ❌ Permettre de skipper le daily check silencieusement
- ❌ Afficher des stats sans contexte ("3 sessions" → "3 sessions cette semaine, objectif : 5")
