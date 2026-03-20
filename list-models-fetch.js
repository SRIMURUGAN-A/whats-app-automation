import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    const response = await axios.get(url);
    console.log('MODELS:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('STATUS:', err.response.status);
      console.log('BODY:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('ERROR:', err.message);
    }
  }
}

listModels();
