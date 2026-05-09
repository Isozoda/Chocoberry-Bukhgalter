"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAshanMessage = isAshanMessage;
exports.parseAshanMessage = parseAshanMessage;
function levenshtein(a, b) {
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = dp[j];
            dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(dp[j], dp[j - 1], prev);
            prev = tmp;
        }
    }
    return dp[b.length];
}
function stripEmoji(text) {
    return text
        .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
        .replace(/[\u{2600}-\u{27BF}]/gu, '')
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
        .replace(/️/g, '')
        .trim();
}
function parseLineQty(line) {
    const m = line.match(/(\d+(?:[.,]\d+)?)\s*(кг\.?|гр?\.?|шт\.?|л\.?|мл)$/iu);
    if (!m)
        return null;
    const rawName = line.slice(0, line.length - m[0].length).trim();
    const name = stripEmoji(rawName);
    if (!name)
        return null;
    const rawQty = parseFloat(m[1].replace(',', '.'));
    const unitRaw = m[2].toLowerCase().replace(/\.$/, '');
    let unit;
    let quantity;
    if (unitRaw === 'кг') {
        unit = 'кг';
        quantity = rawQty;
    }
    else if (unitRaw === 'г' || unitRaw === 'гр') {
        unit = 'кг';
        quantity = rawQty / 1000;
    }
    else if (unitRaw === 'шт') {
        unit = 'шт';
        quantity = rawQty;
    }
    else if (unitRaw === 'л') {
        unit = 'л';
        quantity = rawQty;
    }
    else if (unitRaw === 'мл') {
        unit = 'л';
        quantity = rawQty / 1000;
    }
    else {
        unit = unitRaw;
        quantity = rawQty;
    }
    return { name, quantity, unit };
}
function bestMatchDist(name, item) {
    const key = name.toLowerCase();
    return Math.min(levenshtein(key, item.name.toLowerCase()), item.nameRu ? levenshtein(key, item.nameRu.toLowerCase()) : 9999, item.nameTg ? levenshtein(key, item.nameTg.toLowerCase()) : 9999);
}
function isAshanMessage(text) {
    const lines = text.trim().split('\n');
    if (lines[0].trim().match(/^ашан$/iu))
        return true;
    const unitPat = /\d+(?:[.,]\d+)?\s*(?:кг|г|гр|шт|л|мл)/iu;
    return lines.filter((l) => unitPat.test(l)).length >= 2;
}
function parseAshanMessage(text, items) {
    const lines = text.trim().split('\n');
    const start = lines[0].trim().match(/^ашан$/iu) ? 1 : 0;
    const matched = [];
    const notFound = [];
    for (let i = start; i < lines.length; i++) {
        const parsed = parseLineQty(lines[i].trim());
        if (!parsed)
            continue;
        const { name, quantity, unit } = parsed;
        const ranked = items
            .map((item) => ({ item, dist: bestMatchDist(name, item) }))
            .sort((a, b) => a.dist - b.dist);
        const best = ranked[0];
        if (best && best.dist <= 3) {
            matched.push({
                rawText: lines[i].trim(),
                name,
                quantity,
                unit,
                itemId: best.item.id,
                itemName: best.item.name,
                itemUnit: best.item.unit,
                currentStock: best.item.currentStock,
            });
        }
        else {
            notFound.push({
                rawText: lines[i].trim(),
                name,
                quantity,
                unit,
                suggestions: ranked.slice(0, 3).map((r) => r.item),
            });
        }
    }
    return { matched, notFound };
}
