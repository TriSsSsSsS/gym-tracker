import dotenv from 'dotenv';

dotenv.config();

const hfToken = process.env.HF_TOKEN;
console.log('Hugging Face Token:', hfToken); // Per verificare che il token venga caricato