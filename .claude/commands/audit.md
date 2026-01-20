# Audit Command

Run a comprehensive accessibility and performance audit on the LoudFace website.

## Instructions

1. **Read AGENTS.md** to understand the audit criteria

2. **Audit accessibility** by checking:
   - Keyboard navigation and focus rings
   - Touch targets (>=24px desktop, >=44px mobile)
   - Form labels and autocomplete attributes
   - Heading hierarchy and alt text
   - `prefers-reduced-motion` support
   - Safe area insets

3. **Audit performance** by checking:
   - Image preloading for above-fold content
   - `loading="lazy"` on below-fold images
   - Image width/height attributes for CLS prevention
   - Font preloading and `font-display: swap`
   - No `transition: all` usage
   - Preconnect hints for external domains

4. **Generate a report** with:
   - Summary table (Pass/Fail counts by category)
   - Detailed findings with file paths and line numbers
   - Specific fix recommendations with code snippets
   - Priority order for fixes

5. **Update QA-REPORT.md** with results

Use the Grep tool (not bash grep) to search for patterns. Reference the accessibility-audit and performance-audit agents in `.claude/agents/` for detailed checklists.
