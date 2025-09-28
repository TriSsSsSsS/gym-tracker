// SERVER.JS - Backend per generazione schede AI
// Installa le dipendenze con: npm install express cors dotenv node-fetch
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve i file statici dalla cartella corrente

function buildPrompt(data) {
    const sessionsText = data.sessionsPerWeek ? `${data.sessionsPerWeek} session${data.sessionsPerWeek > 1 ? 'i' : 'e'} a settimana` : '3 sessioni a settimana';
    const excludedText = Array.isArray(data.excludedExercises) && data.excludedExercises.length > 0 ? 
        `NON includere questi esercizi: ${data.excludedExercises.join(', ')}.` : '';
    
    return `Sei un personal trainer virtuale esperto che crea schede di allenamento personalizzate e sicure.

DATI DELL'UTENTE:
- Nome: ${data.name}
- Età: ${data.age} anni
- Altezza: ${data.height || 'non specificata'} cm
- Peso: ${data.weight || 'non specificato'} kg
- Obiettivi: ${data.goals}
- Livello di esperienza: ${data.level}
- Tipo di allenamento: ${data.workoutType || 'palestra completa'}
- Tempo disponibile per sessione: ${data.time || 'non specificato'} minuti
- Numero esercizi per sessione: ${data.numExercises || '6-8 (consigliato)'} esercizi
- Sessioni settimanali: ${sessionsText}
- Dolori/limitazioni: ${data.issues || 'nessuno'}
- Preferenze di allenamento: ${data.preferences || 'nessuna preferenza specifica'}
- Esercizi preferiti: ${data.preferredExercises || 'nessuno specificato'}
- ${excludedText}

ISTRUZIONI IMPORTANTI:
1. Crea schede separate per ogni sessione settimanale
2. Adatta gli esercizi al livello, altezza, peso e obiettivi dell'utente
3. Rispetta il numero di esercizi richiesto per sessione
4. Considera sempre i dolori e le limitazioni fisiche segnalate
5. Adatta gli esercizi al tempo disponibile
6. Fornisci alternative più facili/difficili quando necessario
7. ${excludedText ? 'Rispetta rigorosamente gli esercizi da escludere' : 'Scegli esercizi appropriati'}
8. Considera gli esercizi preferiti dell'utente quando possibile
9. Struttura le sessioni in modo equilibrato (upper/lower/full body secondo necessità)

FORMATO RICHIESTO - Rispondi SOLO con JSON valido:
{
  "title": "Programma di allenamento personalizzato per [Nome]",
  "duration_weeks": numero_settimane_consigliato,
  "sessions_per_week": numero_sessioni_settimanali,
  "workout_days": [
    {
      "day": "Sessione 1, Sessione 2, etc.",
      "focus": "focus_principale (es: full body, upper/lower, push/pull)",
      "exercises": [
        {
          "name": "Nome esercizio",
          "muscle_group": "gruppo muscolare",
          "sets": numero_serie,
          "reps": "range_ripetizioni_o_tempo",
          "tempo": "tempo_esecuzione",
          "notes": "note_specifiche_e_variazioni"
        }
      ]
    }
  ],
  "notes": "Note generali sul programma, precauzioni e consigli"
}

Genera ora il programma di allenamento completo.`;
}

async function callProvider(prompt, data) {
    const provider = process.env.PROVIDER || 'mock';
    
    try {
        // Provider OpenAI
        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices?.[0]?.message?.content;
        }
        
        // Provider HuggingFace
        if (provider === 'huggingface') {
            const response = await fetch(`https://api-inference.huggingface.co/models/${process.env.HF_MODEL || 'microsoft/DialoGPT-medium'}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    options: { wait_for_model: true }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HuggingFace API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data[0]?.generated_text || JSON.stringify(data);
        }
        
        } catch (error) {
            console.warn('Usando mock response a causa di errore:', error.message);

            // Mock response per testing - usa il parametro `data` invece di `req`
            const selectedDays = Array.isArray(data?.days) ? data.days : ['luned\u00ec', 'mercoled\u00ec', 'venerd\u00ec'];
            const numExercises = data?.numExercises || 6;
            const name = data?.name || 'Utente';
            const level = data?.level || 'intermedio';
            const weight = data?.weight;

            return JSON.stringify({
                "title": `Programma personalizzato per ${name}`,
                "duration_weeks": 8,
                "sessions_per_week": selectedDays.length,
                "workout_days": selectedDays.map(day => ({
                    "day": day,
                    "focus": selectedDays.length <= 3 ? "Full Body" : 
                           (day === 'luned\u00ec' || day === 'gioved\u00ec') ? "Upper Body" :
                           (day === 'marted\u00ec' || day === 'venerd\u00ec') ? "Lower Body" : "Full Body",
                    "exercises": [
                        {
                            "name": "Riscaldamento Cardio",
                            "muscle_group": "cardiovascolare",
                            "sets": 1,
                            "reps": "10 minuti",
                            "tempo": "moderato",
                            "notes": "Camminata veloce o cyclette leggera per preparare il corpo"
                        },
                        {
                            "name": "Squat a corpo libero",
                            "muscle_group": "gambe",
                            "sets": 3,
                            "reps": "12-15",
                            "tempo": "2-0-1",
                            "notes": "Mantieni la schiena dritta, scendi fino a 90\u00b0. Se hai problemi alle ginocchia, limita il range di movimento."
                        },
                        {
                            "name": "Push-up modificati",
                            "muscle_group": "petto",
                            "sets": 3,
                            "reps": "8-12",
                            "tempo": "2-0-1",
                            "notes": "Inizia sulle ginocchia se troppo difficile, progressa gradualmente verso la versione completa"
                        },
                        {
                            "name": "Plank",
                            "muscle_group": "core",
                            "sets": 3,
                            "reps": "20-45 sec",
                            "tempo": "isometrico",
                            "notes": "Mantieni il corpo allineato, respira normalmente. Inizia con 20 secondi e aumenta gradualmente"
                        },
                        {
                            "name": "Affondi alternati",
                            "muscle_group": "gambe",
                            "sets": 3,
                            "reps": "10 per gamba",
                            "tempo": "2-0-1",
                            "notes": "Controlla l'equilibrio, usa un supporto se necessario"
                        },
                        {
                            "name": "Stretching finale",
                            "muscle_group": "flessibilit\u00e0",
                            "sets": 1,
                            "reps": "5 minuti",
                            "tempo": "lento",
                            "notes": "Concentrati sui muscoli lavorati"
                        }
                    ].slice(0, numExercises)
                })),
                "notes": `Programma adattato per livello ${level}. ${weight ? `Peso: ${weight}kg. ` : ''}Inizia gradualmente e aumenta l'intensit\u00e0 nel tempo.`
            });
        }
}

// Endpoint principale per generare schede
app.post('/api/generate-plan', async (req, res) => {
    try {
        console.log('Ricevuta richiesta per generazione scheda:', req.body);
        
    const prompt = buildPrompt(req.body);
    const text = await callProvider(prompt, req.body);
        
        // Prova a estrarre JSON dalla risposta
        let plan;
        try {
            // Se il testo è già JSON
            plan = JSON.parse(text);
        } catch (parseError) {
            // Cerca pattern JSON nel testo
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                plan = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Impossibile estrarre JSON dalla risposta');
            }
        }
        
        console.log('Scheda generata con successo');
        res.json(plan);
        
    } catch (error) {
        console.error('Errore nella generazione scheda:', error);
        res.status(500).json({
            error: 'Errore nella generazione della scheda',
            message: error.message
        });
    }
});

// Endpoint di health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        provider: process.env.PROVIDER || 'mock',
        timestamp: new Date().toISOString()
    });
});

// Servi l'index.html come fallback
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index (1).html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
    console.log(`🤖 Provider AI: ${process.env.PROVIDER || 'mock'}`);
    console.log(`📁 Servendo file da: ${__dirname}`);
});