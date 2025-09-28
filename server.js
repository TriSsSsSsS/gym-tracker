// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Per chiamate HTTP a Hugging Face

dotenv.config();

console.log('🔧 Debug Environment:');
console.log('PROVIDER:', process.env.PROVIDER);
console.log('HF_API_TOKEN:', process.env.HF_API_TOKEN ? 'SET' : 'MISSING');
console.log('HF_MODEL:', process.env.HF_MODEL);

async function callHuggingFaceWithRetry(prompt, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Tentativo ${i + 1}/${maxRetries} con Hugging Face...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout

            const response = await fetch(`https://api-inference.huggingface.co/models/${process.env.HF_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1'}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        return_full_text: false
                    },
                    options: {
                        wait_for_model: true,
                        use_cache: false
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HF API Error (${response.status}):`, errorText);
                if (response.status === 503) {
                    console.log('Modello in loading, aspetto 10 secondi...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    continue;
                }
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Risposta HF ricevuta:', data);

            if (Array.isArray(data) && data[0]?.generated_text) {
                return data[0].generated_text;
            } else if (data.generated_text) {
                return data.generated_text;
            } else if (typeof data === 'string') {
                return data;
            } else {
                return JSON.stringify(data);
            }

        } catch (error) {
            console.error(`Tentativo ${i + 1} fallito:`, error.message);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

function buildSimplePrompt(data) {
    return `Crea una scheda palestra in formato JSON per ${data.name}.
Età: ${data.age}, Livello: ${data.level}, Obiettivi: ${data.goals}.
Esercizi per sessione: ${data.numExercises || 6}.

Rispondi SOLO con questo JSON:
{
  "title": "Scheda per ${data.name}",
  "sessions_per_week": ${data.sessionsPerWeek || 3},
  "workout_days": [
    {
      "day": "Sessione 1",
      "focus": "Full Body",
      "exercises": [
        {
          "name": "Squat",
          "sets": 3,
          "reps": "10-12",
          "notes": "Mantieni la schiena dritta"
        }
      ]
    }
  ]
}`;
}

function generateMockWorkout(data) {
    const exercises = [
        { name: "Squat", muscle_group: "gambe", sets: 3, reps: "10-12" },
        { name: "Push-up", muscle_group: "petto", sets: 3, reps: "8-15" },
        { name: "Plank", muscle_group: "core", sets: 3, reps: "30-60 sec" },
        { name: "Affondi", muscle_group: "gambe", sets: 3, reps: "10 per gamba" },
        { name: "Pull-up assistiti", muscle_group: "schiena", sets: 3, reps: "5-10" },
        { name: "Mountain climbers", muscle_group: "cardio", sets: 3, reps: "20" }
    ];

    const selectedExercises = exercises
        .slice(0, data.numExercises || 6)
        .map(ex => ({
            ...ex,
            tempo: "2-0-1",
            notes: `Adatto per livello ${data.level}. Riposa 60-90 sec tra le serie.`
        }));

    return {
        title: `Programma personalizzato per ${data.name}`,
        duration_weeks: 8,
        sessions_per_week: data.sessionsPerWeek || 3,
        workout_days: [{
            day: "Sessione Full Body",
            focus: "Full Body",
            exercises: selectedExercises
        }],
        notes: `Programma creato per ${data.name}, livello ${data.level}. Aumenta gradualmente l'intensità.`
    };
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve file statici dalla root (index.html)

app.post('/api/generate-workout', async (req, res) => {
    try {
        const data = req.body;
        const prompt = buildSimplePrompt(data);
        const result = await callHuggingFaceWithRetry(prompt);
        res.json({ success: true, workout: JSON.parse(result) });
    } catch (error) {
        console.error('Errore AI:', error);
        res.status(500).json({ error: 'Errore nella generazione della scheda' });
    }
});

app.get('/api/test-ai', async (req, res) => {
    try {
        const testPrompt = "Rispondi solo con: {'test': 'ok'}";
        const result = await callHuggingFaceWithRetry(testPrompt);
        res.json({ success: true, result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(new URL('./index (1).html', import.meta.url).pathname);
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;