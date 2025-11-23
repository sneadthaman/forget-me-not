// Call to OpenAI to generate inside message text for a greeting card.
const OpenAI = require('openai');

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set; generateText will throw until configured.');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate greeting card text.
 * @param {Object} params
 * @param {string} params.recipientName
 * @param {string} params.occasionType - e.g., birthday, anniversary, holiday, custom
 * @param {string} [params.relationship] - mother, friend, spouse, etc.
 * @param {string} [params.tone='warm'] - tone/style hint
 * @param {string} [params.senderName] - who is sending the card
 * @param {string[]} [params.interests=[]] - optional interests/hobbies for personalization
 * @param {number} [params.wordCount=60] - approximate word count target
 * @param {string} [params.customLabel] - label for custom occasions
 * @returns {Promise<string>}
 */
async function generateText({
  recipientName,
  occasionType,
  relationship,
  tone = 'warm',
  senderName,
  interests = [],
  wordCount = 60,
  customLabel,
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing for generateText');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const occasionLabel = occasionType === 'custom' && customLabel ? customLabel : occasionType;
  const interestList = interests.length ? `Interests: ${interests.join(', ')}.` : '';
  const senderLine = senderName ? `Sign off as ${senderName}.` : 'Sign off with a warm closing.';

  const system = 'You write concise, heartfelt greeting card messages that fit on a card interior.';
  const user = `Write a ~${wordCount}-word ${tone} message for a ${occasionLabel} card to ${recipientName || 'a loved one'}${relationship ? ` (${relationship})` : ''}. ${interestList} ${senderLine}`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  const text = completion.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenAI returned no content');
  }
  return text;
}

module.exports = generateText;
