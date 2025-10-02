import OpenAI from 'openai';

const openaiClient = new OpenAI({
   baseURL: 'https://api.deepseek.com',
   apiKey: process.env.DEEPSEEK_API_KEY,
});

type GenerateTextOptions = {
   model?: string;
   prompt: string;
   instructions?: string;
   temperature?: number;
   maxTokens?: number;
   previousResponseId?: string;
};

type GenerateTextResult = {
   id: string;
   text: string;
};

export const llmClient = {
   async generateText({
      model = 'deepseek-chat',
      prompt,
      instructions,
      temperature = 0.2,
      maxTokens = 300,
      previousResponseId,
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      //   const response = await openaiClient.responses.create({
      //      model,
      //      input: prompt,
      //      instructions,
      //      temperature,
      //      max_output_tokens: maxTokens,
      //      previous_response_id: previousResponseId,
      //   });
      const completion = await openaiClient.chat.completions.create({
         messages: [
            { role: 'system', content: instructions || '' },
            {
               role: 'user',
               content: prompt,
            },
         ],
         model,
         temperature,
         max_completion_tokens: maxTokens,
      });

      return {
         id: crypto.randomUUID(),
         text: completion.choices[0]?.message.content || '',
      };
   },

   // other interfaces
   //    async summarizeReviews(reviews: string) {},
};
