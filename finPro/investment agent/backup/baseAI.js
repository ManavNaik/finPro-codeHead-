import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'deepseek/deepseek-chat-v3.1:free',
    messages: [
      {
        role: 'user',
        content: 'hello',
      },
    ],
  });

  console.log(completion.choices[0].message);
}

main();