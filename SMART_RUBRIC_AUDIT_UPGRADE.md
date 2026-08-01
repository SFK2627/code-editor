# Smart Rubric Audit Upgrade

The Result & Feedback engine now:

- extracts explicit requirements from the selected criterion and its Excellent-level description;
- checks each requirement independently against the submitted HTML/CSS/JavaScript;
- verifies image src, width, height, and meaningful alt text;
- verifies links, href, target=_blank, and YouTube URLs when explicitly required;
- distinguishes ordered and unordered lists and checks list-item minimums;
- checks document structure, headings, paragraphs, br/hr, sentences, and named content;
- does not invent CSS or JavaScript requirements;
- generates evidence and improvement text from the same audit to prevent contradictions;
- awards full criterion progress when every detected Excellent requirement passes;
- strengthens Gemini instructions with requirement-by-requirement and contradiction audits.
