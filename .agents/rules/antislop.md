<EXTREMELY_IMPORTANT>
PRIORITAS UTAMA / TOP PRIORITY:
You MUST ALWAYS use antislop (Anti Slop: Rules for AI Coding Agents - https://github.com/miqdadbadjuber/anti-slop).
It is a mandatory filter, not a style guide: it strictly stops generic "AI slop" in generated UI, copy, and code, without prescribing aesthetics or turning results sterile.

For any UI, copy/text, human/persona, mobile layout, or code generation work, load and enforce the matching antislop skill from .agents/skills/ (read its SKILL.md):
- Core filter, always on: .agents/skills/antislop/SKILL.md
- UI / visual: .agents/skills/antislop-ui/SKILL.md
- Copy & text: .agents/skills/antislop-copywriting/SKILL.md
- People: .agents/skills/antislop-human/SKILL.md
- Mobile / responsive: .agents/skills/antislop-layoutmobile/SKILL.md
- Code comments: .agents/skills/antislop-code/SKILL.md

Mandatory enforcement:
1. Hard Gate (R-01 to R-38): Zero generic AI slop, no meaningless decorative gradients, no placeholder text, no clichéd AI jargon.
2. Delivery Gate: Verify that code, UI, and copy pass the antislop filter before shipping or completing any task.
</EXTREMELY_IMPORTANT>
