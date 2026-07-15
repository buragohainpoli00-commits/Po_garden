import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import sharp from 'sharp';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing with increased payload limits for image data
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

app.post('/api/identify-plant', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not configured' });
    }

    // Strip the data URL prefix and get the raw base64 string
    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    }

    // Convert the raw base64 to a Buffer
    const inputBuffer = Buffer.from(base64Data, 'base64');

    // Use sharp to re-encode the image as a clean PNG regardless of source format.
    // This permanently eliminates JPEG corruption errors, HEIC, canvas blobs, etc.
    let pngBuffer;
    try {
      pngBuffer = await sharp(inputBuffer)
        .png({ compressionLevel: 6 })
        .toBuffer();
    } catch (sharpErr) {
      console.error('Image conversion error:', sharpErr);
      return res.status(400).json({ error: 'Could not process the uploaded image. Please try a different photo.' });
    }

    // Convert the clean PNG buffer back to base64
    const cleanBase64 = pngBuffer.toString('base64');

    const messagePrompt = `You are a master botanist. Analyze this plant portrait and identify the plant.
Return a valid JSON object matching the following structure:
{
  "name": "Common name of the plant (e.g. Fiddle-Leaf Fig)",
  "species": "Botanical species name (e.g. Ficus lyrata)",
  "thirstLevel": a number from 1 to 5 representing watering frequency (1 = desert succulent/cactus, 2 = when completely dry, 3 = moderate 1-2 weeks, 4 = keep soil moist, 5 = constant high humidity/swamp),
  "difficulty": "easy" or "medium" or "hard" maintenance level,
  "about": "A concise paragraph detailing general care instructions, light preferences, and pet toxicity."
}

Do not include any wrapping markdown formatting like \`\`\`json or extra text or explanations. Return ONLY the raw JSON object.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png', // Always PNG after sharp re-encoding
                data: cleanBase64,
              },
            },
            {
              type: 'text',
              text: messagePrompt,
            },
          ],
        },
      ],
    });

    let rawText = response.content[0].text.trim();

    // Clean up code block wrappers if Claude returns them anyway
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Claude returned invalid JSON:', rawText);
      return res.status(500).json({ error: 'Failed to parse AI response into structured plant data' });
    }

    res.json(parsedResult);
  } catch (error) {
    console.error('Error during plant identification:', error);
    res.status(500).json({ error: error.message || 'Internal server error during identification' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Sprout Journal VisionAI Proxy running on port ${PORT}`);
  });
}

export default app;
