# Rubric grading fix

- HTML `width` and `height` attributes no longer falsely trigger a CSS requirement.
- Image criteria now check `src`, `width`, `height`, and meaningful `alt` when the rubric asks for them.
- Link criteria now check `href` and `target="_blank"` when required.
- List criteria can distinguish a requirement for both `<ul>` and `<ol>`.
- `<br>` and `<hr>` requirements are checked directly.
- Service-worker cache version bumped so deployed users receive the fix.
