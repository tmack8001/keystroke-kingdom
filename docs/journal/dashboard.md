# Journal Dashboard
*Live status board — renders via the Dataview plugin (shipped with this vault). Agents use
the CLI equivalent: `node scripts/wiki-search.mjs --journal`. Schema: [[JOURNAL]].*

## 🔴 Open items (the actionable queue)

```dataview
TABLE title AS Title, importance AS Importance, category AS Category, found AS Found
FROM "docs/journal/entries"
WHERE status = "open"
SORT choice(importance = "critical", 0, choice(importance = "high", 1, choice(importance = "medium", 2, 3))) ASC
```

## ✅ Recently addressed

```dataview
TABLE title AS Title, addressed-by AS "Addressed by", addressed-date AS Date
FROM "docs/journal/entries"
WHERE status = "addressed" AND addressed-date
SORT addressed-date DESC
LIMIT 10
```

## 📊 By category

```dataview
TABLE length(rows) AS Count
FROM "docs/journal/entries"
GROUP BY category
SORT length(rows) DESC
```

## 🚨 Critical & high importance (all time)

```dataview
TABLE title AS Title, kind AS Kind, status AS Status, found AS Found
FROM "docs/journal/entries"
WHERE importance = "critical" OR importance = "high"
SORT found DESC
```

## 🧭 Failures timeline

```dataview
TABLE title AS Title, status AS Status, importance AS Importance
FROM "docs/journal/entries"
WHERE kind = "failure"
SORT found ASC
```
