# Harvest: beautifului.dev + elements.ai-sdk.dev

Date: 2026-08-27
Task: Find (A) process/steps/timeline/stepper/scroll-progress/"how it works" components, and (B) stats/metrics/counter/testimonial-grid components, on these two sites. Copy literal source code.

## What each site actually is

### beautifului.dev
A component library of "crafted primitives" for **AI-native interfaces**, built by product design studio Turbo (turbodesign.co). MIT licensed, copy-paste components.

Full component list found on the page (anchor-linked, single-page site):
- Loading State, Thinking, Streaming Text, Approval Card, Tool Chips, Task Rows, Chat, Prompt Bar, Recommendation Card, Context Cards, Diff Table, Records Table, Filter Table, Sidebar Nav, Search, Flowchart, Insight Cards, Code Block, Fine-tune Card, Selection Actions

None of these are marketing "how it works" steppers, timelines, scroll-progress trackers, or stats/testimonial-grid sections. The closest adjacent names — "Task Rows" and "Flowchart" — are AI-agent-workflow UI (showing an agent's task list or a node-based flow diagram), not a marketing process/steps section, and "Insight Cards" is a data/analytics card, not a stats-counter or testimonial component.

### elements.ai-sdk.dev
"A component library and custom registry built on top of shadcn/ui to help you build AI-native applications faster" (Vercel AI SDK's official Elements library). Organized into Chatbot, Code, Voice, Workflow, and Utility categories.

Full component list:
- **Chatbot:** Attachments, Chain of Thought, Checkpoint, Confirmation, Context, Conversation, Inline Citation, Message, Model Selector, Plan, Prompt Input, Queue, Reasoning, Shimmer, Sources, Suggestion, Task, Tool
- **Code:** Agent, Artifact, Code Block, Commit, Environment Variables, File Tree, JSX Preview, Package Info, Sandbox, Schema Display, Snippet, Stack Trace, Terminal, Test Results, Web Preview
- **Voice:** Audio Player, Mic Selector, Persona, Speech Input, Transcription, Voice Selector
- **Workflow:** Canvas, Connection, Controls, Edge, Node, Panel, Toolbar
- **Utilities:** Image, Open In Chat

None of these are marketing sections either. "Task", "Plan", "Chain of Thought", and "Workflow" components are chat/agent UI, not "how it works" process steppers for a website. There is no stats/counter/testimonial-grid component anywhere in this library.

## Category (A): process / steps / timeline / stepper / scroll-progress / "how it works"

**Zero relevant components found on either site.** Neither library ships a marketing-style numbered-steps section, horizontal/vertical stepper, timeline, or scroll-progress indicator meant for a landing page "how it works" section. The nearest-sounding names (Task Rows, Flowchart, Task, Plan, Chain of Thought, Checkpoint, Queue) are all AI-agent/chat status UI — they show an agent's live task list, reasoning trace, or a node-graph, not a static explanatory process section. Stretching any of these to fit would misrepresent them.

## Category (B): stats / metrics / numbers / counter / testimonial-grid

**Zero relevant components found on either site.** No counter/stat-tile component, no testimonial or quote-grid component exists on either site. "Insight Cards" (beautifului.dev) is the closest by name but is a data-analytics card component for AI dashboards, not a marketing stats/counter block, and its actual markup wasn't inspected further since it doesn't fit the ask.

## Source code

Not applicable — no components matched category (A) or (B), so no code was pulled. Pulling and adapting an AI-chat component (e.g. "Task Rows" or "Chain of Thought") to fake a process section would misrepresent what these libraries offer and was avoided per the brief.

## Bottom line

Both sites are AI/chat/agent component libraries (chatbot UI, code UI, voice UI, workflow-canvas UI), not marketing/landing-page component libraries. Neither has anything for a "how it works" stepper/timeline section or a stats/testimonial-grid section. Recommend looking elsewhere (e.g. shadcn/ui blocks, Tailwind UI, Aceternity UI, Magic UI) for those two categories.
