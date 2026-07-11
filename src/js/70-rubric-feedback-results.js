function countSemanticHTMLTags(html) {
  const matches = String(html || '').match(/<(header|nav|main|section|article|aside|footer)\b/gi) || [];
  return new Set(matches.map(item => item.replace(/[<\s]/g, '').toLowerCase())).size;
}

function hasSemanticHTMLTags(html) {
  return countSemanticHTMLTags(html) >= 2;
}

function getSemanticTagProgress(html) {
  return Math.min(1, countSemanticHTMLTags(html) / 2);
}

function checkCriterion(criterion) {
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const htmlLower = html.toLowerCase();
  const cssLower = css.toLowerCase();
  const jsLower = js.toLowerCase();
  const outputLower = getOutputText();
  const target = (criterion.target || '').trim().toLowerCase();
  const combinedLength = [html, css, js].join('').replace(/\s/g, '').length;
  const previewDoc = getPreviewDocument();
  const hasRuntimeError = Boolean(previewDoc?.body?.dataset?.runtimeError);

  switch (criterion.rule) {
    case 'smart_rubric':
      return getSmartCriterionProgress(criterion) >= 0.65;
    case 'html_contains':
      return target ? htmlLower.includes(target) : false;
    case 'css_contains':
      return target ? cssLower.includes(target) : false;
    case 'js_contains':
      return target ? jsLower.includes(target) : false;
    case 'output_contains':
      return target ? outputLower.includes(target) : false;
    case 'full_html_structure':
      return isCompleteHTMLStructure();
    case 'has_semantic_tags':
      return hasSemanticHTMLTags(html);
    case 'balanced_html_tags':
      return hasBalancedHTMLTags(html);
    case 'output_has_visible_text':
      return outputLower.trim().length >= 3;
    case 'has_heading':
      return /<h[1-6](\s|>|\/)/i.test(html) || Boolean(queryPreview('h1, h2, h3, h4, h5, h6'));
    case 'has_paragraph':
      return /<p(\s|>|\/)/i.test(html) || Boolean(queryPreview('p'));
    case 'has_button':
      return /<button(\s|>|\/)/i.test(html) || Boolean(queryPreview('button'));
    case 'has_link':
      return /<a(\s|>|\/)/i.test(html) || Boolean(queryPreview('a'));
    case 'has_button_or_link':
      return /<(button|a)(\s|>|\/)/i.test(html) || Boolean(queryPreview('button, a'));
    case 'has_image':
      return /<img(\s|>|\/)/i.test(html) || Boolean(queryPreview('img'));
    case 'has_list':
      return /<(ul|ol)(\s|>|\/)/i.test(html) || Boolean(queryPreview('ul, ol'));
    case 'uses_css_property': {
      if (target) return cssLower.includes(target);
      const usefulProperties = /(color|background|background-color|padding|margin|border|border-radius|font-size|font-family|font-weight|line-height|display|box-shadow|text-align|width|max-width|min-height|height|gap|grid-template-columns|justify-content|align-items|position|transition|transform|opacity|object-fit|overflow)\s*:/i;
      return usefulProperties.test(css);
    }
    case 'uses_event_listener':
      return /addEventListener\s*\(/i.test(js) || /onclick\s*=/i.test(html);
    case 'js_changes_page':
      return /(textContent|innerHTML|innerText|classList|style\.|setAttribute|appendChild|createElement)/i.test(js);
    case 'no_runtime_error':
      return !hasRuntimeError;
    case 'minimum_effort':
      return combinedLength >= 120;
    default:
      return false;
  }
}

function getHTMLStructureProgress() {
  const report = getHTMLStructureReport();
  return report.checks.length ? report.checks.filter(item => item.passed).length / report.checks.length : 0;
}

function getBalancedTagProgress(html) {
  if (hasBalancedHTMLTags(html)) return 1;
  const tags = (html.match(/<\/?\s*([a-zA-Z][a-zA-Z0-9-]*|!DOCTYPE)\b[^>]*>/g) || []).length;
  if (tags <= 2) return 0.15;

  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
  const openTags = {};
  const closeTags = {};
  const tagRegex = /<\/?\s*([a-zA-Z][a-zA-Z0-9-]*|!DOCTYPE)\b[^>]*>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (voidTags.has(tagName) || fullTag.endsWith('/>') || fullTag.startsWith('<!--')) continue;
    if (/^<\//.test(fullTag)) {
      closeTags[tagName] = (closeTags[tagName] || 0) + 1;
    } else {
      openTags[tagName] = (openTags[tagName] || 0) + 1;
    }
  }

  const names = new Set([...Object.keys(openTags), ...Object.keys(closeTags)]);
  if (!names.size) return 0;
  let matched = 0;
  let total = 0;
  names.forEach(name => {
    matched += Math.min(openTags[name] || 0, closeTags[name] || 0);
    total += Math.max(openTags[name] || 0, closeTags[name] || 0);
  });
  return total ? Math.max(0.1, matched / total) : 0;
}


function clamp01(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.min(1, Number(value)));
}

function averageProgress(values) {
  const clean = values.filter(value => Number.isFinite(Number(value)));
  if (!clean.length) return 0;
  return clamp01(clean.reduce((sum, value) => sum + Number(value), 0) / clean.length);
}

function weightedProgress(items) {
  const clean = items.filter(item => Number.isFinite(Number(item.value)) && Number(item.weight) > 0);
  const totalWeight = clean.reduce((sum, item) => sum + Number(item.weight), 0);
  if (!totalWeight) return 0;
  return clamp01(clean.reduce((sum, item) => sum + Number(item.value) * Number(item.weight), 0) / totalWeight);
}

function getCriterionRubricText(criterion) {
  const normalized = normalizeCriterion(criterion);
  const descriptions = rubricLevels
    .map(level => normalized.levels?.[level.key]?.description || '')
    .join(' ');
  return `${normalized.title || ''} ${descriptions || ''}`.trim();
}

function includesAnyText(text, patterns) {
  return patterns.some(pattern => typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text));
}

function countMatches(text, pattern) {
  return (String(text || '').match(pattern) || []).length;
}

function getCodeBasicsProgress() {
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const combinedLength = [html, css, js].join('').replace(/\s/g, '').length;
  const previewDoc = getPreviewDocument();
  const hasRuntimeError = Boolean(previewDoc?.body?.dataset?.runtimeError);
  const bodyTextLength = getOutputText().trim().length;

  return {
    htmlStructure: getHTMLStructureProgress(),
    balancedTags: getBalancedTagProgress(html),
    semanticTags: getSemanticTagProgress(html),
    visibleText: bodyTextLength >= 80 ? 1 : bodyTextLength >= 40 ? 0.85 : bodyTextLength >= 15 ? 0.6 : bodyTextLength >= 3 ? 0.35 : 0,
    effort: Math.min(1, combinedLength / 180),
    noRuntimeError: hasRuntimeError ? 0 : 1
  };
}

function getHTMLContentSmartProgress(text) {
  const html = codeStore.html || '';
  const outputText = getOutputText();
  const elementChecks = [];

  if (includesAnyText(text, [/heading|title heading|\bh[1-6]\b/])) elementChecks.push(/<h[1-6](\s|>|\/)/i.test(html) || Boolean(queryPreview('h1, h2, h3, h4, h5, h6')) ? 1 : 0);
  if (includesAnyText(text, [/paragraph|\bp\s*tag|\bp\b/])) elementChecks.push(/<p(\s|>|\/)/i.test(html) || Boolean(queryPreview('p')) ? 1 : 0);
  if (includesAnyText(text, [/image|picture|photo|\bimg\b/])) elementChecks.push(/<img(\s|>|\/)/i.test(html) || Boolean(queryPreview('img')) ? 1 : 0);
  if (includesAnyText(text, [/link|anchor|hyperlink|\ba\s*tag/])) elementChecks.push(/<a(\s|>|\/)/i.test(html) || Boolean(queryPreview('a')) ? 1 : 0);
  if (includesAnyText(text, [/button|clickable/])) elementChecks.push(/<button(\s|>|\/)/i.test(html) || Boolean(queryPreview('button')) ? 1 : 0);
  if (includesAnyText(text, [/list|bullet|numbered|\bul\b|\bol\b|\bli\b/])) elementChecks.push(/<(ul|ol)(\s|>|\/)/i.test(html) || Boolean(queryPreview('ul, ol')) ? 1 : 0);

  if (!elementChecks.length) {
    elementChecks.push(outputText.trim().length >= 15 ? 1 : outputText.trim().length >= 3 ? 0.5 : 0);
  }

  return averageProgress(elementChecks);
}

function getCSSSmartProgress(text) {
  const css = codeStore.css || '';
  const cssTrimmed = css.trim();
  if (!cssTrimmed) return 0;

  const propertyCount = countMatches(css, /[a-z-]+\s*:/gi);
  const visualCount = countMatches(css, /\b(color|background|font-size|font-family|font-weight|text-align|border|border-radius|box-shadow)\s*:/gi);
  const spacingCount = countMatches(css, /\b(padding|margin|gap|line-height)\s*:/gi);
  const layoutCount = countMatches(css, /\b(display|grid-template-columns|justify-content|align-items|flex|width|max-width|height)\s*:/gi);

  const hasSelector = /[.#]?[a-zA-Z][\w-]*\s*\{[^}]+\}/.test(css);
  const hasRequiredProperty = (() => {
    const propertyMatch = text.match(/\b(background-color|border-radius|font-family|font-size|text-align|box-shadow|grid-template-columns|justify-content|align-items|background|padding|margin|border|display|color|width|height|gap)\b/);
    return propertyMatch ? new RegExp(`\\b${propertyMatch[1]}\\s*:`, 'i').test(css) : 1;
  })();

  return weightedProgress([
    { value: hasSelector ? 1 : 0.4, weight: 1 },
    { value: Math.min(1, propertyCount / 6), weight: 2 },
    { value: Math.min(1, visualCount / 3), weight: 1.5 },
    { value: Math.min(1, spacingCount / 2), weight: 1 },
    { value: Math.min(1, layoutCount / 2), weight: includesAnyText(text, [/layout|organized|presentation|design/]) ? 1.2 : 0.5 },
    { value: hasRequiredProperty ? 1 : 0, weight: 1 }
  ]);
}

function getDesignPresentationSmartProgress(text) {
  const basics = getCodeBasicsProgress();
  return weightedProgress([
    { value: getCSSSmartProgress(text), weight: 3 },
    { value: basics.visibleText, weight: 1.5 },
    { value: getHTMLContentSmartProgress(text), weight: 1 },
    { value: basics.balancedTags, weight: 0.7 }
  ]);
}

function getJavaScriptSmartProgress(text) {
  const js = codeStore.js || '';
  const html = codeStore.html || '';
  if (!js.trim() && !/onclick\s*=/i.test(html)) return 0;

  const hasEvent = /addEventListener\s*\(/i.test(js) || /onclick\s*=/i.test(html);
  const changesPage = /(textContent|innerHTML|innerText|classList|style\.|setAttribute|appendChild|createElement)/i.test(js);
  const hasFunction = /function\s+|=>/.test(js);
  const noError = getCodeBasicsProgress().noRuntimeError;

  if (includesAnyText(text, [/event listener|onclick|interaction|interactive|click event|button action/])) {
    return weightedProgress([
      { value: hasEvent ? 1 : 0, weight: 2 },
      { value: changesPage ? 1 : 0.5, weight: 1 },
      { value: noError, weight: 1 }
    ]);
  }

  return weightedProgress([
    { value: hasFunction ? 1 : 0.5, weight: 1 },
    { value: hasEvent ? 1 : 0, weight: 1 },
    { value: changesPage ? 1 : 0, weight: 1 },
    { value: noError, weight: 1 }
  ]);
}

function getInstructionSmartProgress(text) {
  const basics = getCodeBasicsProgress();
  const wantsCss = includesAnyText(text, [/css|style|design|presentation|layout|visual|aesthetic|readability/]);
  const wantsJs = includesAnyText(text, [/javascript|script|event|interactive|button action|onclick/]);
  const wantsSemantic = includesAnyText(text, [/semantic|header|nav|main|section|article|aside|footer/]);

  const items = [
    { value: basics.htmlStructure, weight: 2 },
    { value: basics.balancedTags, weight: 1.5 },
    { value: basics.visibleText, weight: 1.5 },
    { value: basics.effort, weight: 1 },
    { value: basics.noRuntimeError, weight: 1 }
  ];

  if (wantsCss) items.push({ value: getCSSSmartProgress(text), weight: 1.5 });
  if (wantsJs) items.push({ value: getJavaScriptSmartProgress(text), weight: 1.5 });
  if (wantsSemantic) items.push({ value: basics.semanticTags, weight: 1.5 });

  return weightedProgress(items);
}

function getSmartCriterionProgress(criterion) {
  const rubricText = getCriterionRubricText(criterion);
  const text = rubricText.toLowerCase();
  if (!text.trim()) return null;

  const basics = getCodeBasicsProgress();
  const wantsFollowing = includesAnyText(text, [/following instructions|requirements?|completed accurately|met expectations|instructions not followed|exceeded expectations/]);
  const wantsSemantic = includesAnyText(text, [/semantic\s+tags?|semantic\s+html|\bheader\b|\bfooter\b|\bnav\b|\bmain\b|\bsection\b|\barticle\b|\baside\b/]);
  const wantsCompleteStructure = includesAnyText(text, [/(complete|full|proper|correct|basic).*html.*structure/, /doctype|<html|<head|<title|<body/, /well[-\s]?organized structure|correct structure/]);
  const wantsBalanced = includesAnyText(text, [/closing tag|closed tag|properly closed|balanced? tag|incomplete or inconsistent|missing many tags|disorganized/]);
  const wantsCSS = includesAnyText(text, [/css|style|styling|technical application|visual appeal|design|presentation|layout|aesthetic|consistent design|readability|creative|polish|color|background|font|spacing|border|broken layout/]);
  const wantsJS = includesAnyText(text, [/javascript|script|event listener|onclick|interaction|interactive|click event|button action|function|dom|textcontent|innerhtml|classlist/]);
  const wantsOutput = includesAnyText(text, [/visible text|readable content|content shown|output text|informative page|difficult to read|easy to read|webpage|page/]);

  // Specific requirements first.
  if (wantsSemantic && wantsCompleteStructure) {
    return weightedProgress([
      { value: basics.htmlStructure, weight: 2 },
      { value: basics.semanticTags, weight: 2 },
      { value: basics.balancedTags, weight: 1 },
      { value: basics.visibleText, weight: 0.7 }
    ]);
  }

  if (wantsSemantic) {
    return weightedProgress([
      { value: basics.semanticTags, weight: 2 },
      { value: basics.htmlStructure, weight: 1 },
      { value: basics.balancedTags, weight: 1 }
    ]);
  }

  if (wantsCompleteStructure) {
    return weightedProgress([
      { value: basics.htmlStructure, weight: 3 },
      { value: basics.balancedTags, weight: 1 },
      { value: basics.visibleText, weight: 0.5 }
    ]);
  }

  if (wantsBalanced) {
    return weightedProgress([
      { value: basics.balancedTags, weight: 2 },
      { value: basics.htmlStructure, weight: 1 },
      { value: basics.visibleText, weight: 0.5 }
    ]);
  }

  if (wantsJS) return getJavaScriptSmartProgress(text);

  if (wantsCSS && includesAnyText(text, [/design|presentation|visual|aesthetic|creative|readability|layout|polish|sloppy|unfinished/])) {
    return getDesignPresentationSmartProgress(text);
  }

  if (wantsCSS) return getCSSSmartProgress(text);

  if (wantsFollowing) return getInstructionSmartProgress(text);

  if (wantsOutput) {
    return weightedProgress([
      { value: basics.visibleText, weight: 2 },
      { value: getHTMLContentSmartProgress(text), weight: 1 },
      { value: basics.balancedTags, weight: 0.5 }
    ]);
  }

  // For broad/unrecognized rubric rows, judge the overall output instead of relying on a random dropdown.
  if (criterion.rule === 'smart_rubric') return getInstructionSmartProgress(text);

  return null;
}

function getCriterionProgress(criterion) {
  const smartProgress = getSmartCriterionProgress(criterion);
  if (smartProgress !== null) return clamp01(smartProgress);

  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const htmlLower = html.toLowerCase();
  const cssLower = css.toLowerCase();
  const jsLower = js.toLowerCase();
  const outputLower = getOutputText();
  const target = (criterion.target || '').trim().toLowerCase();
  const combinedLength = [html, css, js].join('').replace(/\s/g, '').length;

  if (checkCriterion(criterion)) return 1;

  switch (criterion.rule) {
    case 'full_html_structure':
      return getHTMLStructureProgress();
    case 'has_semantic_tags':
      return getSemanticTagProgress(html);
    case 'balanced_html_tags':
      return getBalancedTagProgress(html);
    case 'output_has_visible_text': {
      const length = outputLower.trim().length;
      if (length >= 20) return 1;
      if (length >= 10) return 0.75;
      if (length >= 3) return 0.5;
      return 0;
    }
    case 'minimum_effort':
      return Math.min(1, combinedLength / 120);
    case 'uses_css_property': {
      if (!css.trim()) return 0;
      const properties = (css.match(/[a-z-]+\s*:/gi) || []).length;
      return Math.min(0.85, properties / 4);
    }
    case 'uses_event_listener':
      return js.trim() || /<button(\s|>|\/)/i.test(html) ? 0.5 : 0;
    case 'js_changes_page':
      return js.trim() ? 0.5 : 0;
    case 'html_contains':
      return target && htmlLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'css_contains':
      return target && cssLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'js_contains':
      return target && jsLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'output_contains':
      return target && outputLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'no_runtime_error':
      return 0;
    default:
      return 0;
  }
}

function progressToLevelKey(progress) {
  if (progress >= 0.9) return 'excellent';
  if (progress >= 0.65) return 'good';
  if (progress >= 0.35) return 'fair';
  return 'needsImprovement';
}

function gradeCriterion(criterion) {
  const normalizedCriterion = normalizeCriterion(criterion);
  const progress = getCriterionProgress(normalizedCriterion);
  const levelKey = progressToLevelKey(progress);
  const level = getCriterionLevel(normalizedCriterion, levelKey);
  const possible = getCriterionPossiblePoints(normalizedCriterion);

  return {
    ...normalizedCriterion,
    progress,
    levelKey,
    levelLabel: level.label || rubricLevels.find(item => item.key === levelKey)?.label || levelKey,
    levelDescription: level.description || '',
    passed: levelKey === 'excellent' || levelKey === 'good',
    earned: Math.max(0, Number(level.points) || 0),
    points: possible
  };
}

function gradeActivity() {
  if (!activity) return null;
  saveActiveEditor();
  const results = activity.criteria.map(gradeCriterion);

  const score = results.reduce((sum, item) => sum + item.earned, 0);
  const possible = results.reduce((sum, item) => sum + item.points, 0);
  const percent = possible > 0 ? Math.round((score / possible) * 100) : 0;

  return {
    score,
    possible,
    percent,
    passed: percent >= activity.passingScore,
    results,
    feedback: generateFeedback(score, possible, percent, results)
  };
}

function formatPoints(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
}

function generateFeedback(score, possible, percent, results) {
  const missing = results.filter(item => item.levelKey === 'needsImprovement' || item.levelKey === 'fair').map(item => `${item.title} (${item.levelLabel})`);
  const achieved = results.filter(item => item.levelKey === 'excellent' || item.levelKey === 'good').map(item => `${item.title} (${item.levelLabel})`);

  let opening = '';
  if (percent >= 90) {
    opening = 'Excellent work! Your webpage meets almost all rubric requirements and shows strong beginner coding skills.';
  } else if (percent >= 75) {
    opening = 'Good job! Your output is on the right track. A few improvements can make it stronger.';
  } else if (percent >= 60) {
    opening = 'You are getting there. Review the missing criteria and improve your code before submitting.';
  } else {
    opening = 'Keep practicing. Start by completing the full HTML structure, then add clear visible content inside the body.';
  }

  const strengths = achieved.length
    ? `You successfully completed: ${achieved.slice(0, 3).join(', ')}${achieved.length > 3 ? ', and more' : ''}.`
    : 'No rubric item was completed yet, so begin with the activity instructions.';

  const nextSteps = missing.length
    ? `Next, improve: ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ', and other missing items' : ''}.`
    : 'No missing requirement was detected. You may polish the design, spacing, colors, and readability.';

  return `${opening} ${strengths} ${nextSteps} Score: ${formatPoints(score)}/${formatPoints(possible)}.`;
}


function getAIReviewEndpoint() {
  return String(window.MCS_AI_FEEDBACK_ENDPOINT || '').trim();
}

function isAIReviewEnabled() {
  return window.MCS_AI_FEEDBACK_ENABLED !== false;
}

function getAIReviewTimeoutMs() {
  const value = Number(window.MCS_AI_FEEDBACK_TIMEOUT_MS);
  return Number.isFinite(value) && value > 3000 ? value : 25000;
}

function getShortCodeSample(value, maxLength = 6000) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n/* ...code shortened for rubric review... */` : text;
}

function buildAIReviewPayload(result) {
  const currentResult = result || lastRubricResult || gradeActivity();
  const checkerItems = getErrorCheckerItems().map(item => ({
    type: item.type,
    title: item.title,
    detail: item.detail,
    fix: item.fix || ''
  }));

  return {
    app: 'Grade 8 MCSian Web Code Editor',
    activity: activity ? {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      passingScore: activity.passingScore,
      criteria: activity.criteria.map(item => ({
        title: item.title,
        points: getCriterionPossiblePoints(item),
        rule: item.rule,
        target: item.target || '',
        levels: item.levels || {}
      }))
    } : null,
    rubricResult: currentResult ? {
      score: currentResult.score,
      possible: currentResult.possible,
      percent: currentResult.percent,
      passed: currentResult.passed,
      feedback: currentResult.feedback,
      criteria: currentResult.results.map(item => ({
        title: item.title,
        levelKey: item.levelKey,
        levelLabel: item.levelLabel,
        earned: item.earned,
        points: item.points,
        rule: item.rule,
        target: item.target || '',
        progress: item.progress
      }))
    } : null,
    checkerItems,
    outputText: getOutputText().slice(0, 4000),
    code: {
      html: getShortCodeSample(codeStore.html),
      css: getShortCodeSample(codeStore.css),
      js: getShortCodeSample(codeStore.js)
    },
    instruction: 'Act as a Grade 8 ICT teacher. Use the teacher rubric as the main basis for scoring. Interpret the rubric level descriptions, inspect the code and output, then provide fair beginner-friendly scoring feedback. Do not mention AI. Do not give a complete replacement answer or full code. Return strengths, improvements, next steps, and an adjusted score only when the rubric result clearly mismatches the submitted work.'
  };
}

function getCheckerProblemsForAI() {
  return getErrorCheckerItems().filter(item => item.type === 'error' || item.type === 'warning');
}

function generateLocalAIReview(result) {
  const safeResult = result || lastRubricResult || gradeActivity();
  const problems = getCheckerProblemsForAI();
  const missingCriteria = safeResult?.results?.filter(item => item.levelKey === 'needsImprovement' || item.levelKey === 'fair') || [];
  const strongCriteria = safeResult?.results?.filter(item => item.levelKey === 'excellent' || item.levelKey === 'good') || [];
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const suggestions = [];

  if (!isCompleteHTMLStructure()) suggestions.push('Complete the full HTML structure first: doctype, html, head, title, and body.');
  if (!/<body[\s\S]*?>[\s\S]*?<\/body>/i.test(html)) suggestions.push('Put visible content inside the body section.');
  if (css.trim() && !/(color|background|padding|margin|font-size|display|border|border-radius)\s*:/i.test(css)) suggestions.push('Use simple CSS properties such as color, background, padding, margin, or font-size to improve design.');
  if (js.trim() && !/(addEventListener|onclick|textContent|innerHTML|classList|style\.)/i.test(js)) suggestions.push('For JavaScript activities, make sure your script changes something visible on the page.');

  problems.slice(0, 3).forEach(item => suggestions.push(`${item.title}: ${item.fix || item.detail}`));
  missingCriteria.slice(0, 3).forEach(item => suggestions.push(`Improve rubric item: ${item.title}. Current level: ${item.levelLabel}.`));

  const strengths = strongCriteria.length
    ? strongCriteria.slice(0, 3).map(item => item.title)
    : ['You started the page and can improve it step by step.'];

  const scoreLine = safeResult
    ? `${formatPoints(safeResult.score)}/${formatPoints(safeResult.possible)} (${safeResult.percent}%)`
    : 'No rubric result yet';

  return {
    mode: 'Rubric Review',
    officialScore: scoreLine,
    suggestedScore: safeResult ? safeResult.score : null,
    summary: safeResult
      ? safeResult.percent >= 90
        ? 'Strong work. The project meets most requirements and is ready for polishing.'
        : safeResult.percent >= 75
          ? 'Good work. The page is working, but a few details can still be improved.'
          : safeResult.percent >= 60
            ? 'Almost there. Focus on the missing rubric items and the error checker hints.'
            : 'Needs more improvement. Start with the basic HTML structure and visible page content.'
      : 'Click Result first so the app can compare your work with the selected rubric.',
    strengths,
    improvements: suggestions.length ? suggestions.slice(0, 6) : ['No major issue was detected. Improve design, spacing, readability, and creativity.'],
    nextSteps: [
      'Run the code again after every fix.',
      'Check the Error Checker before clicking Result.',
      'Make small improvements instead of changing everything at once.'
    ],
    teacherNote: ''
  };
}

function normalizeAIReviewResponse(data, fallbackResult) {
  if (!data) return generateLocalAIReview(fallbackResult);
  if (typeof data === 'string') {
    return {
      mode: 'Rubric Review',
      officialScore: fallbackResult ? `${formatPoints(fallbackResult.score)}/${formatPoints(fallbackResult.possible)} (${fallbackResult.percent}%)` : 'No rubric result yet',
      summary: data,
      strengths: [],
      improvements: [],
      nextSteps: [],
      teacherNote: ''
    };
  }

  return {
    mode: data.mode || data.source || 'Rubric Review',
    officialScore: data.officialScore || (fallbackResult ? `${formatPoints(fallbackResult.score)}/${formatPoints(fallbackResult.possible)} (${fallbackResult.percent}%)` : 'No rubric result yet'),
    suggestedScore: data.suggestedScore ?? data.score ?? null,
    summary: data.summary || data.feedback || data.message || 'Review completed.',
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    improvements: Array.isArray(data.improvements) ? data.improvements : Array.isArray(data.nextFixes) ? data.nextFixes : [],
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    teacherNote: data.teacherNote || data.note || ''
  };
}

function renderAIReview(review, options = {}) {
  if (!aiReviewContent) return;
  const safeReview = normalizeAIReviewResponse(review, lastRubricResult);
  const isLoading = options.loading === true;

  aiReviewContent.classList.remove('empty-ai-review');
  aiReviewContent.innerHTML = isLoading ? `
    <div class="ai-loading-box">
      <div class="ai-spinner" aria-hidden="true"></div>
      <div>
        <h3>Reviewing your work...</h3>
        <p>Please wait. The app is checking the rubric, code, output, and error checker hints.</p>
      </div>
    </div>
  ` : `
    <div class="ai-review-card">
      <div class="ai-review-main">
        <div>
          <p class="section-kicker">${escapeHTML(safeReview.mode || 'Rubric Review')}</p>
          <h3>${escapeHTML(safeReview.summary || 'Review completed.')}</h3>
          <p class="muted-text">Rubric score: <strong>${escapeHTML(safeReview.officialScore || 'Not available')}</strong>${safeReview.suggestedScore !== null && safeReview.suggestedScore !== undefined ? ` · Suggested score: <strong>${escapeHTML(formatPoints(safeReview.suggestedScore))}</strong>` : ''}</p>
        </div>
        <span class="ai-badge">Rubric</span>
      </div>

      <div class="ai-review-grid">
        <div class="ai-review-block good">
          <h4>Strengths</h4>
          <ul>${(safeReview.strengths?.length ? safeReview.strengths : ['Your work has been checked against the activity rubric.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
        </div>
        <div class="ai-review-block improve">
          <h4>Improve Next</h4>
          <ul>${(safeReview.improvements?.length ? safeReview.improvements : ['Polish spacing, readability, color, and content clarity.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
        </div>
        <div class="ai-review-block steps">
          <h4>Next Steps</h4>
          <ul>${(safeReview.nextSteps?.length ? safeReview.nextSteps : ['Fix one issue, run again, then check the result.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
        </div>
      </div>

      ${safeReview.teacherNote ? `<div class="ai-note"><strong>Note:</strong> ${escapeHTML(safeReview.teacherNote)}</div>` : ''}
    </div>
  `;
}

function resetAIReviewPanel() {
  if (!aiReviewContent) return;
  aiReviewContent.classList.add('empty-ai-review');
  aiReviewContent.innerHTML = `
    <div class="ai-empty-icon">✨</div>
    <h3>No detailed feedback yet</h3>
    <p>Click <strong>Result</strong> first, then use <strong>Review Feedback</strong> for clearer rubric notes.</p>
    <p class="ai-small-note">This feedback follows the teacher rubric and checker results.</p>
  `;
}

async function requestAIReview(options = {}) {
  if (!isStudentAssistanceFeatureEnabled('teacherFeedback')) {
    await appAlert('Detailed rubric feedback is currently disabled by the teacher.', { title: 'Feedback disabled' });
    return;
  }

  if (!isAIReviewEnabled()) {
    await appAlert('Detailed feedback is disabled in firebase-config.js.', { title: 'Feedback unavailable' });
    return;
  }

  if (!activity) {
    showActivityRequiredWarning();
    renderNoActivityResult();
    setStatus('Choose activity first');
    return;
  }

  runCode(false, { scroll: false });
  const result = lastRubricResult || gradeActivity();
  lastRubricResult = result;
  if (!result) return;

  const endpoint = getAIReviewEndpoint();
  renderAIReview(generateLocalAIReview(result), { loading: Boolean(endpoint) });
  setStatus(endpoint ? 'Review running...' : 'Feedback ready');

  if (!endpoint) {
    renderAIReview(generateLocalAIReview(result));
    if (options.scroll !== false) scrollElementIntoSafeView(document.getElementById('aiReviewPanel'));
    return;
  }

  try {
    if (aiReviewController) aiReviewController.abort();
    aiReviewController = new AbortController();
    const timeout = window.setTimeout(() => aiReviewController.abort(), getAIReviewTimeoutMs());

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAIReviewPayload(result)),
      signal: aiReviewController.signal
    });
    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Feedback endpoint returned ${response.status}`);
    }

    const data = await response.json();
    const review = normalizeAIReviewResponse(data.review || data, result);
    renderAIReview(review);
    setStatus('Feedback ready');
  } catch (error) {
    console.warn('Feedback review failed; using local smart review.', error);
    const fallback = generateLocalAIReview(result);
    fallback.teacherNote = '';
    renderAIReview(fallback);
    setStatus('Feedback ready');
  }

  if (options.scroll !== false) scrollElementIntoSafeView(document.getElementById('aiReviewPanel'));
}

function renderResult(result) {
  const pillClass = result.percent >= activity.passingScore
    ? ''
    : result.percent >= 60
      ? 'almost'
      : 'needs-work';
  const pillText = result.percent >= activity.passingScore ? 'Passed' : result.percent >= 60 ? 'Almost' : 'Needs Work';

  resultContent.classList.remove('empty-state');
  resultContent.innerHTML = `
    <div class="score-card">
      <div class="score-main">
        <div>
          <p class="section-kicker">Automatic Score</p>
          <div class="score-number">${formatPoints(result.score)}<small> / ${formatPoints(result.possible)}</small></div>
          <p class="muted-text">${result.percent}% · Passing score: ${activity.passingScore}%</p>
        </div>
        <span class="score-pill ${pillClass}">${pillText}</span>
      </div>

      <div class="feedback-box">
        <strong>Feedback:</strong> ${escapeHTML(result.feedback)}
      </div>

      <ul class="rubric-list" aria-label="Rubric breakdown">
        ${result.results.map(item => `
          <li class="rubric-item scale-result-item ${escapeAttribute(item.levelKey)}">
            <span class="rubric-check ${item.passed ? '' : 'fail'}">${item.passed ? '✓' : '!'}</span>
            <div>
              <p class="rubric-title">${escapeHTML(item.title)}</p>
              <div class="rubric-rule"><strong>${escapeHTML(item.levelLabel)}</strong> · ${escapeHTML(item.levelDescription || 'No level description set.')}<br><span>${escapeHTML(getRuleLabel(item.rule))}${item.target ? ` · Target: ${escapeHTML(item.target)}` : ''}</span></div>
            </div>
            <span class="rubric-points">${formatPoints(item.earned)}/${formatPoints(item.points)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderNoActivityResult() {
  lastRubricResult = null;
  resetAIReviewPanel();
  resultContent.classList.add('empty-state');
  resultContent.innerHTML = `
    <div class="empty-icon">!</div>
    <h3>No activity selected yet</h3>
    <p>Please choose an activity first before checking the result. Run Code still works, but scoring needs a selected rubric.</p>
  `;
  scrollElementIntoSafeView(resultPanel);
}

function showResult() {
  if (!activity) {
    showActivityRequiredWarning();
    setStatus('Choose activity first');
    return;
  }

  runCode(false, { scroll: false });
  setStatus('Checking rubric...');

  window.setTimeout(() => {
    const result = gradeActivity();
    if (!result) return;
    lastRubricResult = result;
    renderResult(result);
    renderAIReview(generateLocalAIReview(result));
    if (getAIReviewEndpoint()) {
      requestAIReview({ scroll: false });
    }
    saveCurrentStudentProject({ result, immediate: true, reason: 'result' });
    saveSubmissionToCloud(result);
    setStatus(`Score ${formatPoints(result.score)}/${formatPoints(result.possible)}`);
    scrollElementIntoSafeView(resultPanel);
  }, 350);
}

function getRuleLabel(rule) {
  return ruleOptions.find(option => option.value === rule)?.label || rule;
}

function resetResultPanel() {
  lastRubricResult = null;
  resetAIReviewPanel();
  resultContent.classList.add('empty-state');
  resultContent.innerHTML = `
    <div class="empty-icon">✓</div>
    <h3>No result yet</h3>
    <p>Click <strong>See Result</strong> when you are done with your selected activity.</p>
  `;
}


function updateActivityButtonState() {
  if (!stepActivityBtn) return;
  const hasActivity = Boolean(activity);
  stepActivityBtn.classList.toggle('activity-selected', hasActivity);
  stepActivityBtn.classList.toggle('activity-empty', !hasActivity);
  if (!stepActivityBtn.classList.contains('needs-attention')) {
    stepActivityBtn.classList.toggle('needs-attention', !hasActivity && activityWarning && !activityWarning.classList.contains('hidden'));
  }
  stepActivityBtn.innerHTML = hasActivity ? '✅ Activity Set' : '📌 Choose Activity';
  stepActivityBtn.title = hasActivity ? `Selected activity: ${activity.title}` : 'Choose an activity before checking Result';
  stepActivityBtn.setAttribute('aria-label', hasActivity ? `Activity selected: ${activity.title}` : 'Choose activity');
}

function getActivityRubricHTML(sourceActivity) {
  if (!sourceActivity || !Array.isArray(sourceActivity.criteria) || !sourceActivity.criteria.length) {
    return '<div class="empty-projects-card"><h3>No rubric yet</h3><p>Your teacher has not added rubric criteria for this activity.</p></div>';
  }
  const rows = sourceActivity.criteria.map((criterion, index) => {
    const normalized = normalizeCriterion(criterion);
    const levelCells = rubricLevels.map(level => {
      const levelData = getCriterionLevel(normalized, level.key);
      const description = levelData.description || defaultLevelDescriptions[level.key] || 'No description set.';
      const points = Number(levelData.points);
      return `
        <td>
          <strong>${Number.isFinite(points) ? `${formatPoints(points)} pts` : '—'}</strong>
          <span>${escapeHTML(description)}</span>
        </td>
      `;
    }).join('');
    return `
      <tr>
        <th scope="row"><span>${index + 1}</span>${escapeHTML(normalized.title)}</th>
        ${levelCells}
      </tr>
    `;
  }).join('');
  return `
    <table class="student-rubric-table">
      <thead>
        <tr>
          <th>Criteria</th>
          ${rubricLevels.map(level => `<th>${escapeHTML(level.label)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function openActivityRubricModal() {
  if (!activity) {
    showActivityRequiredWarning();
    return;
  }
  if (!activityRubricOverlay || !activityRubricTable) return;
  const possible = activity.criteria.reduce((sum, criterion) => sum + getCriterionPossiblePoints(criterion), 0);
  if (activityRubricTitle) activityRubricTitle.textContent = activity.title || 'Activity Rubric';
  if (activityRubricMeta) activityRubricMeta.textContent = `${formatPoints(possible)} total points • ${activity.criteria.length} rubric item${activity.criteria.length === 1 ? '' : 's'} • This is the full teacher rubric.`;
  activityRubricTable.innerHTML = getActivityRubricHTML(activity);
  activityRubricOverlay.classList.remove('hidden');
  document.body.classList.add('activity-rubric-open');
  window.setTimeout(() => closeActivityRubricBtn?.focus(), 30);
}

function closeActivityRubricModal() {
  activityRubricOverlay?.classList.add('hidden');
  document.body.classList.remove('activity-rubric-open');
}

function renderActivitySelector() {
  if (!activitySelect) return;
  const placeholder = `<option value="" ${activity ? '' : 'selected'}>Select an activity first...</option>`;
  const options = activities.map((item, index) => `
    <option value="${escapeAttribute(item.id)}" ${activity && item.id === activity.id ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)}</option>
  `).join('');
  activitySelect.innerHTML = placeholder + options;
}

function renderAdminActivitySelect() {
  if (!adminActivitySelect) return;

  if (!activities.length) {
    adminActivitySelect.innerHTML = '<option value="">No saved activities yet</option>';
    adminActivitySelect.value = '';
    return;
  }

  adminActivitySelect.innerHTML = activities.map((item, index) => `
    <option value="${escapeAttribute(item.id)}" ${item.id === adminEditingActivityId ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)}</option>
  `).join('');
}

function renderActivitySummary() {
  if (!activity) {
    activityTitle.textContent = 'No activity selected yet';
    activityDescription.textContent = 'Choose an activity first. Run Code still works, but score and feedback need a selected activity/rubric.';
    totalPoints.textContent = '0';
    criteriaCount.textContent = '0';
    activityCriteriaStat?.classList.add('disabled');
    renderActivitySelector();
    updateActivityButtonState();
    return;
  }

  const possible = activity.criteria.reduce((sum, criterion) => sum + getCriterionPossiblePoints(criterion), 0);
  activityTitle.textContent = activity.title;
  activityDescription.textContent = activity.description;
  totalPoints.textContent = formatPoints(possible);
  criteriaCount.textContent = activity.criteria.length;
  activityCriteriaStat?.classList.remove('disabled');
  renderActivitySelector();
  updateActivityButtonState();
  clearActivityRequiredWarning();
}

function selectActivity(activityId, options = {}) {
  if (!activityId) {
    if (!options.skipSave) saveActiveEditor();
    activity = null;
    selectedActivityId = '';
    saveJSON(STORAGE_KEYS.selectedActivityId, '');
    codeStore = normalizeCodeStore(starterCode);
    renderActivitySummary();
    loadActiveEditor();
    resetResultPanel();
    runCode(false, { scroll: false });
    return;
  }

  const nextActivity = getActivityById(activityId);
  if (!nextActivity) return;

  if (!options.skipSave) {
    saveActiveEditor();
  }

  activity = nextActivity;
  selectedActivityId = nextActivity.id;
  adminEditingActivityId = nextActivity.id;
  saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
  codeStore = getCodeStoreForActivity(nextActivity.id);

  if (!options.keepLanguage) {
    activeLanguage = 'html';
    tabButtons.forEach(tab => tab.classList.toggle('active', tab.dataset.language === activeLanguage));
  }

  renderActivitySummary();
  loadActiveEditor();
  resetResultPanel();
  runCode(false, { scroll: false });
  setStatus(`Loaded: ${nextActivity.title}`);
}

async function resetCurrentActivityCode() {
  if (!activity) {
    showActivityRequiredWarning();
    return;
  }

  if (!await appConfirm(`Reset your code for "${activity.title}"?`, { title: 'Reset activity code', danger: true })) return;
  codeStore = normalizeCodeStore(starterCode);
  codeByActivity[activity.id] = codeStore;
  saveCodeByActivity();
  resetAllLanguageHistoryForCurrentActivity();
  loadActiveEditor();
  resetResultPanel();
  runCode();
  setStatus('Activity code reset');
}

function setPreviewLayout(layout) {
  const safeLayout = ['split', 'stacked', 'preview-focus'].includes(layout) ? layout : 'split';
  workspace.dataset.layout = safeLayout;
  layoutButtons.forEach(button => button.classList.toggle('active', button.dataset.layout === safeLayout));
  saveJSON(STORAGE_KEYS.layout, safeLayout);
  setStatus(safeLayout === 'preview-focus' ? 'Big preview layout' : `${safeLayout[0].toUpperCase()}${safeLayout.slice(1)} layout`);
}

function setDesktopPreviewMode(enabled) {
  // The monitor simulation is intentionally available on phones only.
  if (!isLikelyPhoneViewport()) {
    applyPreviewDeviceMode();
    return;
  }

  const isEnabled = Boolean(enabled);
  previewPanel?.classList.toggle('mobile-desktop-preview', isEnabled);
  if (desktopPreviewBtn) {
    desktopPreviewBtn.classList.toggle('active', isEnabled);
    desktopPreviewBtn.setAttribute('aria-pressed', String(isEnabled));
    const isPhoneView = document.documentElement.dataset.deviceMode === 'phone' || window.innerWidth <= 760;
    desktopPreviewBtn.textContent = isPhoneView ? (isEnabled ? 'Phone' : 'Monitor') : (isEnabled ? 'Phone View' : 'Desktop Monitor');
    desktopPreviewBtn.dataset.mobileLabel = isEnabled ? '📱 Phone' : '🖥️ Monitor';
    desktopPreviewBtn.setAttribute('aria-label', isEnabled ? 'Return to phone preview' : 'Open desktop monitor preview');
    desktopPreviewBtn.title = isEnabled
      ? 'Return the preview to normal phone width'
      : 'Show the output inside a scaled desktop monitor view';
  }
  window.setTimeout(updateDesktopMonitorPreviewSizing, 0);
  setStatus(isEnabled ? 'Desktop monitor preview' : 'Phone preview');
}

function toggleDesktopPreviewMode() {
  setDesktopPreviewMode(!previewPanel?.classList.contains('mobile-desktop-preview'));
}

function ensureBackToEditorPreviewBtn() {
  let button = document.getElementById('backToEditorPreviewBtn');
  if (!button) {
    button = document.createElement('button');
    button.id = 'backToEditorPreviewBtn';
    button.type = 'button';
    button.className = 'layout-btn strong back-editor-preview-btn hidden';
    button.textContent = '↩ Back to Editor';
    button.title = 'Return to Full Editor';
    const actions = previewPanel?.querySelector('.preview-actions');
    if (actions && exitPreviewBtn) {
      actions.insertBefore(button, exitPreviewBtn);
    } else if (actions) {
      actions.appendChild(button);
    }
    button.addEventListener('click', backToEditorFromPreview);
  }
  return button;
}

function ensurePreviewResultBtn() {
  let button = document.getElementById('resultFromPreviewBtn');
  if (!button) {
    button = document.createElement('button');
    button.id = 'resultFromPreviewBtn';
    button.type = 'button';
    button.className = 'layout-btn strong preview-result-btn';
    button.textContent = '✓ Result';
    button.title = 'Check result from Output Preview';
    const actions = previewPanel?.querySelector('.preview-actions');
    const backButton = document.getElementById('backToEditorPreviewBtn');
    if (actions && exitPreviewBtn) {
      actions.insertBefore(button, exitPreviewBtn);
    } else if (actions && backButton?.nextSibling) {
      actions.insertBefore(button, backButton.nextSibling);
    } else if (actions) {
      actions.appendChild(button);
    }
    button.addEventListener('click', showResultFromPreview);
  }
  return button;
}

function ensurePreviewControlsToggle() {
  let button = document.getElementById('previewControlsToggle');
  const actions = previewPanel?.querySelector('.preview-actions');
  if (!button) {
    button = document.createElement('button');
    button.id = 'previewControlsToggle';
    button.type = 'button';
    button.className = 'layout-btn preview-controls-toggle hidden';
    button.textContent = '🖥️';
    button.title = 'Show output controls';
    button.setAttribute('aria-label', 'Show output controls');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const controls = previewPanel?.querySelector('.preview-actions');
      const isOpen = controls?.classList.toggle('output-menu-open');
      button.setAttribute('aria-expanded', String(Boolean(isOpen)));
      button.title = isOpen ? 'Hide output controls' : 'Show output controls';
      button.setAttribute('aria-label', isOpen ? 'Hide output controls' : 'Show output controls');
    });
  }
  if (actions && button.parentElement !== actions) {
    actions.insertBefore(button, actions.firstChild);
  }
  return button;
}

function setPreviewControlsMenu(open) {
  const actions = previewPanel?.querySelector('.preview-actions');
  const toggle = document.getElementById('previewControlsToggle');
  actions?.classList.toggle('output-menu-open', Boolean(open));
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(Boolean(open)));
    toggle.title = open ? 'Hide output controls' : 'Show output controls';
    toggle.setAttribute('aria-label', open ? 'Hide output controls' : 'Show output controls');
  }
}

function showResultFromPreview() {
  hideSuggestions();
  const wasPreviewFullscreen = document.body.classList.contains('preview-fullscreen-active');
  const wasInsideFullEditor = previewMovedIntoEditor ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    document.body.classList.contains('editor-fullscreen-active');

  if (wasPreviewFullscreen) {
    exitFullPreview({ keepReturnFlag: false, silent: true, keepNative: true });
    if (wasInsideFullEditor || document.body.classList.contains('editor-fullscreen-active')) {
      exitFullEditor({ silent: true, skipFocus: true });
    }
    window.setTimeout(() => {
      showResult();
    }, 180);
    return;
  }

  showResult();
}


function setPreviewTransitionClass() {
  window.clearTimeout(previewTransitionTimer);
  document.body.classList.add('preview-transitioning');
  previewTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove('preview-transitioning');
  }, 360);
}

function enterFullPreview(options = {}) {
  const fromFullEditor = Boolean(options.fromFullEditor || returnToFullEditorAfterPreview);
  const insideEditorFullscreen = Boolean(
    fromFullEditor &&
    options.keepEditorFullscreen !== false &&
    document.body.classList.contains('editor-fullscreen-active') &&
    movePreviewPanelIntoEditorFullscreen()
  );
  const wantsNativeFullscreen = options.nativeFullscreen !== false && !insideEditorFullscreen;

  returnToFullEditorAfterPreview = fromFullEditor;
  const backButton = ensureBackToEditorPreviewBtn();
  const previewResultButton = ensurePreviewResultBtn();
  const previewControlsToggle = ensurePreviewControlsToggle();
  backButton?.classList.toggle('hidden', !fromFullEditor);
  previewResultButton?.classList.toggle('hidden', !fromFullEditor);
  previewControlsToggle?.classList.toggle('hidden', !fromFullEditor);
  setPreviewControlsMenu(false);

  document.body.classList.add('preview-fullscreen-active');
  document.body.classList.toggle('preview-has-back-editor', fromFullEditor);
  document.body.classList.toggle('preview-inside-editor-fullscreen', insideEditorFullscreen);
  document.body.classList.remove('preview-closing-to-editor');

  // When the preview is shown inside the full editor, hide editor-only floating controls.
  // The preview must show only its own Back/Exit controls so it does not look like
  // the editor buttons are part of the student's output.
  if (insideEditorFullscreen) {
    hideSuggestions();
    closeCodeHelperPanel();
    ensureFullscreenActionBar()?.classList.add('hidden');
  }

  if (!insideEditorFullscreen) {
    setPreviewTransitionClass();
  }

  fullPreviewBtn?.classList.add('hidden');
  exitPreviewBtn?.classList.remove('hidden');
  window.setTimeout(updateDesktopMonitorPreviewSizing, 0);

  if (wantsNativeFullscreen && previewPanel?.requestFullscreen && document.fullscreenElement !== previewPanel) {
    previewPanel.requestFullscreen().catch(() => {
      // If the browser blocks native fullscreen, the CSS fullscreen fallback remains active.
    });
  }

  setStatus(fromFullEditor ? 'Output preview' : 'Full preview');
}

function exitFullPreview(options = {}) {
  // The Exit button in a preview that came from Full Editor must close the whole
  // fullscreen flow, not return to the editor fullscreen. Back to Editor already
  // handles that separate behavior.
  const safeOptions = options && typeof options === 'object' && !('target' in options) ? options : {};
  const isInsideEditorFullscreen = previewMovedIntoEditor || document.body.classList.contains('preview-inside-editor-fullscreen');
  const shouldCloseEditorFullscreen = Boolean(safeOptions.closeEditorFullscreen && isInsideEditorFullscreen);
  const shouldExitNativePreview = document.fullscreenElement === previewPanel &&
    !safeOptions.keepNative &&
    !safeOptions.fromNative &&
    document.exitFullscreen;
  const shouldExitNativeEditor = shouldCloseEditorFullscreen &&
    document.fullscreenElement === editorPanel &&
    !safeOptions.keepNative &&
    !safeOptions.fromNative &&
    document.exitFullscreen;

  document.body.classList.remove(
    'preview-fullscreen-active',
    'preview-has-back-editor',
    'preview-closing-to-editor',
    'preview-inside-editor-fullscreen',
    'book-preview-revealing',
    'book-preview-leaving'
  );

  if (!isInsideEditorFullscreen) {
    setPreviewTransitionClass();
  }

  fullPreviewBtn?.classList.remove('hidden');
  exitPreviewBtn?.classList.add('hidden');
  ensureBackToEditorPreviewBtn()?.classList.add('hidden');
  if (isInsideEditorFullscreen) ensurePreviewResultBtn()?.classList.add('hidden');
  else ensurePreviewResultBtn()?.classList.remove('hidden');
  ensurePreviewControlsToggle()?.classList.add('hidden');
  setPreviewControlsMenu(false);

  if (isInsideEditorFullscreen) {
    restorePreviewPanelFromEditorFullscreen();
  }

  if (shouldCloseEditorFullscreen) {
    document.body.classList.remove('editor-fullscreen-active');
    document.getElementById('fullscreenEditorActions')?.classList.add('hidden');
    document.getElementById('exitEditorStickyBtn')?.classList.add('hidden');
    document.getElementById('fullscreenRunBtn')?.classList.add('hidden');
    document.getElementById('fullscreenResultBtn')?.classList.add('hidden');
    fullEditorBtn?.classList.remove('hidden');
    exitEditorBtn?.classList.add('hidden');
    hideSuggestions();
    closeCodeHelperPanel();
  }

  if (shouldExitNativePreview || shouldExitNativeEditor) {
    document.exitFullscreen().catch(() => {});
  }

  if (!safeOptions.keepReturnFlag) {
    returnToFullEditorAfterPreview = false;
  }
  if (!safeOptions.silent) {
    setStatus(shouldCloseEditorFullscreen ? 'Fullscreen closed' : 'Preview restored');
  }

  window.setTimeout(updateDesktopMonitorPreviewSizing, 0);
  fitEditorToContent();
}

function backToEditorFromPreview() {
  if (fullscreenPageTransitionBusy) return;
  const isInsideEditorFullscreen = previewMovedIntoEditor || document.body.classList.contains('preview-inside-editor-fullscreen');

  if (isInsideEditorFullscreen) {
    fullscreenPageTransitionBusy = true;
    hideSuggestions();
    closeCodeHelperPanel();
    document.body.classList.add('preview-closing-to-editor');

    runSmoothFullscreenBookTransition({
      direction: 'to-editor',
      label: 'Back to Editor',
      onSwap: () => {
        restoreEditorFullscreenAfterPreview();
        document.body.classList.add('book-editor-revealing');
        scheduleFullEditorControlsRestore();
        setStatus('Back to editor');
      },
      onDone: () => {
        document.body.classList.remove('book-editor-revealing', 'preview-closing-to-editor');
        editor?.focus({ preventScroll: true });
      }
    });
    return;
  }

  // Normal native-preview fallback: switch it back to the editor while this click has user activation.
  if (document.fullscreenElement === previewPanel && editorPanel?.requestFullscreen) {
    editorPanel.requestFullscreen().catch(() => {});
  }

  exitFullPreview({ keepReturnFlag: true, silent: true, keepNative: true });
  window.setTimeout(() => {
    enterFullEditor();
    restoreEditorFullscreenAfterPreview();
    scheduleFullEditorControlsRestore();
    returnToFullEditorAfterPreview = false;
    fullscreenPageTransitionBusy = false;
    setStatus('Back to editor');
  }, 180);
}


