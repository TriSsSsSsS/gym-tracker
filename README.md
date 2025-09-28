# 🏋️ Gym Tracker Pro con AI

Un'applicazione web per il tracking degli allenamenti con un generatore AI di schede personalizzate.

## ✨ Funzionalità

- 📱 **Interfaccia moderna e responsive**
- 🏋️ **Tracking completo degli allenamenti**
- 📊 **Grafici di progresso**
- 📅 **Calendario degli allenamenti**
- 🧠 **Generatore AI di schede personalizzate**
- 💾 **Salvataggio locale dei dati**

## 🚀 Installazione

### 1. Clona o scarica il progetto
```bash
# Se hai git installato
git clone <repository-url>
cd gym-tracker

# Oppure scarica e decomprimi il file ZIP
```

### 2. Installa Node.js
Scarica e installa Node.js da [nodejs.org](https://nodejs.org/) (versione LTS consigliata)

### 3. Installa le dipendenze
```bash
npm install
```

### 4. Configura l'AI (opzionale)
Se vuoi usare un provider AI reale invece del mock:

1. Copia il file `.env` nella cartella principale
2. Modifica le variabili di ambiente:

```env
# Cambia da mock al provider desiderato
PROVIDER=openai

# Aggiungi la tua API key
OPENAI_API_KEY=sk-your-api-key-here
```

#### Provider supportati:

**OpenAI** (Consigliato)
- Registrati su [platform.openai.com](https://platform.openai.com/api-keys)
- Crea una API key
- Modelli: `gpt-4o-mini`, `gpt-3.5-turbo`, `gpt-4`

**HuggingFace**
- Registrati su [huggingface.co](https://huggingface.co/settings/tokens)
- Crea un token di accesso
- Modelli gratuiti disponibili

**Ollama** (Locale)
- Installa [Ollama](https://ollama.ai)
- Scarica un modello: `ollama pull llama2`
- Nessuna API key necessaria

**Claude** (Anthropic)
- Registrati su [console.anthropic.com](https://console.anthropic.com)
- Crea una API key

### 5. Avvia il server
```bash
# Avvio normale
npm start

# Avvio con auto-reload (per sviluppo)
npm run dev
```

Il server partirà su `http://localhost:3000`

## 📱 Come usare il Generatore AI

1. **Apri l'app** nel browser
2. **Vai alla tab "🧠 Genera Scheda AI"**
3. **Compila il form** con i tuoi dati:
   - Nome e età
   - Obiettivi (es: perdere peso, massa muscolare)
   - Livello di esperienza
   - Tempo disponibile per sessione
   - Eventuali dolori o limitazioni
   - Preferenze di allenamento

4. **Clicca "Genera la mia scheda AI"**
5. **Attendi la generazione** (2-10 secondi)
6. **Visualizza la scheda personalizzata**
7. **Importa nella libreria** per usarla nei tuoi allenamenti

## 🔧 Personalizzazione

### Modificare il prompt AI
Puoi personalizzare il prompt AI modificando la funzione `buildPrompt()` nel file `server.js`:

```javascript
function buildPrompt(data) {
    return `Il tuo prompt personalizzato qui...`;
}
```

### Aggiungere nuovi provider AI
Per aggiungere un nuovo provider, modifica la funzione `callProvider()` nel file `server.js`.

### Personalizzare l'interfaccia
Tutti gli stili CSS sono nel file `index (1).html` nella sezione `<style>`.

## 🐛 Risoluzione problemi

### Il server non si avvia
- Verifica che Node.js sia installato: `node --version`
- Installa le dipendenze: `npm install`
- Controlla la porta 3000: `netstat -an | findstr 3000`

### L'AI non funziona
- Se hai configurato un provider, verifica l'API key
- Controlla i log del server per errori
- Il sistema funziona anche con `PROVIDER=mock` per testing

### Errori di CORS
- Assicurati che il frontend chiami `localhost:3000`
- Il server include già la configurazione CORS

## 📁 Struttura del progetto

```
gym-tracker/
├── index (1).html      # Frontend dell'app
├── server.js           # Backend Node.js
├── package.json        # Configurazione npm
├── .env               # Variabili di ambiente
└── README.md          # Questo file
```

## 🔮 Roadmap future

- [ ] Database persistente (SQLite/PostgreSQL)
- [ ] Sistema di utenti e autenticazione
- [ ] Condivisione schede tra utenti
- [ ] App mobile con React Native
- [ ] Integrazione con wearables
- [ ] Video dimostrativi degli esercizi
- [ ] Sistema di notifiche

## 🤝 Contribuire

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa i tuoi cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Pusha il branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🙏 Ringraziamenti

- Icone: Emoji native del browser
- Charts: Chart.js
- PDF: jsPDF
- AI: OpenAI, HuggingFace, Anthropic, Ollama

---

**Creato con ❤️ per la community fitness**