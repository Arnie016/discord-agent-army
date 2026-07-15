const words = (text) => new Set(String(text).toLowerCase().match(/[a-z0-9]+/g) || []);

export function matchFaq(question, faqs) {
  const query = words(question);
  return faqs
    .map((faq) => {
      const terms = words(`${faq.question} ${(faq.keywords || []).join(" ")}`);
      const overlap = [...query].filter((term) => terms.has(term)).length;
      const score = query.size ? overlap / Math.max(2, Math.min(query.size, terms.size)) : 0;
      return { faq, score };
    })
    .sort((a, b) => b.score - a.score)[0] || { faq: null, score: 0 };
}
