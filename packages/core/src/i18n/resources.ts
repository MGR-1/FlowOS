// packages/core/src/i18n/resources.ts
// Translation resources for i18next. EN is the source of truth; NL mirrors
// the same key structure. Per Onboarding Wizard Spec v1.0 §2, both languages
// must ship in Sprint 1.
//
// Keys are namespaced by screen: onboarding.<screen>.<key>

export const en = {
  onboarding: {
    welcome: {
      heading: "Welcome to FlowOS",
      subheading:
        "Your personal operating system for elite performance. Takes about 3 minutes to set up. Everything can be changed later.",
      bullet1: "Plan your week in under 5 minutes",
      bullet2: "Know your Most Important Task every morning",
      bullet3: "Close every day with a clean shutdown",
      cta: "Let's build your workspace",
    },
    profileTemplate: {
      stepLabel: "Step 2 of 9",
      heading: "What best describes you?",
      subheading:
        "FlowOS will pre-populate your workspace with roles and routines that fit your context. You can change everything after setup.",
      continueCta: "Continue",
      hint: "Select a template to continue",
      templates: {
        founder: {
          label: "Founder",
          description: "Multiple projects, no boss, decisions all day.",
        },
        lawyer: {
          label: "Lawyer",
          description: "Billable hours, client cases, meetings all day.",
        },
        consultant: {
          label: "Consultant",
          description: "Multiple clients, deliverables, deadlines.",
        },
        manager: {
          label: "Manager",
          description: "A team, meetings, and strategic work.",
        },
        student: {
          label: "Student",
          description: "Study, work, side projects, learning.",
        },
        custom: {
          label: "Custom",
          description: "Define your own roles from scratch.",
        },
        chaos: {
          label: "Not sure where to start? Chaos-mode.",
          description:
            "Answer 5 quick questions. FlowOS builds your workspace automatically.",
        },
      },
    },
    chronotype: {
      stepLabel: "Step 3 of 9",
      heading: "When do you do your best work?",
      resultHeading: "Your chronotype",
      hint: "Tap an answer to continue — answering advances automatically.",
      continueCta: "Continue",
      backCta: "Back",
      resultTip:
        "FlowOS will use this to schedule your Investment Blocks in your peak window from day one.",
      questions: {
        cq1: {
          text: "On a free day (no alarm), what time do you wake up naturally?",
          options: {
            lion: "Before 6:00",
            bear: "6:00 – 8:00",
            wolf: "8:00 – 10:00",
            dolphin: "After 10:00",
          },
        },
        cq2: {
          text: "When do you feel most alert during a normal day?",
          options: {
            lion: "Early morning",
            bear: "Mid-morning",
            wolf: "Afternoon",
            dolphin: "Late evening",
          },
        },
        cq3: {
          text: "What time do you naturally want to fall asleep?",
          options: {
            lion: "Before 22:00",
            bear: "22:00 – 00:00",
            wolf: "00:00 – 02:00",
            dolphin: "After 02:00",
          },
        },
        cq4: {
          text: "How do you feel about mornings, honestly?",
          options: {
            lion: "Love them",
            bear: "Fine",
            wolf: "Hard",
            dolphin: "Painful",
          },
        },
      },
      profiles: {
        lion: {
          label: "Lion",
          description:
            "You peak early. Cognitive load hits its ceiling before noon. FlowOS will schedule your hardest work in the morning window.",
        },
        bear: {
          label: "Bear",
          description:
            "You track the sun. Best focus is mid-morning to early afternoon. This is the most common chronotype — FlowOS defaults to this rhythm.",
        },
        wolf: {
          label: "Wolf",
          description:
            "You come alive later. Mornings are for warmup, afternoons and evenings for deep work. FlowOS will protect your late focus window.",
        },
        dolphin: {
          label: "Dolphin",
          description:
            "You're a light, restless sleeper. Focus comes in bursts — usually mid-morning and again in the early evening. FlowOS will plan around them.",
        },
      },
    },
    missionEditor: {
      stepLabel: "Step 4 of 9",
      heading: "What are you building?",
      subheading:
        "Write your mission in one sentence. This appears at the top of every week — it's your filter for what matters and what doesn't.",
      placeholder: "e.g. Build a firm that survives without me.",
      promptLabel: "Not sure? Start with one of these:",
      cta: "Set my mission",
      prompts: [
        "Build a firm that survives without me.",
        "Reach the partnership track without burning out.",
        "Ship something people pay for before July.",
        "Be present for my family and still grow the business.",
      ],
    },
    firstWeekGoal: {
      stepLabel: "Step 5 of 9",
      heading: "Your first week goal",
      subheading:
        "What's the one result you want to achieve this week? Pick the role it belongs to, then name the outcome.",
      roleSectionLabel: "Which role does this belong to?",
      goalSectionLabel: "What does winning this week look like?",
      placeholder: "e.g. Have the first draft of the investor deck done.",
      cta: "Set goal",
      hint: "Select a role and describe your goal to continue",
    },
    calendarConnection: {
      stepLabel: "Step 6 of 9",
      heading: "Connect your calendar",
      subheading:
        "FlowOS reads your events to build an accurate day plan — meetings block time automatically. You can connect later in Settings.",
      connectCta: "Connect",
      connectingCta: "Connecting…",
      connectedBadge: "Connected",
      permissionNote:
        "FlowOS requests read-only access to event titles, times, and attendees. It never reads email content or contacts.",
      continueCta: "Continue",
      skipCta: "Skip for now — connect later",
      providers: {
        google: { label: "Google Calendar", sublabel: "Gmail, Google Workspace" },
        microsoft: { label: "Microsoft / Outlook", sublabel: "Outlook, Microsoft 365" },
      },
    },
    planningDay: {
      stepLabel: "Step 7 of 9",
      heading: "Your planning day",
      subheading:
        "FlowOS will prompt your weekly review and generate your Performance Report on this day. Friday is the default — most people plan the new week before the weekend.",
      confirmPrefix: "Every",
      confirmSuffix:
        ", FlowOS will prompt your weekly reflection and generate your Performance Report.",
      cta: "Confirm",
      days: {
        0: "Sun",
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
      },
    },
    import: {
      stepLabel: "Step 8 of 9",
      heading: "Bring in your existing tasks",
      subheading:
        "Already have a list somewhere? Paste it in or add items manually. FlowOS will process them into your Braindump inbox. You can skip this and add tasks later.",
      pasteOption: "Paste from Notion",
      manualOption: "Type manually",
      pasteLabel: "Copy your task list and paste it below. One task per line.",
      pastePlaceholder: "Task 1\nTask 2\nTask 3",
      manualLabel: "Add one task per line.",
      taskPlaceholder: "Task {{n}}",
      addTaskCta: "+ Add another task",
      tasksDetected: "{{count}} tasks detected",
      continueCta: "Import and continue",
      continueDefaultCta: "Continue",
      skipCta: "Skip — I'll add tasks later",
    },
    urgencyIndex: {
      stepLabel: "Step 9 of 9",
      stepLabelOptional: "Step 9 of 9 · Optional",
      heading: "Your urgency profile",
      subheading:
        "16 short questions. Answer honestly — nobody sees this but you and FlowOS.",
      scoreLabel: "Total score",
      hint: "Tap an answer to advance — based on Covey's First Things First.",
      resultTip:
        "You can retake this anytime in Settings → Performance → Urgency Profile.",
      finishCta: "Finish setup",
      skipCta: "Skip",
      backCta: "Back",
      options: {
        never: "Never",
        sometimes: "Sometimes",
        always: "Always",
      },
      questions: {
        q1: "I feel behind almost every day.",
        q2: "I check email or messages within the first 10 minutes of waking.",
        q3: "I say yes to things I don't have time for.",
        q4: "I move deadlines because urgent things keep coming up.",
        q5: "I feel guilty when I'm not doing something 'productive.'",
        q6: "I get more done under pressure and lean into that.",
        q7: "I interrupt strategic work to answer urgent messages.",
        q8: "My best hours of the day are used reactively, not proactively.",
        q9: "I struggle to say no to meetings even when they aren't valuable.",
        q10: "I underestimate how long tasks take.",
        q11: "I sleep less than I want to because of work.",
        q12: "I feel rushed even when nobody is chasing me.",
        q13: "I take pride in being 'busy.'",
        q14: "I check my phone as the first response to a small emotional dip.",
        q15: "I complete tasks quickly but not always well.",
        q16: "I lose track of what I said I would do this week.",
      },
      profiles: {
        prioritizer: {
          label: "Prioritizer",
          description:
            "You keep urgency in its place. FlowOS will show you your Drift Score with a light touch — you rarely need the warning.",
        },
        urgency_mindset: {
          label: "Strong urgency mindset",
          description:
            "Urgency plays a real role in how you work. FlowOS will flag drift earlier and protect your Investment Blocks harder.",
        },
        urgency_addiction: {
          label: "Urgency addiction",
          description:
            "Urgency is running the show. FlowOS will run the strictest Drift Score threshold, and will surface this pattern in your Weekly Performance Report until it moves.",
        },
      },
    },
    chaos: {
      questionsStepLabel: "Chaos-mode",
      questionsHeading: "5 quick questions",
      questionsSubheading:
        "FlowOS will build your mission, roles, and first goals for you.",
      continueCta: "Next",
      backCta: "Back",
      buildHeading: "Building your workspace",
      buildPhrases: [
        "Reading your answers…",
        "Structuring your roles…",
        "Setting up your first week…",
      ],
      reviewHeading: "Here's what I built",
      reviewSubheading: "You can edit any of this before continuing.",
      acceptCta: "Looks good — continue",
      editMyselfCta: "Actually, let me do this myself",
      q1: {
        label: "In one sentence — what are you working on right now?",
        placeholder: "e.g. Getting our seed round closed.",
      },
      q2: {
        label: "What are the 3–5 main areas of your life you want FlowOS to help you with?",
        options: {
          work: "Work",
          clients: "Clients",
          health: "Health",
          family: "Family",
          finances: "Finances",
          learning: "Learning",
          side_projects: "Side projects",
          admin: "Admin",
          team: "Team",
          creative: "Creative",
          community: "Community",
          rest: "Rest",
        },
      },
      q3: {
        label: "What is the single most important thing to get done this week?",
        placeholder: "e.g. Send the proposal to the client.",
      },
      q4: {
        label: "What are you tired of doing manually?",
        options: {
          tracking_time: "Tracking time",
          meeting_notes: "Writing meeting notes",
          planning_day: "Planning my day",
          remembering: "Remembering things",
          saying_no: "Saying no",
        },
      },
      q5: {
        label: "How much structure do you want?",
        low: "Just give me the basics",
        high: "Fully automate my day",
      },
    },
    complete: {
      heading: "You're set up.",
      subheading:
        "Your first day is ready. More features will show up as you use FlowOS — no need to configure everything today.",
      primaryCta: "Take me to Today",
    },
  },
  auth: {
    heading: "Sign in to FlowOS",
    subheadingSignIn: "Welcome back. Your setup and plan are waiting.",
    subheadingSignUp: "Create your account to save your setup across devices.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    signInCta: "Sign in",
    signUpCta: "Create account",
    toggleToSignUp: "No account yet? Create one",
    toggleToSignIn: "Already have an account? Sign in",
    working: "One moment…",
    errorEmptyFields: "Enter your email and password.",
    errorPasswordTooShort: "Use at least 8 characters.",
  },
  weekIntention: {
    heading: "Set your intention for the week",
    subheading:
      "A deliberate commitment before the week starts. On your next planning day you'll see how it went.",
    q2Label: "Q2 target",
    q2Hint: "Share of your week spent on important, non-urgent work.",
    rolesLabel: "Top 3 roles to invest in",
    rolesHint: "Pick up to three.",
    rolesEmpty: "No roles yet — add them in your workspace first.",
    intentionLabel: "Your intention in one sentence",
    intentionPlaceholder: "Protect my mornings for deep work.",
    saveCta: "Start the week",
    saving: "Saving…",
    errorGeneric: "Could not save your intention. Try again.",
  },
} as const;

export const nl = {
  onboarding: {
    welcome: {
      heading: "Welkom bij FlowOS",
      subheading:
        "Jouw persoonlijke besturingssysteem voor topprestaties. Instellen duurt ongeveer 3 minuten. Je kunt alles later nog aanpassen.",
      bullet1: "Plan je week in minder dan 5 minuten",
      bullet2: "Weet elke ochtend wat je belangrijkste taak is",
      bullet3: "Sluit elke dag netjes af",
      cta: "Werkruimte bouwen",
    },
    profileTemplate: {
      stepLabel: "Stap 2 van 9",
      heading: "Wat past het beste bij jou?",
      subheading:
        "FlowOS vult je werkruimte alvast met rollen en routines die bij jouw situatie passen. Je kunt na het instellen alles aanpassen.",
      continueCta: "Doorgaan",
      hint: "Kies een sjabloon om door te gaan",
      templates: {
        founder: {
          label: "Oprichter",
          description: "Meerdere projecten, geen baas, de hele dag beslissingen.",
        },
        lawyer: {
          label: "Advocaat",
          description: "Declarabele uren, cliëntzaken, de hele dag vergaderingen.",
        },
        consultant: {
          label: "Consultant",
          description: "Meerdere klanten, opleveringen, deadlines.",
        },
        manager: {
          label: "Manager",
          description: "Een team, vergaderingen en strategisch werk.",
        },
        student: {
          label: "Student",
          description: "Studie, werk, bijprojecten, leren.",
        },
        custom: {
          label: "Aangepast",
          description: "Stel je eigen rollen helemaal zelf samen.",
        },
        chaos: {
          label: "Geen idee waar te beginnen? Chaos-modus.",
          description:
            "Beantwoord 5 korte vragen. FlowOS bouwt je werkruimte automatisch.",
        },
      },
    },
    chronotype: {
      stepLabel: "Stap 3 van 9",
      heading: "Wanneer lever jij je beste werk?",
      resultHeading: "Jouw chronotype",
      hint: "Tik op een antwoord om door te gaan — antwoorden gaat automatisch verder.",
      continueCta: "Doorgaan",
      backCta: "Terug",
      resultTip:
        "FlowOS gebruikt dit om je Investeringsblokken vanaf dag één in jouw piekvenster te plannen.",
      questions: {
        cq1: {
          text: "Op een vrije dag (zonder wekker), hoe laat word je van nature wakker?",
          options: {
            lion: "Voor 6:00",
            bear: "6:00 – 8:00",
            wolf: "8:00 – 10:00",
            dolphin: "Na 10:00",
          },
        },
        cq2: {
          text: "Wanneer voel je je het meest alert op een gewone dag?",
          options: {
            lion: "Vroege ochtend",
            bear: "Midden in de ochtend",
            wolf: "Middag",
            dolphin: "Late avond",
          },
        },
        cq3: {
          text: "Hoe laat wil je van nature gaan slapen?",
          options: {
            lion: "Voor 22:00",
            bear: "22:00 – 00:00",
            wolf: "00:00 – 02:00",
            dolphin: "Na 02:00",
          },
        },
        cq4: {
          text: "Hoe voel je je eerlijk gezegd over ochtenden?",
          options: {
            lion: "Ik hou ervan",
            bear: "Prima",
            wolf: "Lastig",
            dolphin: "Pijnlijk",
          },
        },
      },
      profiles: {
        lion: {
          label: "Leeuw",
          description:
            "Jij piekt vroeg. Je cognitieve belasting bereikt zijn plafond voor het middaguur. FlowOS plant je zwaarste werk in de ochtend.",
        },
        bear: {
          label: "Beer",
          description:
            "Jij volgt de zon. Je beste focus zit tussen midden in de ochtend en vroege middag. Dit is het meest voorkomende chronotype — FlowOS gaat hier standaard van uit.",
        },
        wolf: {
          label: "Wolf",
          description:
            "Jij komt later op gang. Ochtenden zijn voor opwarmen, middagen en avonden voor diep werk. FlowOS beschermt je late focusvenster.",
        },
        dolphin: {
          label: "Dolfijn",
          description:
            "Jij bent een lichte, onrustige slaper. Focus komt in korte pieken — meestal midden in de ochtend en weer vroeg in de avond. FlowOS plant hieromheen.",
        },
      },
    },
    missionEditor: {
      stepLabel: "Stap 4 van 9",
      heading: "Waar werk je aan?",
      subheading:
        "Schrijf je missie in één zin. Deze staat bovenaan elke week — het is jouw filter voor wat belangrijk is en wat niet.",
      placeholder: "bijv. Een kantoor bouwen dat zonder mij overeind blijft.",
      promptLabel: "Geen idee? Begin met een van deze:",
      cta: "Missie instellen",
      prompts: [
        "Een kantoor bouwen dat zonder mij overeind blijft.",
        "Partner worden zonder op te branden.",
        "Voor juli iets uitbrengen waar mensen voor betalen.",
        "Aanwezig zijn voor mijn gezin en toch de zaak laten groeien.",
      ],
    },
    firstWeekGoal: {
      stepLabel: "Stap 5 van 9",
      heading: "Je doel voor de eerste week",
      subheading:
        "Wat is het ene resultaat dat je deze week wilt behalen? Kies de bijbehorende rol en benoem het resultaat.",
      roleSectionLabel: "Bij welke rol hoort dit?",
      goalSectionLabel: "Hoe ziet winnen deze week eruit?",
      placeholder: "bijv. Eerste concept van het investeerdersdocument af.",
      cta: "Doel instellen",
      hint: "Kies een rol en beschrijf je doel om door te gaan",
    },
    calendarConnection: {
      stepLabel: "Stap 6 van 9",
      heading: "Koppel je agenda",
      subheading:
        "FlowOS leest je afspraken om een nauwkeurige dagplanning te maken — vergaderingen blokkeren automatisch tijd. Je kunt dit later ook via Instellingen doen.",
      connectCta: "Koppelen",
      connectingCta: "Bezig met koppelen…",
      connectedBadge: "Gekoppeld",
      permissionNote:
        "FlowOS vraagt alleen-lezen toegang tot titels, tijden en deelnemers van afspraken. E-mailinhoud of contacten worden nooit gelezen.",
      continueCta: "Doorgaan",
      skipCta: "Overslaan — later koppelen",
      providers: {
        google: { label: "Google Agenda", sublabel: "Gmail, Google Workspace" },
        microsoft: { label: "Microsoft / Outlook", sublabel: "Outlook, Microsoft 365" },
      },
    },
    planningDay: {
      stepLabel: "Stap 7 van 9",
      heading: "Jouw plandag",
      subheading:
        "FlowOS vraagt je op deze dag om je wekelijkse review en genereert je Prestatierapport. Vrijdag is de standaard — de meeste mensen plannen de nieuwe week voor het weekend.",
      confirmPrefix: "Elke",
      confirmSuffix:
        " vraagt FlowOS je om je wekelijkse reflectie en genereert het je Prestatierapport.",
      cta: "Bevestigen",
      days: {
        0: "Zo",
        1: "Ma",
        2: "Di",
        3: "Wo",
        4: "Do",
        5: "Vr",
        6: "Za",
      },
    },
    import: {
      stepLabel: "Stap 8 van 9",
      heading: "Breng je bestaande taken over",
      subheading:
        "Heb je ergens al een lijst? Plak deze of voer items handmatig in. FlowOS verwerkt ze in je Braindump-inbox. Je kunt dit overslaan en later taken toevoegen.",
      pasteOption: "Plakken vanuit Notion",
      manualOption: "Handmatig invoeren",
      pasteLabel: "Kopieer je takenlijst en plak deze hieronder. Eén taak per regel.",
      pastePlaceholder: "Taak 1\nTaak 2\nTaak 3",
      manualLabel: "Voeg per regel één taak toe.",
      taskPlaceholder: "Taak {{n}}",
      addTaskCta: "+ Nog een taak toevoegen",
      tasksDetected: "{{count}} taken gevonden",
      continueCta: "Importeren en doorgaan",
      continueDefaultCta: "Doorgaan",
      skipCta: "Overslaan — ik voeg later taken toe",
    },
    urgencyIndex: {
      stepLabel: "Stap 9 van 9",
      stepLabelOptional: "Stap 9 van 9 · Optioneel",
      heading: "Jouw urgentieprofiel",
      subheading:
        "16 korte vragen. Antwoord eerlijk — niemand ziet dit behalve jij en FlowOS.",
      scoreLabel: "Totaalscore",
      hint: "Tik op een antwoord om verder te gaan — gebaseerd op Covey's First Things First.",
      resultTip:
        "Je kunt dit altijd opnieuw doen via Instellingen → Prestaties → Urgentieprofiel.",
      finishCta: "Instellen afronden",
      skipCta: "Overslaan",
      backCta: "Terug",
      options: {
        never: "Nooit",
        sometimes: "Soms",
        always: "Altijd",
      },
      questions: {
        q1: "Ik voel me bijna elke dag achter.",
        q2: "Ik check e-mail of berichten binnen 10 minuten na het wakker worden.",
        q3: "Ik zeg ja tegen dingen waar ik geen tijd voor heb.",
        q4: "Ik verzet deadlines omdat er steeds urgente dingen tussendoor komen.",
        q5: "Ik voel me schuldig als ik niets 'productiefs' doe.",
        q6: "Ik presteer beter onder druk en zoek dat op.",
        q7: "Ik onderbreek strategisch werk om urgente berichten te beantwoorden.",
        q8: "Mijn beste uren van de dag gebruik ik reactief, niet proactief.",
        q9: "Ik vind het lastig om nee te zeggen tegen vergaderingen, ook als ze niet waardevol zijn.",
        q10: "Ik onderschat hoe lang taken duren.",
        q11: "Ik slaap minder dan ik zou willen door mijn werk.",
        q12: "Ik voel me gehaast, zelfs als niemand achter me aan zit.",
        q13: "Ik ben er trots op om 'druk' te zijn.",
        q14: "Ik pak mijn telefoon als eerste reactie op een kleine dip.",
        q15: "Ik rond taken snel af, maar niet altijd goed.",
        q16: "Ik verlies het overzicht van wat ik deze week zou doen.",
      },
      profiles: {
        prioritizer: {
          label: "Prioriteitensteller",
          description:
            "Jij houdt urgentie op zijn plek. FlowOS laat je Drift Score met een lichte toon zien — je hebt de waarschuwing zelden nodig.",
        },
        urgency_mindset: {
          label: "Sterke urgentiementaliteit",
          description:
            "Urgentie speelt een echte rol in hoe je werkt. FlowOS signaleert drift eerder en beschermt je Investeringsblokken steviger.",
        },
        urgency_addiction: {
          label: "Verslaafd aan urgentie",
          description:
            "Urgentie voert de boventoon. FlowOS hanteert de strengste Drift Score-drempel en laat dit patroon in je Wekelijkse Prestatierapport zien totdat het verandert.",
        },
      },
    },
    chaos: {
      questionsStepLabel: "Chaos-modus",
      questionsHeading: "5 korte vragen",
      questionsSubheading:
        "FlowOS bouwt je missie, rollen en eerste doelen voor je.",
      continueCta: "Volgende",
      backCta: "Terug",
      buildHeading: "Je werkruimte wordt gebouwd",
      buildPhrases: [
        "Antwoorden lezen…",
        "Rollen structureren…",
        "Eerste week instellen…",
      ],
      reviewHeading: "Dit heb ik gebouwd",
      reviewSubheading: "Je kunt dit voor het doorgaan nog aanpassen.",
      acceptCta: "Ziet er goed uit — doorgaan",
      editMyselfCta: "Toch liever zelf doen",
      q1: {
        label: "In één zin — waar werk je nu aan?",
        placeholder: "bijv. Onze seed-ronde afronden.",
      },
      q2: {
        label: "Wat zijn de 3–5 belangrijkste levensgebieden waarbij FlowOS moet helpen?",
        options: {
          work: "Werk",
          clients: "Klanten",
          health: "Gezondheid",
          family: "Familie",
          finances: "Financiën",
          learning: "Leren",
          side_projects: "Nevenprojecten",
          admin: "Administratie",
          team: "Team",
          creative: "Creatief",
          community: "Gemeenschap",
          rest: "Rust",
        },
      },
      q3: {
        label: "Wat is het ene belangrijkste ding dat deze week af moet?",
        placeholder: "bijv. Het voorstel naar de klant sturen.",
      },
      q4: {
        label: "Waar ben je het zat om handmatig te doen?",
        options: {
          tracking_time: "Tijd bijhouden",
          meeting_notes: "Vergadernotities maken",
          planning_day: "Mijn dag plannen",
          remembering: "Dingen onthouden",
          saying_no: "Nee zeggen",
        },
      },
      q5: {
        label: "Hoeveel structuur wil je?",
        low: "Geef me gewoon de basis",
        high: "Automatiseer mijn dag volledig",
      },
    },
    complete: {
      heading: "Je bent klaar om te starten.",
      subheading:
        "Je eerste dag staat klaar. Meer functies verschijnen naarmate je FlowOS gebruikt — je hoeft vandaag niet alles in te stellen.",
      primaryCta: "Naar Vandaag",
    },
  },
  auth: {
    heading: "Log in bij FlowOS",
    subheadingSignIn: "Welkom terug. Je setup en planning staan klaar.",
    subheadingSignUp:
      "Maak een account om je setup op al je apparaten te bewaren.",
    emailLabel: "E-mail",
    emailPlaceholder: "jij@bedrijf.nl",
    passwordLabel: "Wachtwoord",
    passwordPlaceholder: "Minimaal 8 tekens",
    signInCta: "Inloggen",
    signUpCta: "Account aanmaken",
    toggleToSignUp: "Nog geen account? Maak er een",
    toggleToSignIn: "Heb je al een account? Log in",
    working: "Een moment…",
    errorEmptyFields: "Vul je e-mailadres en wachtwoord in.",
    errorPasswordTooShort: "Gebruik minimaal 8 tekens.",
  },
  weekIntention: {
    heading: "Bepaal je intentie voor deze week",
    subheading:
      "Een bewuste keuze vóór de week begint. Op je volgende planningsdag zie je hoe het ging.",
    q2Label: "Q2-doel",
    q2Hint: "Deel van je week aan belangrijk, niet-urgent werk.",
    rolesLabel: "Top 3 rollen om in te investeren",
    rolesHint: "Kies er maximaal drie.",
    rolesEmpty: "Nog geen rollen — voeg ze eerst toe aan je werkruimte.",
    intentionLabel: "Je intentie in één zin",
    intentionPlaceholder: "Mijn ochtenden beschermen voor diep werk.",
    saveCta: "Start de week",
    saving: "Opslaan…",
    errorGeneric: "Kon je intentie niet opslaan. Probeer het opnieuw.",
  },
} as const;
