export default async function handler(req, res) {
  try {
    const { method, body } = req;
    const { prompt, tone, style, genre } = JSON.parse(body);

    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.status(200).end();
      return;
    }

    if (method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!prompt || !tone || !style || !genre) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const systemPrompt = `Generate a ${genre} story or poem in the style of ${style} with a ${tone} tone. Use the following prompt: ${prompt}`;
    const messages = [{ role: 'system', content: systemPrompt }];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}