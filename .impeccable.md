## Design Context

### Users
Professionals sending polished outbound emails — B2B sales, partnerships, client outreach. They value speed and reliability, not flash. The interface must feel like a precision tool, not a toy.

### Brand Personality
**Reliable. Futuristic. Automation.**
Three-word voice: *confident, technical, minimal*. The product feels like infrastructure — something that works quietly and well, not something that announces itself. Users trust it because it does exactly what it says.

### Aesthetic Direction
**Bold Technical Minimalism** — Inspired by terminal UIs, dev tooling dashboards, and dark-room trading interfaces. High information density without visual noise. No decorative chrome. Every element earns its place.

**Reference**: Futureme.org — clean, direct, no-nonsense. Emulates a tool that respects your time.

**Anti-reference**: Anything that looks like a piracy site — busy gradients, neon glows, excessive animation, "hacker" aesthetics. Also explicitly avoid purple and gradient text.

**Theme**: Dark mode only. Deep blacks with electric blue accents. The darkness is functional, not stylish — it's the neutral that lets blue breathe.

### Design Principles

1. **No decoration without purpose.** Glassmorphism, glow effects, and gradients are banned unless they communicate state. Visual noise is the enemy of trust.

2. **Typography as interface.** The font choice is part of the brand contract. Use a technical mono or geometric sans for display — something that says "I was built by people who care about craft." Avoid Inter and the reflex fonts list entirely.

3. **Blue on black.** Accent sparingly — this palette lives or dies by restraint. One sharp blue against deep black reads as confident. Two shades of blue or blue gradiented to purple reads as uncertain.

4. **Reduced motion by default.** Respect `prefers-reduced-motion`. When motion is used, it communicates state change — not delight.

5. **Information density is a feature.** This isn't a marketing site — it's a tool. Compact layouts with clear hierarchy serve the user better than generous whitespace that makes them work to find what they need.

---

## Implementation Notes

- Font: Pair a technical/geometric display face (e.g., Geist Mono, JetBrains Mono, or similar) with a clean mono body. Avoid Inter, DM Sans, Space Grotesk.
- Palette: `oklch(0 0 0)` surfaces, electric blue accent (`oklch(0.7 0.2 260)` range), no purple.
- Spacing: 4pt grid, tighter than typical marketing sites — this is an app, not a landing page.
- Motion: Exponential easing (ease-out-quart), only on state changes. No entrance choreography on app pages.