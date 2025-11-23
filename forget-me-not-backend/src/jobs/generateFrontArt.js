const OpenAI = require('openai');
const supabaseStorage = require('../storage');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const defaultImageModel = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';

/**
 * Generate front art via OpenAI Images and upload to Supabase Storage.
 * @param {Object} params
 * @param {string} params.cardJobId
 * @param {string} [params.occasionType]
 * @param {string} [params.tone]
 * @param {string} [params.contactName]
 * @returns {Promise<string>} public URL of the stored image
 */
module.exports = async function generateFrontArt({ cardJobId, occasionType, tone, contactName }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing for generateFrontArt');
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'card-art';
  const imageModel = defaultImageModel;

  const label = occasionType || 'greeting';
  const frontText = contactName ? `For ${contactName}` : 'With love';
  const style = tone || 'warm';

  const prompt = [
    'Single flat 5x7 inch greeting card FRONT ARTWORK ONLY, portrait orientation, full-bleed digital illustration',
    'Render ONLY the artwork (exported image), NOT a product photo. No mockups, no multiple cards, no envelopes, no props (pens, pencils), no hands, no shadows, no folds, no texture.',
    'Absolutely no text, numbers, speech bubbles, captions, or labels. Leave space, but do not draw letters.',
    'Simple clean background, no borders, no drop shadows, no 3D, no bevels.',
    `Occasion theme: ${label}; tone: ${style}`,
    'High print quality, balanced composition, centered subject'
  ].join('. ');

  async function generateB64(model) {
    const params = {
      model,
      prompt,
      size: '1024x1024',
    };
    // DALL-E models accept response_format; gpt-image-1 does not.
    if (model.startsWith('dall-e')) {
      params.response_format = 'b64_json';
    }
    const result = await client.images.generate(params);
    return result.data?.[0]?.b64_json;
  }

  let b64;
  try {
    b64 = await generateB64(imageModel);
  } catch (err) {
    // Fallback to dall-e-3 if org not verified for the requested model
    if (err.status === 403 && imageModel !== 'dall-e-3') {
      console.warn(`Image model ${imageModel} forbidden, falling back to dall-e-3`);
      b64 = await generateB64('dall-e-3');
    } else {
      throw err;
    }
  }

  if (!b64) {
    throw new Error('OpenAI image generation returned no data');
  }

  const buffer = Buffer.from(b64, 'base64');
  const path = `card-art/${cardJobId || 'preview'}-${Date.now()}.png`;

  const { error: uploadErr } = await supabaseStorage.storage
    .from(bucket)
    .upload(path, buffer, { contentType: 'image/png', upsert: true });
  if (uploadErr) throw uploadErr;

  const { data: publicData, error: urlErr } = supabaseStorage.storage
    .from(bucket)
    .getPublicUrl(path);
  if (urlErr) throw urlErr;

  return publicData.publicUrl;
};
