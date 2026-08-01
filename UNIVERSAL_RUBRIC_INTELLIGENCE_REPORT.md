# Universal Rubric Intelligence Upgrade — Step 247

The Result & Feedback engine now evaluates the selected rubric against the whole project instead of relying on a small set of sample tags.

## Added coverage

- Arbitrary HTML tags explicitly named in a rubric
- Semantic HTML structure
- Tables, rows, headers, forms, labels, input types, and required fields
- Explicit HTML attributes
- CSS from project files and `<style>` blocks
- CSS properties explicitly requested by the rubric
- Flexbox and Grid implementation
- Selector-to-HTML matching
- Responsive media queries
- Pseudo-classes, transitions, animations, and keyframes
- Explicit class and ID requirements across both HTML and CSS

## Grading safeguards

- The selected rubric remains the source of truth.
- CSS is not required unless the rubric explicitly requests CSS, styling, layout, or a related feature.
- HTML width/height attributes are not incorrectly treated as CSS requirements.
- Evidence, missing requirements, score, and feedback are generated from the same audit.
- The Gemini review prompt now instructs the model to inspect all project files and verify HTML-CSS relationships.
