/*
  CEFR Tester Trainer internal band model.

  IMPORTANT: A1.1/A1.2 ... C2.1/C2.2 are INTERNAL training bands, not official
  Council of Europe CEFR levels. Each pair deliberately sits inside one official
  CEFR level and is anchored to the five qualitative aspects of spoken language:
  Range, Accuracy, Fluency, Interaction and Coherence.
*/

export const DIMENSIONS = ['range', 'accuracy', 'fluency', 'interaction', 'coherence'];

export const LEVELS = [
  {
    id: 'A1.1', official: 'A1', phase: 'lower', ageMin: 7, ageMax: 14,
    summary: 'Very early A1: relies on isolated words, memorised chunks and very short personal answers.',
    vocabulary: 'A very small bank of high-frequency words for self, family, school, colours, numbers, food and likes.',
    grammar: 'Mostly words and formulaic present-simple chunks. be/have/can, articles and basic word order are unstable.',
    discourse: 'Usually 1–4 words or one short clause; rarely links ideas beyond and/then.',
    comprehension: 'Understands slow, concrete, familiar questions when wording is predictable; often needs repetition or simpler reformulation.',
    fluency: 'Long searching pauses are normal; may abandon an answer or restart with a memorised chunk.',
    interaction: 'Responds rather than initiates. Simple repair such as “Sorry?” or “I don’t know” is typical.',
    errors: 'Basic errors are frequent and systematic; context often carries part of the meaning.',
    ceiling: 'Cannot sustain a simple past/future account or explain a reason beyond a memorised because + short phrase.',
    dimensions: {
      range: 'Very basic repertoire of words and simple phrases tied to concrete personal situations.',
      accuracy: 'Limited control of a few memorised structures; frequent basic mistakes.',
      fluency: 'Very short, isolated utterances with much pausing and repair.',
      interaction: 'Simple personal questions/answers only; heavily dependent on repetition and rephrasing.',
      coherence: 'Words or groups of words linked mainly with and/then.'
    },
    answerShape: { simple: '1–5 words', familiar: 'one short clause, sometimes two', stretch: 'fragment, misunderstanding or very short partial answer' },
    canDo: ['give name/age/basic personal information', 'name likes/dislikes and familiar objects', 'answer highly predictable routine questions'],
    diagnosticTargets: [
      { skill: 'basic description', prompt: 'Describe your school/classroom or family.', expected: 'labels a few familiar things', ceilingSignal: 'cannot elaborate without heavy support' },
      { skill: 'reason', prompt: 'Why do you like it?', expected: 'because + one simple idea', ceilingSignal: 'reason remains memorised/repetitive' },
      { skill: 'time reference', prompt: 'What did you do yesterday?', expected: 'isolated event words/chunks', ceilingSignal: 'past narration collapses' }
    ],
    errorBank: ['missing be/auxiliary', 'missing article', 'basic word-order error', 'subject–verb agreement error', 'base form used for past'],
    distinguish: { below: 'No lower simulator band.', above: 'A1.2 can usually produce several short sentences and cope with a small follow-up without immediate breakdown.' }
  },
  {
    id: 'A1.2', official: 'A1', phase: 'upper', ageMin: 7, ageMax: 15,
    summary: 'Secure A1: can produce short simple sentences about immediate personal topics and survive brief predictable exchanges.',
    vocabulary: 'Basic everyday vocabulary with some school, hobby, routine, food and home language.',
    grammar: 'Simple present, can, there is/are and some memorised past/future chunks; accuracy remains uneven.',
    discourse: 'Several short clauses may be linked with and, but or because on a familiar topic.',
    comprehension: 'Handles clear familiar questions but struggles when wording changes substantially or the idea becomes hypothetical.',
    fluency: 'Noticeable pauses, but can produce a few connected sentences on rehearsed/familiar content.',
    interaction: 'Can answer simple follow-ups and occasionally ask a basic question back.',
    errors: 'Frequent tense, article, preposition and third-person -s errors, generally without blocking basic meaning.',
    ceiling: 'Narratives are fragmentary and reasons stay concrete; unfamiliar comparison/hypothesis usually requires major simplification.',
    dimensions: {
      range: 'Basic repertoire of phrases for everyday personal needs with a little recombination.',
      accuracy: 'Some memorised structures are stable, but basic errors remain frequent.',
      fluency: 'Short connected bursts with obvious planning pauses.',
      interaction: 'Can manage a brief predictable exchange and a simple follow-up with support.',
      coherence: 'Can connect a few simple ideas with and/but/because.'
    },
    answerShape: { simple: 'one simple sentence', familiar: '2–4 short sentences', stretch: 'one partial idea plus hesitation/clarification' },
    canDo: ['describe routine and preferences simply', 'give one basic reason', 'produce a few memorised past/future expressions'],
    diagnosticTargets: [
      { skill: 'routine vs event', prompt: 'What do you usually do after school? What did you do yesterday?', expected: 'distinguishes routine more reliably than past event', ceilingSignal: 'past forms are sparse or unstable' },
      { skill: 'simple comparison', prompt: 'Which is better, school at home or at school? Why?', expected: 'one concrete preference and reason', ceilingSignal: 'cannot develop or qualify comparison' },
      { skill: 'reformulation', prompt: 'Ask the same idea with less familiar wording.', expected: 'may recognise topic but need rephrasing', ceilingSignal: 'meaning depends strongly on familiar question forms' }
    ],
    errorBank: ['third-person -s omission', 'article omission/substitution', 'preposition choice', 'irregular past error', 'auxiliary omission'],
    distinguish: { below: 'A1.1 is more dependent on isolated words/chunks and repetition.', above: 'A2.1 can sustain several linked sentences and manage straightforward past/future reference more productively.' }
  },
  {
    id: 'A2.1', official: 'A2', phase: 'lower', ageMin: 8, ageMax: 16,
    summary: 'Developing A2: manages short everyday exchanges and gives simple linked descriptions of familiar routines and events.',
    vocabulary: 'Enough for school, family, hobbies, shopping, holidays and basic feelings, with regular repetition.',
    grammar: 'Present forms are usable; past simple and basic future are emerging; subordinate clauses are limited.',
    discourse: 'Several short linked sentences using and, but, because, then and so.',
    comprehension: 'Understands straightforward questions at clear conversational speed; abstract wording needs help.',
    fluency: 'Can keep going on familiar topics despite frequent planning and reformulation.',
    interaction: 'Can answer predictable follow-ups and repair simple misunderstandings.',
    errors: 'Regular tense choice, irregular past, article and preposition errors; simple meaning remains clear.',
    ceiling: 'Opinions are brief and minimally justified; hypotheticals and multi-step comparison quickly expose limits.',
    dimensions: {
      range: 'Basic sentence patterns and memorised phrases for a growing range of everyday situations.',
      accuracy: 'Some simple structures correct, but basic mistakes remain systematic.',
      fluency: 'Short utterances are understandable despite obvious pauses, false starts and reformulation.',
      interaction: 'Can answer questions and respond to simple statements; rarely drives the conversation.',
      coherence: 'Links groups of words/sentences with simple connectors such as and/but/because/then.'
    },
    answerShape: { simple: '1–2 sentences', familiar: '3–5 short linked sentences', stretch: 'short simplified answer with visible searching' },
    canDo: ['describe a routine and a recent event', 'give simple reasons and preferences', 'make basic plans/predictions'],
    diagnosticTargets: [
      { skill: 'short narrative', prompt: 'Tell me what happened last weekend from beginning to end.', expected: 'simple sequence with then/after', ceilingSignal: 'tense control and detail are fragile' },
      { skill: 'future', prompt: 'What are you going to do next weekend?', expected: 'basic planned future', ceilingSignal: 'limited variation beyond one familiar form' },
      { skill: 'opinion', prompt: 'Should children have homework every day?', expected: 'clear view + one or two simple reasons', ceilingSignal: 'little development/counterargument' }
    ],
    errorBank: ['irregular past error', 'tense switching inside narrative', 'article error', 'preposition error', 'comparative formation error'],
    distinguish: { below: 'A1.2 usually relies more on rehearsed chunks and shorter answers.', above: 'A2.2 can maintain a short coherent account and paraphrase a missing everyday word more effectively.' }
  },
  {
    id: 'A2.2', official: 'A2', phase: 'upper', ageMin: 9, ageMax: 17,
    summary: 'Strong A2: sustains simple conversation on familiar matters and can give a short coherent account with reasons and sequencing.',
    vocabulary: 'Broader everyday vocabulary; can sometimes describe around a missing common word.',
    grammar: 'Uses present/past/future basics, comparatives and common modals; complex clause control is limited.',
    discourse: 'Produces short coherent accounts with sequencing, simple cause and basic contrast.',
    comprehension: 'Usually follows familiar conversational questions without repetition; unfamiliar abstractions may require clarification.',
    fluency: 'Generally continuous in short stretches, with obvious searching beyond familiar topics.',
    interaction: 'Participates actively and can ask for clarification in simple language.',
    errors: 'Noticeable grammar errors remain, especially under pressure, but seldom cause misunderstanding.',
    ceiling: 'Limited subordinate-clause control and little nuance; difficult ideas are simplified rather than developed.',
    dimensions: {
      range: 'A usable basic repertoire across common everyday topics with limited paraphrase.',
      accuracy: 'Simple structures often work, but basic mistakes still recur under pressure.',
      fluency: 'Short stretches are reasonably continuous; hesitation rises sharply with complexity.',
      interaction: 'Can sustain a straightforward exchange and signal/repair misunderstanding.',
      coherence: 'Connects short sequences with a small but functional set of linking words.'
    },
    answerShape: { simple: '2–3 sentences', familiar: '4–7 linked sentences', stretch: 'simplified 2–4 sentence response; may request clarification' },
    canDo: ['tell a simple story with sequence', 'compare familiar options', 'explain a preference with more than one reason', 'paraphrase a missing common word simply'],
    diagnosticTargets: [
      { skill: 'narrative detail', prompt: 'Tell me about a time something went wrong on a trip or at school.', expected: 'sequence + basic cause/result', ceilingSignal: 'little background, evaluation or complex time relation' },
      { skill: 'comparison', prompt: 'Compare learning online and learning in class.', expected: 'two-sided concrete comparison', ceilingSignal: 'limited qualification or abstraction' },
      { skill: 'hypothesis', prompt: 'If you could change one school rule, what would you change?', expected: 'understands idea with a simple conditional-like response', ceilingSignal: 'form/argument remains basic' }
    ],
    errorBank: ['tense/aspect simplification', 'article error', 'preposition/collocation error', 'conditional form simplification', 'pronoun reference error'],
    distinguish: { below: 'A2.1 is more fragmented and less reliable in short narratives.', above: 'B1.1 can sustain connected speech, narrate more independently and explain a viewpoint beyond a few simple reasons.' }
  },
  {
    id: 'B1.1', official: 'B1', phase: 'lower', ageMin: 10, ageMax: 17,
    summary: 'Early B1: maintains familiar conversation, narrates events and gives connected reasons, but complexity noticeably reduces control.',
    vocabulary: 'Functional range for everyday life, school and interests; circumlocution appears on less familiar topics.',
    grammar: 'Reasonable control of common tense contrasts, modals and first conditional; more complex forms are emerging.',
    discourse: 'Connected answers of several sentences; can narrate, describe and explain a straightforward viewpoint.',
    comprehension: 'Understands clear standard questions and follow-ups; dense or abstract questions may need reformulation.',
    fluency: 'Can speak at length on familiar topics with evident pauses for planning and repair.',
    interaction: 'Can initiate/maintain a simple exchange, clarify and respond spontaneously, though rarely steers the topic.',
    errors: 'Persistent but non-systematic tense, agreement, article and preposition errors; complexity lowers accuracy.',
    ceiling: 'Arguments lack detail/qualification; sustained hypotheticals and precise comparisons are inconsistent.',
    dimensions: {
      range: 'Enough language to get by on familiar topics, with hesitation and circumlocution outside them.',
      accuracy: 'Frequently used routines/patterns are reasonably accurate; ambitious language destabilises control.',
      fluency: 'Comprehensible extended speech, but grammatical/lexical planning and repair are clearly visible.',
      interaction: 'Can initiate, maintain and close familiar conversation and confirm understanding.',
      coherence: 'Links shorter simple elements into a connected linear sequence.'
    },
    answerShape: { simple: '2–4 sentences', familiar: '5–9 connected sentences', stretch: '3–6 sentences with simplification, pauses and errors' },
    canDo: ['sustain a personal narrative', 'explain a familiar opinion with reasons/examples', 'deal with predictable follow-up questions', 'paraphrase around vocabulary gaps'],
    diagnosticTargets: [
      { skill: 'narrative control', prompt: 'Tell me about a memorable day and why it was memorable.', expected: 'connected chronology + reaction', ceilingSignal: 'background/detail/time relations remain simple' },
      { skill: 'hypothesis', prompt: 'What would happen if students had no homework?', expected: 'basic hypothetical idea, perhaps mixed forms', ceilingSignal: 'difficulty sustaining consequences or alternatives' },
      { skill: 'opinion development', prompt: 'Is social media more helpful or harmful for teenagers?', expected: 'view + reasons/examples', ceilingSignal: 'limited qualification/counterargument' }
    ],
    errorBank: ['past/present perfect confusion', 'article/preposition error', 'conditional form mixing', 'agreement slip', 'awkward circumlocution'],
    distinguish: { below: 'A2.2 produces shorter, more concrete accounts and has less independent control of narrative/opinion.', above: 'B1.2 develops answers more flexibly, handles some hypothetical/inferential questions and keeps basic grammar more stable while taking risks.' }
  },
  {
    id: 'B1.2', official: 'B1', phase: 'upper', ageMin: 11, ageMax: 17,
    summary: 'Strong B1: fairly confident connected speech with reasons, organised narratives and emerging complex language.',
    vocabulary: 'Good everyday range plus some topic-specific vocabulary; paraphrase is often effective.',
    grammar: 'Common tense/aspect patterns are mostly controlled; relative clauses, conditionals and reported ideas appear with mixed accuracy.',
    discourse: 'Can sustain an answer, organise a story and support opinions with multiple reasons/examples.',
    comprehension: 'Follows most standard questioning, including some hypothetical and inferential prompts.',
    fluency: 'Generally smooth on accessible topics; searching becomes visible on unfamiliar or abstract content.',
    interaction: 'Handles follow-ups flexibly and can extend the exchange without constant prompting.',
    errors: 'Errors cluster in more ambitious structures; basic grammar is usually stable.',
    ceiling: 'Precision, collocation, nuance and sustained abstract argument are not yet reliably B2.',
    dimensions: {
      range: 'A solid familiar-topic repertoire with effective circumlocution and emerging complex sentence forms.',
      accuracy: 'Routine language is usually stable; errors are more associated with risk-taking and complexity.',
      fluency: 'Can keep a reasonably even flow on familiar topics, though planning remains evident in demanding stretches.',
      interaction: 'Maintains exchange confidently and can respond to less predictable follow-ups.',
      coherence: 'Produces connected linear discourse with clearer organisation and several common cohesive devices.'
    },
    answerShape: { simple: '3–5 sentences', familiar: '6–10 developed sentences', stretch: '4–7 sentences with some complexity but visible lexical/grammatical strain' },
    canDo: ['give an organised narrative with reasons/reactions', 'develop and exemplify an opinion', 'handle straightforward hypotheticals', 'reformulate when a word is missing'],
    diagnosticTargets: [
      { skill: 'extended opinion', prompt: 'Should schools limit phone use? Give both sides and your view.', expected: 'multiple reasons/examples and some contrast', ceilingSignal: 'counterargument/qualification remains simple or repetitive' },
      { skill: 'hypothetical chain', prompt: 'If you were headteacher for a week, what would you change and what might happen?', expected: 'sustains a basic hypothetical sequence', ceilingSignal: 'tense/conditional control weakens as chain develops' },
      { skill: 'inference', prompt: 'Why might someone disagree with you?', expected: 'can imagine another perspective', ceilingSignal: 'less precision/nuance than B2' }
    ],
    errorBank: ['conditional tense slip', 'relative clause/pronoun slip', 'collocation choice', 'article/preposition slip', 'overuse of generic linking words'],
    distinguish: { below: 'B1.1 is more hesitant and linear with less stable complex language.', above: 'B2.1 shows more spontaneous detailed viewpoints, wider range and a fairly even tempo with fewer conspicuous planning pauses.' }
  },
  {
    id: 'B2.1', official: 'B2', phase: 'lower', ageMin: 12, ageMax: 17,
    summary: 'Early B2: spontaneous interaction and detailed viewpoints with clear emerging sophistication, but precision and control are not fully consistent.',
    vocabulary: 'Wide enough for many academic/social topics, with some collocation problems and occasional imprecision.',
    grammar: 'Good range of subordinate clauses, conditionals, passives and tense/aspect; errors remain noticeable in demanding stretches.',
    discourse: 'Develops arguments and narratives clearly using a growing range of linking and framing devices.',
    comprehension: 'Understands extended natural questions and most implied meaning when the topic is accessible.',
    fluency: 'Good conversational flow with relatively few long pauses; reformulation is often effective.',
    interaction: 'Can take initiative, negotiate meaning and respond to unexpected follow-ups.',
    errors: 'Generally good control, with slips and recurring weaknesses in complex structures or collocations.',
    ceiling: 'May become repetitive or imprecise when required to nuance, qualify or defend an abstract position at length.',
    dimensions: {
      range: 'Sufficient range for clear descriptions and viewpoints on most general topics, using some complex sentence forms.',
      accuracy: 'Relatively high grammatical control; mistakes rarely cause misunderstanding and many can be corrected.',
      fluency: 'Fairly even tempo with few noticeably long pauses, though searching is still visible.',
      interaction: 'Initiates discourse, takes turns appropriately and helps familiar discussion along.',
      coherence: 'Uses a limited but effective set of cohesive devices; longer contributions can still be slightly jumpy.'
    },
    answerShape: { simple: '3–5 concise sentences', familiar: '7–12 developed sentences', stretch: '5–9 sentences with argument, qualification and some searching' },
    canDo: ['develop a viewpoint with reasons and examples', 'handle unexpected follow-up questions', 'use a useful range of complex structures', 'reformulate efficiently'],
    diagnosticTargets: [
      { skill: 'two-sided argument', prompt: 'What are the advantages and disadvantages of AI in education?', expected: 'clear structure, examples and position', ceilingSignal: 'qualification/collocation may be repetitive or imprecise' },
      { skill: 'counterfactual', prompt: 'How would your life be different if you had grown up in another country?', expected: 'sustains hypothetical comparison', ceilingSignal: 'fine tense/aspect control may wobble' },
      { skill: 'challenge', prompt: 'I disagree. Isn’t that argument too simple?', expected: 'defends/reframes position spontaneously', ceilingSignal: 'less nuanced stance management than strong B2/C1' }
    ],
    errorBank: ['collocation imprecision', 'complex tense/aspect slip', 'article/preposition slip', 'awkward clause framing', 'repetitive discourse marker'],
    distinguish: { below: 'B1.2 has less even fluency and a narrower complex-language repertoire.', above: 'B2.2 is more consistently flexible, cohesive and controlled across abstract/hypothetical discussion.' }
  },
  {
    id: 'B2.2', official: 'B2', phase: 'upper', ageMin: 12, ageMax: 17,
    summary: 'Strong B2: sustained, flexible conversation with detailed argument and relatively high control across familiar and abstract topics.',
    vocabulary: 'Broad range with effective paraphrase and some idiomatic/collocational language; occasional awkward choices remain.',
    grammar: 'Wide structural range used spontaneously with good control; complex errors are occasional rather than dominant.',
    discourse: 'Well-developed answers using examples, contrast, cause, consequence and clear organisation.',
    comprehension: 'Comfortable with most natural questioning, including abstract, hypothetical and evaluative prompts.',
    fluency: 'Sustained and spontaneous; hesitation is mainly for ideas or precise wording rather than basic language.',
    interaction: 'Flexible turn-taking, clarification and development; can challenge or qualify an interviewer’s premise.',
    errors: 'Some slips, collocation issues and awkward formulations remain but communication is consistently effective.',
    ceiling: 'Does not yet show consistently precise, nuanced and almost effortless control across unfamiliar domains expected at C1.',
    dimensions: {
      range: 'Broad general-topic range with complex sentence forms and effective paraphrase.',
      accuracy: 'High control overall; errors are mostly slips or local weaknesses and do not impede meaning.',
      fluency: 'Sustained fairly even flow with hesitation chiefly for formulation/ideas.',
      interaction: 'Flexible, spontaneous participation with initiative, repair and effective response to challenge.',
      coherence: 'Clear extended discourse using a useful variety of cohesive devices and organisational patterns.'
    },
    answerShape: { simple: '3–5 natural sentences', familiar: '8–14 developed sentences if invited', stretch: '6–10 sentences with sustained argument and occasional precision limits' },
    canDo: ['sustain abstract discussion', 'compare and evaluate alternatives', 'defend and qualify a position', 'adapt explanations to follow-up pressure'],
    diagnosticTargets: [
      { skill: 'nuance', prompt: 'Can something be both fair and unfair depending on perspective?', expected: 'handles qualification and examples', ceilingSignal: 'lexical/idiomatic precision not consistently C1-like' },
      { skill: 'synthesis', prompt: 'Take two ideas we discussed and explain how they are connected.', expected: 'organises a clear synthesis', ceilingSignal: 'less rhetorical flexibility than C1' },
      { skill: 'register/stance', prompt: 'How would you explain your view differently to a friend and to a headteacher?', expected: 'some awareness of register', ceilingSignal: 'adaptation may be more conceptual than linguistically sophisticated' }
    ],
    errorBank: ['subtle collocation issue', 'minor preposition/article slip', 'occasional complex-clause error', 'slightly awkward register choice', 'repetition under abstract pressure'],
    distinguish: { below: 'B2.1 is a little less consistent in cohesion, control and precision under pressure.', above: 'C1.1 maintains a high degree of accuracy and flexible expression with much less need to restrict or simplify what they want to say.' }
  },
  {
    id: 'C1.1', official: 'C1', phase: 'lower', ageMin: 14, ageMax: 17,
    summary: 'Early C1: fluent and flexible in extended abstract discussion, with occasional limits in precision, register or idiomatic naturalness.',
    vocabulary: 'Very broad range, including less common expressions; occasional searching or slightly awkward collocation can occur.',
    grammar: 'Wide and varied complex grammar with high accuracy; errors are infrequent and often self-corrected.',
    discourse: 'Builds coherent extended arguments, qualifies claims and handles topic shifts effectively.',
    comprehension: 'Understands rapid, indirect and conceptually demanding questioning with little support.',
    fluency: 'Fluent and spontaneous; hesitation is usually conceptual or lexical rather than grammatical.',
    interaction: 'Can steer discussion, infer intent, reformulate elegantly and respond to nuance.',
    errors: 'Occasional subtle collocation, register or complex-structure errors; rarely distracting.',
    ceiling: 'Nuance and idiomatic control are not yet consistently effortless across unfamiliar domains.',
    dimensions: {
      range: 'Broad command allowing clear expression on wide general/academic/leisure topics without much restriction.',
      accuracy: 'Consistently high grammatical accuracy; errors are rare and often corrected.',
      fluency: 'Fluent and spontaneous, almost effortless; conceptual difficulty is the main source of disruption.',
      interaction: 'Uses discourse functions strategically to take/keep the floor and relate contributions skilfully.',
      coherence: 'Clear, well-structured extended speech with controlled organisation and cohesive devices.'
    },
    answerShape: { simple: 'natural concise answer', familiar: 'extended response shaped to purpose', stretch: 'sustained nuanced answer with occasional lexical/idiomatic searching' },
    canDo: ['argue and qualify abstract positions', 'infer assumptions and respond to them', 'reformulate precisely', 'manage extended interaction strategically'],
    diagnosticTargets: [
      { skill: 'qualification', prompt: 'When might a generally good rule produce a bad result?', expected: 'nuanced conditions/exceptions', ceilingSignal: 'some lexical/idiomatic precision gaps may appear' },
      { skill: 'implicit meaning', prompt: 'What assumption is hidden in that question?', expected: 'identifies and discusses premise', ceilingSignal: 'less effortless subtlety than upper C1/C2' },
      { skill: 'reframing', prompt: 'Can you make the opposite case convincingly?', expected: 'switches stance and reorganises argument', ceilingSignal: 'occasional awkwardness in register or collocation' }
    ],
    errorBank: ['subtle collocation issue', 'register mismatch', 'rare complex-structure slip', 'slightly awkward idiom', 'momentary lexical search'],
    distinguish: { below: 'B2.2 is highly effective but shows more restriction/repetition and less consistently high grammatical control.', above: 'C1.2 is more consistently precise, natural and rhetorically controlled across unfamiliar or demanding topics.' }
  },
  {
    id: 'C1.2', official: 'C1', phase: 'upper', ageMin: 14, ageMax: 17,
    summary: 'Strong C1: highly fluent, precise and well organised across demanding topics with strong register and discourse control.',
    vocabulary: 'Extensive and flexible with strong collocation, paraphrase and register awareness.',
    grammar: 'Very wide range with consistently high control and natural variation.',
    discourse: 'Sophisticated development, qualification, cohesion and rhetorical shaping in extended answers.',
    comprehension: 'Handles implicit meaning, humour, nuance and complex questions reliably.',
    fluency: 'Effortless-seeming flow with natural pausing and rapid self-repair when needed.',
    interaction: 'Manages conversation strategically and adapts language to interlocutor and purpose.',
    errors: 'Rare slips that are minor and usually repaired.',
    ceiling: 'May still lack the near-complete stylistic/idiomatic command and extremely fine semantic precision associated with C2.',
    dimensions: {
      range: 'Very broad flexible repertoire with precise reformulation and strong register awareness.',
      accuracy: 'High grammatical control is sustained even in complex extended turns.',
      fluency: 'Natural, smooth flow with hesitation mainly for genuinely difficult ideas.',
      interaction: 'Strategically manages floor, stance, alignment and clarification with ease.',
      coherence: 'Smooth, well-structured discourse using varied organisational and cohesive resources.'
    },
    answerShape: { simple: 'economical and natural', familiar: 'extended only as needed', stretch: 'sustained nuanced response with rare minor searching' },
    canDo: ['sustain nuanced abstract argument', 'shift register/style appropriately', 'compress or expand explanations', 'handle ambiguity and implicit meaning'],
    diagnosticTargets: [
      { skill: 'fine distinction', prompt: 'What is the difference between being confident and being certain?', expected: 'precise semantic contrast with examples', ceilingSignal: 'rare lexical nuance gap may appear' },
      { skill: 'rhetorical control', prompt: 'Give the same argument first neutrally, then persuasively.', expected: 'noticeable register/rhetorical shift', ceilingSignal: 'may be slightly less idiomatically effortless than C2' },
      { skill: 'ambiguity', prompt: 'Give two interpretations of an ambiguous statement and defend each.', expected: 'handles ambiguity flexibly', ceilingSignal: 'C2-level compression/allusion not consistently present' }
    ],
    errorBank: ['very rare collocation slip', 'rare register micro-mismatch', 'momentary lexical search', 'minor self-corrected structure slip'],
    distinguish: { below: 'C1.1 can show occasional precision/register limitations under demanding conditions.', above: 'C2.1 shows near-mastery: finer shades of meaning, idiomatic flexibility and almost invisible repair.' }
  },
  {
    id: 'C2.1', official: 'C2', phase: 'lower', ageMin: 15, ageMax: 17,
    summary: 'Near-mastery C2: exceptionally flexible, precise and nuanced communication with very few detectable limitations.',
    vocabulary: 'Extremely broad, precise and idiomatic, including subtle distinctions and register shifts.',
    grammar: 'Near-complete control of complex grammar, including marked and stylistically motivated structures.',
    discourse: 'Shapes sophisticated arguments, narratives and explanations with fine-grained cohesion and emphasis.',
    comprehension: 'Understands essentially all interview input, including compressed, figurative or culturally loaded language when context permits.',
    fluency: 'Highly effortless and expressive with strategic pausing rather than language-search pauses.',
    interaction: 'Can subtly reformulate, persuade, hedge, use humour and negotiate stance.',
    errors: 'Very rare slips, usually comparable to proficient speakers generally.',
    ceiling: 'May occasionally choose a slightly less natural idiom/register option than the simulator’s top C2.2 band.',
    dimensions: {
      range: 'Very great flexibility in reformulating ideas to convey fine shades of meaning with strong idiomatic command.',
      accuracy: 'Consistent control of complex language even while planning and monitoring interaction.',
      fluency: 'Spontaneous extended speech with difficulty avoided or repaired so smoothly it is barely noticeable.',
      interaction: 'Ease and skill in natural turn-taking, reference, allusion and stance management.',
      coherence: 'Highly coherent/cohesive discourse using a wide range of organisational patterns and connectors.'
    },
    answerShape: { simple: 'precise and economical', familiar: 'fully natural amount of detail', stretch: 'sophisticated sustained response with virtually invisible repair' },
    canDo: ['convey fine shades of meaning', 'reformulate seamlessly', 'use idiomatic/figurative language appropriately', 'manage sophisticated interaction and rhetorical stance'],
    diagnosticTargets: [
      { skill: 'semantic precision', prompt: 'Distinguish two near-synonymous ideas in a context of your choice.', expected: 'fine-grained distinction and reformulation', ceilingSignal: 'only very subtle naturalness difference from top band' },
      { skill: 'allusion/implication', prompt: 'Respond to an indirect or deliberately ambiguous challenge.', expected: 'tracks implication and stance effortlessly', ceilingSignal: 'rarely may choose less elegant wording' },
      { skill: 'style shifting', prompt: 'Recast a complex idea for a child, a friend and an academic audience.', expected: 'strong controlled style shifts', ceilingSignal: 'near-mastery throughout' }
    ],
    errorBank: ['incidental self-repaired slip', 'rare slightly less natural idiom', 'rare micro-register choice'],
    distinguish: { below: 'C1.2 is highly advanced but less consistently idiomatic/fine-grained.', above: 'C2.2 is the simulator’s maximal band: practically no discernible language limitation in interview conditions.' }
  },
  {
    id: 'C2.2', official: 'C2', phase: 'upper', ageMin: 15, ageMax: 17,
    summary: 'Top simulator band: consistently precise, natural, nuanced and adaptable spoken English within ordinary interview conditions.',
    vocabulary: 'Extensive idiomatic, figurative and semantic precision with highly flexible register control.',
    grammar: 'Consistently effortless structural control with stylistic flexibility.',
    discourse: 'Highly sophisticated organisation, rhetorical nuance, compression/expansion and natural cohesion.',
    comprehension: 'Virtually unrestricted in ordinary interview conditions, including implication, humour and rapid reformulation.',
    fluency: 'Natural, expressive and highly efficient; almost no language-driven hesitation.',
    interaction: 'Fully flexible, strategic and sensitive to tone, assumptions and interpersonal nuance.',
    errors: 'Only incidental slips; do not manufacture conspicuous learner errors.',
    ceiling: 'Top target band in this simulator.',
    dimensions: {
      range: 'Exceptionally broad and flexible, including fine shades of meaning, idiom, colloquialism and register shifts.',
      accuracy: 'Consistent grammatical control regardless of complexity or competing attentional demands.',
      fluency: 'Natural colloquial flow at length with seamless reformulation.',
      interaction: 'Effortless, subtle turn-taking and stance management with full sensitivity to implication.',
      coherence: 'Fully controlled organisation and cohesion using an extensive repertoire of discourse resources.'
    },
    answerShape: { simple: 'precise, natural and proportionate', familiar: 'fully natural response length', stretch: 'sophisticated answer without artificial display of complexity' },
    canDo: ['perform all lower-band functions with near-unrestricted flexibility', 'express fine semantic/rhetorical distinctions', 'shift register and perspective seamlessly', 'repair or reformulate almost invisibly'],
    diagnosticTargets: [
      { skill: 'fine shades', prompt: 'Explain a subtle distinction, then reformulate it twice without losing meaning.', expected: 'precise flexible reformulation', ceilingSignal: 'no intended ceiling inside simulator' },
      { skill: 'rhetorical agility', prompt: 'Argue a position, concede the strongest objection, then rebuild the case.', expected: 'fully controlled stance and discourse', ceilingSignal: 'no intended ceiling inside simulator' },
      { skill: 'implicit interaction', prompt: 'Use an indirect challenge or ironic premise and see whether the learner tracks it.', expected: 'recognises and handles implication naturally', ceilingSignal: 'no intended ceiling inside simulator' }
    ],
    errorBank: ['incidental non-patterned slip only'],
    distinguish: { below: 'C2.1 may show an exceptionally subtle occasional naturalness or idiomatic limitation.', above: 'No higher simulator band.' }
  }
];

const BOY_NAMES = ['Leo', 'Daniel', 'Sam', 'Hugo', 'Noah', 'Mateo', 'Alex', 'Lucas', 'Adam', 'Nico'];
const GIRL_NAMES = ['Mia', 'Sofia', 'Emma', 'Lina', 'Maya', 'Nora', 'Clara', 'Zoe', 'Sara', 'Amira'];
const PERSONALITIES = [
  'friendly but slightly nervous',
  'quiet and cooperative',
  'confident and talkative',
  'thoughtful and reserved',
  'energetic and curious',
  'cheerful but easily distracted'
];
const INTERESTS = [
  'football', 'gaming', 'drawing', 'music', 'animals', 'science', 'dance', 'reading',
  'basketball', 'films', 'cooking', 'cycling', 'technology', 'swimming', 'travel', 'photography'
];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sample(items, count) {
  const pool = [...items];
  const out = [];
  while (pool.length && out.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(index, 1)[0]);
  }
  return out;
}

export function createRandomLearner() {
  const level = pick(LEVELS);
  const gender = Math.random() < 0.5 ? 'boy' : 'girl';
  const age = level.ageMin + Math.floor(Math.random() * (level.ageMax - level.ageMin + 1));
  const name = pick(gender === 'boy' ? BOY_NAMES : GIRL_NAMES);
  const firstInterest = pick(INTERESTS);
  let secondInterest = pick(INTERESTS);
  while (secondInterest === firstInterest) secondInterest = pick(INTERESTS);

  // Real learners are uneven. Give each session a small, controlled intra-band profile
  // without allowing that variability to change the target CEFR band.
  const [relativeStrength, relativeWeakness] = sample(DIMENSIONS, 2);
  const recurringErrorPatterns = sample(level.errorBank, level.official === 'C2' ? 1 : 2);

  return {
    levelId: level.id,
    name,
    age,
    gender,
    personality: pick(PERSONALITIES),
    interests: [firstInterest, secondInterest],
    relativeStrength,
    relativeWeakness,
    recurringErrorPatterns,
    level
  };
}

export function levelIndex(id) {
  return LEVELS.findIndex((level) => level.id === id);
}

export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) || null;
}

export function publicLearner(profile) {
  return {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    personalityHint: profile.personality
  };
}
