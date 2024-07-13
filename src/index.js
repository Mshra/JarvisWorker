import { GoogleGenerativeAI } from '@google/generative-ai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

export default {
	async fetch(request, env, ctx) {
		// handling CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		if (request.method === 'POST') {
			const { prompt } = await request.json();

			const genAI = new GoogleGenerativeAI(env.API_KEY);

			const generationConfig = {
				maxOutputTokens: 1000,
				temperature: 0.9,
				topP: 0.1,
				topK: 16,
			};

			const safetySettings = [
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
				},
				{
					category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
					threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
				},
			];

			const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig, safetySettings });

			// generates the text response
			const result = await model.generateContent(prompt);

			// creating a new response and adding CORS headers to it.
			let response = Response.json({ AIresponse: result.response.text() }, { status: 200 });
			response = new Response(response.body, response);
			response.headers.set('Access-Control-Allow-Origin', '*');
			return response;
		} else {
			return new Response('Please send a GET request!', { status: 400 });
		}
	},
};
