# Humanizer patterns

Drawn from Wikipedia's "Signs of AI writing" page (WikiProject AI Cleanup). These are deeper structural tells that persist even after cleaning up vocabulary.

## Significance inflation

LLMs inflate the importance of everything. Watch for: stands/serves as, is a testament, a vital/crucial/pivotal role/moment, setting the stage for, marks a shift, key turning point, indelible mark, deeply rooted.

**Before:** "marking a pivotal moment in the evolution of regional statistics"
**After:** "was established in 1989 to collect regional statistics"

## Notability name-dropping

Listing publications without saying what they said. Don't just list where something was covered — say what was reported.

**Before:** "cited in NYT, BBC, FT, and The Hindu"
**After:** "In a 2024 NYT interview, she argued that AI regulation should focus on outcomes."

## Superficial -ing analyses

Tacking present participles onto sentences for fake depth. Watch for: highlighting, underscoring, emphasizing, ensuring, reflecting, symbolizing, contributing to, cultivating, fostering, encompassing, showcasing.

**Before:** "symbolizing Texas bluebonnets, reflecting the community's deep connection to the land"
**After:** "The architect said these colors reference local bluebonnets and the Gulf coast."

## Vague attributions

Attributes opinions to unnamed authorities. Watch for: Industry reports, Observers have cited, Experts argue, Some critics argue.

**Before:** "Experts believe it plays a crucial role in the regional ecosystem."
**After:** "according to a 2019 survey by the Chinese Academy of Sciences."

## Formulaic challenges sections

The "despite challenges, continues to thrive" pattern. Watch for: Despite its... faces several challenges, Despite these challenges, continues to thrive.

**Before:** "Despite challenges, Korattur continues to thrive as an integral part of Chennai's growth."
**After:** "Traffic congestion increased after 2015 when three new IT parks opened."

## Copula avoidance

LLMs avoid "is" and "has" in favor of fancier constructions. A thing that is something doesn't need to "serve as" or "stand as" that thing.

Watch for: serves as, stands as, marks, represents, boasts, features, offers.

**Before:** "Gallery 825 serves as LAAA's exhibition space. The gallery features four spaces and boasts over 3,000 square feet."
**After:** "Gallery 825 is LAAA's exhibition space. The gallery has four rooms totaling 3,000 square feet."

## Synonym cycling

AI has repetition-penalty code that causes excessive synonym substitution. Repeating a word is fine if it's the clearest word.

**Before:** "The protagonist... The main character... The central figure... The hero..."
**After:** "The protagonist faces many challenges but eventually triumphs and returns home."

## False ranges

"From X to Y" constructions where X and Y aren't on a meaningful scale.

**Before:** "from the Big Bang to dark matter, from solo developers to cross-functional teams"
**After:** List the topics directly without forcing them into a spectrum.

## Boldface overuse

AI mechanically bolds terms for emphasis. Trust the reader.

**Before:** "It blends **OKRs**, **KPIs**, and **BMC**"
**After:** "It blends OKRs, KPIs, and visual strategy tools like the Business Model Canvas."

## Inline-header vertical lists

Lists where items start with bolded headers followed by colons that repeat the header word. Convert to prose.

**Before:** "**Performance:** Performance has been enhanced. **Security:** Security has been strengthened."
**After:** "The update speeds up load times and adds end-to-end encryption."

## Title case in headings

AI capitalizes all main words. Use sentence case instead.

**Before:** "Strategic Negotiations And Global Partnerships"
**After:** "Strategic negotiations and global partnerships"

## Knowledge-cutoff disclaimers

AI disclaimers about incomplete information. Watch for: as of [date], While specific details are limited, based on available information.

Find the actual source or remove the claim entirely.

## Filler phrases

Wordy constructions that add nothing:

| Filler | Replacement |
|--------|-------------|
| In order to | To |
| Due to the fact that | Because |
| At this point in time | Now |
| Has the ability to | Can |
| It is important to note that | (just state the thing) |
| In terms of | (rephrase or cut) |
| With regard to | About |
| For the purpose of | To / For |
