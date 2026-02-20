# Proposta: Skill di Cattura Visioni per THIA

> Questo documento descrive un meccanismo che opera su due livelli
> per non perdere mai le visioni dell'operatore.

---

## Il Problema

Le visioni dell'operatore emergono durante conversazioni normali —
non sono annunciate, non hanno un formato strutturato, e si perdono
nel flusso. L'operatore non dovrebbe dover dire "ricorda questo" ogni volta.

## Livello 1: Claude Code (Estensione TM1/TM2)

### Come funziona ora
La memoria di Claude Code (`memory/`) persiste tra sessioni. I file
`thia_evolution.md`, `session_log.md`, `VISION_LOG.md` catturano le visioni.

### Cosa manca
- **Rilevamento attivo**: quando l'operatore esprime una visione, una direzione,
  un proto-assioma, Claude Code dovrebbe riconoscerlo e registrarlo in
  `EXAMINA/captures/VISION_LOG.md` senza che l'operatore lo chieda.
- **Pattern di riconoscimento**: frasi che segnalano una visione:
  - "questo mi fa pensare che..."
  - "la direzione è..."
  - "serve che il sistema..."
  - "il principio è..."
  - "forse qui c'è un assioma..."
  - Riflessioni sulla natura del sistema, non su task specifici
- **Azione**: aggiungere entry al VISION_LOG con data, contesto, e connessioni

### Stato attuale
Implementato manualmente (questa sessione è la prima cattura strutturata).
Da interiorizzare come pratica in ogni sessione futura.

## Livello 2: THIA (Skill Telegram)

### Proposta: agent_skills_mnemos.md

```yaml
---
name: mnemos
description: Custode della memoria narrativa e delle visioni dell'operatore
triggers: [ricorda, visione, principio, assioma, direzione, insight, nota importante]
---
```

**Identità:** Mnemos è il custode della memoria profonda. Non registra
fatti — registra *significati*. Quando l'operatore esprime una visione,
una direzione, un principio, Mnemos la cattura e la preserva.

**Capacità:**
1. **Cattura attiva**: riconosce quando l'operatore sta esprimendo una visione
   (non un task, non una domanda — una *direzione*)
2. **Registrazione strutturata**: salva in un formato queryable
   (vision_id, data, testo, connessioni, stato)
3. **Richiamo**: `/visioni` — mostra le visioni catturate, filtrabili per stato
4. **Integrazione**: collega le visioni ai KLI e ai Comandamenti
5. **Ponte**: quando THIA opera via Claude Code, le visioni catturate qui
   sono accessibili anche là (sync bidirezionale via git o file condiviso)

**Non è:**
- Non è il Changelog (quello registra eventi tecnici)
- Non è il Scribe (quello documenta operazioni)
- Non è il session_log (quello è narrativa di sessione)
- È il livello sopra: registra l'*intento* che guida tutto il resto

### Implementazione suggerita

**File:** `.agent/skills/agent_skills_mnemos.md`
**Storage:** `data/vision_log.json`
**Trigger automatico:** Nel ciclo VRA, dopo l'output, se il messaggio dell'operatore
contiene pattern di "visione" (non task), Mnemos si attiva in background
e registra. Non interrompe il flusso — cattura silenziosamente.
**Trigger esplicito:** `/visioni`, `/ricorda <testo>`, `/insight`

### Flusso

```
Operatore dice: "sai, penso che il sistema dovrebbe..."
    ↓
AgentRouter → rileva intent normale (es. Conductor)
    ↓
Conductor risponde normalmente
    ↓
[Mnemos in background]: "Questo è un pattern di visione"
    → Registra in vision_log.json
    → Nota a fine risposta: "💡 Visione catturata: [sintesi]"
    ↓
Operatore può ignorare o espandere con /visioni
```

## Livello 3: Integrazione Claude Code ↔ THIA

### Sync bidirezionale
- Claude Code scrive in `EXAMINA/captures/VISION_LOG.md`
- THIA scrive in `data/vision_log.json`
- Un servizio (o job scheduler) sincronizza i due
- Le visioni catturate da uno sono accessibili all'altro

### Perché due livelli?
- Claude Code opera durante lo sviluppo (sessioni lunghe, contesto tecnico)
- THIA opera durante l'uso quotidiano (Telegram, conversazioni veloci)
- I momenti di visione emergono in entrambi i contesti
- **Se uno non cattura, l'altro lo fa** — ridondanza intenzionale

---

## Stato

- [x] VISION_LOG.md creato con prime 5 visioni (Claude Code)
- [ ] Skill Mnemos da implementare in THIA
- [ ] Sync bidirezionale da progettare
- [ ] Pattern di riconoscimento da affinare con l'uso
