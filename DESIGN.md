# Portfolio Ghifari — Design System

## Direction

Dark, minimal, interactive developer portfolio.

Inspired by the immersive and motion-driven feel of portvoooo,
but must NOT copy its layout, branding, content, or exact visual implementation.

The website should feel:
- Dark
- Modern
- Technical
- Interactive
- Premium
- Clean
- Developer-oriented

## Colors

Background Primary: #080808
Background Secondary: #101010
Surface: #141414

Text Primary: #F5F5F5
Text Secondary: #A1A1AA
Text Muted: #71717A

Border: #27272A

Accent Primary: #FACC15

## Visual Rules

Use dark backgrounds throughout the website.

Avoid:
- glassmorphism everywhere
- excessive gradients
- excessive rounded cards
- excessive glow
- animations on every element
- generic SaaS appearance
- excessive ReactBits effects

Prefer:
- strong typography
- large whitespace
- subtle borders
- flat dark surfaces
- yellow accent used selectively
- clear visual hierarchy

## Motion

Framer Motion is the main animation system.

ReactBits is used selectively for:
- hero background
- hero text entrance
- magnetic CTA
- project interactions
- scroll reveal
- technology marquee

Animations should feel smooth and intentional.

Respect prefers-reduced-motion.

## Hero

Full viewport hero.

Content:
- M. Ghifari Bima Khadafi
- Web Developer / Software Engineer
- short value proposition
- Explore Work CTA
- GitHub CTA
- availability indicator
- scroll indicator

Hero should have a subtle interactive ReactBits background.

On scroll:
- hero slightly scales down
- content fades gradually
- subtle vertical movement

## Projects

Projects are the most important content.

Prioritize selected projects before secondary projects.

Project cards should:
- use large screenshots
- clearly show project title
- short description
- tech stack
- GitHub
- live demo when available

Interactions may include:
- subtle tilt
- glare
- image zoom
- scroll reveal

Do not sacrifice readability for animation.

## Tech Stack

Tech stack must be readable immediately.

Do not require users to swipe cards just to discover technologies.

Prefer:
- grid
- marquee
- logo loop

## Navigation

Minimal dark navigation.

Sections:
- Work
- About
- Stack
- Journey
- Contact

Navbar can become slightly opaque with backdrop blur after scrolling.

## Responsive

Desktop should provide richer interactions.

Mobile must:
- disable cursor-based effects
- reduce expensive effects
- avoid horizontal overflow
- preserve readability
- remain fully usable

## Priority

Content > Usability > Motion > Decoration