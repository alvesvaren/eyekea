---
name: writing
description: "Prose style for anything that is not code: docs, READMEs, ADRs, commit messages, PR descriptions, skills, CLAUDE.md. Plain words, one thought per sentence, no AI tells, no ambiguity. Invoke with /alve-skills:writing when writing or reviewing prose."
disable-model-invocation: true
---

# Writing

Write for a tired engineer reading once. Three rules sit above everything else:

- **Cut every word that does no work.** If the sentence survives without the word, the word goes. "In order to" is "to".
- **Use the short, everyday word.** "Use", not "utilize". Use a longer word only when it is more precise.
- **When a rule makes a sentence worse, fix the sentence another way.** The rules serve the reader. A sentence that follows every rule and sounds machine-written has failed.

## Say the real thing

- The codebase is the word list. Write the real symbol, file, flag, or command name, not a synonym or a description of it.
- Use words a developer would say out loud: "delete", not "evacuate". Define a named pattern the first time it appears.
- Be specific over sterile. Not "schema changes can cause issues" but "a column rename fails the build". Name the source or drop the claim.
- State what happened in plain words. Puffery such as "pivotal" claims an importance the facts should show on their own.
- Say "is" and "has", not "serves as" or "boasts".
- Give a trailing "-ing" clause its own sentence with a real claim, or delete it. "..., ensuring reliability" asserts nothing.

## One thought per sentence

- One instruction or one thought per sentence. Split instructions longer than about 20 words and other sentences longer than about 25.
- Talk to the reader as "you", in the present tense. "Will" only for things that happen later.
- Say who does what: "the compiler checks", not "is checked". Passive only when the actor is unknown or beside the point.
- Write instructions as commands with the condition first: "To delete the document, click Delete."
- Drop "simply" and "just" from procedures. If it were simple, the reader would not be here.
- Common case first, exceptions after.
- Mix sentence lengths on purpose. Short sentences make a point. Longer ones carry a fact with its condition or consequence. One thought per sentence does not mean one length per sentence.

## Leave no sentence open to two readings

- Keep "only" and "not" next to the word they change. "Only fails on growth" and "fails only on growth" say different things.
- Make every "it", "they", and "this" point at one obvious noun. Repeat the noun when in doubt. Never use "this" or "which" to point at a whole clause.
- Keep the small words that show structure: "the", "a", "that". "Remove backup file" reads two ways. "Remove the backup file" reads one.
- Break up noun strings: "the proto import budget check script" becomes "the script that checks the proto-import budget".
- Say which parts "and" or "or" joins when a sentence can group two ways. "Both... and" and "either... or" settle it.
- Call each thing by one name, everywhere. Pick "start" or "launch", not both. A second name teaches the reader a second thing.
- Write "a, b, or both" instead of a slash, and the plural out instead of "(s)". Prefer plain constructions to idioms and metaphors, so a translator and an agent parse them the same way.

## Remove the AI tells

Punctuation and formatting:

- Separate thoughts with a period or a comma. An em dash or a semicolon joins what should be two sentences.
- A colon introduces a list or an example. Anywhere else, end the sentence.
- Headings are sentence case and carry the point: "Pick the mode first", not "Modes".
- Bold marks UI elements. Code font marks code, paths, flags, and symbols. Emojis carry nothing. Use straight quotes.

Shapes:

- State the point. "Not just X, it's Y" hides it behind a contrast.
- Use the natural number of items, not three by habit.
- Write "from X to Y" only when X and Y sit on a real scale. Otherwise list the items.
- Bullets for parallel items, numbers for sequences, prose for an argument. Introduce a list with a complete sentence and keep items parallel.

Answer directly and end when the content ends. Openers that praise the question, closers that offer more help, and stacked hedges such as "could potentially" add nothing. "May" is enough.

## Have a view where it belongs

Dry by default. Replies to the user and explanation docs may carry an opinion. Say what you make of a tradeoff instead of listing pros and cons, and label it as in [pushback](../pushback/SKILL.md). Reference docs, how-tos, commit messages, and PR bodies stay dry.

## Per format

- **Commits and PRs.** A briefing a reviewer reads in under a minute. What changed and why, not how you got there. Link logs and metrics instead of pasting them.
- **Docs and READMEs.** One document, one purpose. Link to the neighboring doc instead of mixing a how-to into a reference.
- **Skills and CLAUDE.md.** Every line is a rule an agent can check, stated positively with its reason in one clause. Models copy patterns they see, so quote a bad example only when the rule is the word itself, and only one. Apply the writing-for-agents skill too when it is installed.

## Swedish

The same rules apply. In addition: write compound words as one word ("kodgranskning", not "kod granskning"), use the Swedish term where one exists instead of the English loan, and keep "du" throughout. Committed files stay in English unless the user says otherwise, even when the conversation is in Swedish.

## Before finishing

Re-read the text once as the reader, then check:

1. Can any word be cut without losing meaning? Cut it.
2. Does any sentence carry two thoughts? Split it.
3. Is every instruction a command with its condition in front?
4. Is "only" next to its word? Does every "it" and "this" point at one noun?
5. Does each thing have exactly one name?
6. Any em dash, semicolon, connector colon, title case, or emoji left?
7. Would a developer say these words out loud?
8. Are all symbols, paths, and counts real at this commit?
