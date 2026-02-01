const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env' });

async function test() {
  try {
    console.log('Testing Groq API with key:', process.env.GROQ_API_KEY?.substring(0, 10) + '...');
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello!' }],
      model: 'llama-3.3-70b-versatile',
      temperature: 1.0,
      max_tokens: 50,
    });
    
    console.log('Success! Response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
  }
}

test();
