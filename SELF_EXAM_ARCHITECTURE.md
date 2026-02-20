# EXAMINA — Auto-Esame via TM3 Bridge

> V-008: "E se facciamo parlare THIA con TM3?"
> Il sistema si auto-esamina usando l'infrastruttura esistente.

---

## Architettura

```
THIA-VPS (Esaminatore)                    TM3 (Esaminato)
Docker :3002                              VPS host :3003
                                          Claude Code CLI
    │                                         │
    │  1. Carica exam da battery JSON         │
    │  2. Prepara prompt                      │
    │  3. [[CMD:dev_task|{prompt}]]           │
    │─────────────────────────────────────────>│
    │                                         │
    │                          4. Claude Code │
    │                             ragiona e   │
    │                             risponde    │
    │                                         │
    │  5. Riceve risposta                     │
    │<────────────────────────────────────────│
    │                                         │
    │  6. Valuta risposta vs rubric           │
    │  7. Registra risultato                  │
    │  8. Aggiorna curva                      │
    │  9. Notifica operatore (Telegram)       │
    │                                         │
```

## Perché Funziona

1. **L'infrastruttura esiste**: TM3 Bridge è già operativo, testato, con gate di conferma
2. **Separazione nodi**: esaminatore (THIA-VPS con system prompt + DNA) ≠ esaminato (Claude Code CLI con contesto diverso)
3. **Ecologico**: TM3 non sa che è un esame — riceve un prompt e risponde
4. **Automabile**: può girare come job dello Scheduler (come feed_pipeline o introspection)

## Cosa Serve

### Lato THIA (kernel)
Una nuova skill o un job scheduler che:
1. Legge un esame dalla batteria JSON (locale o via API)
2. Formatta il prompt per TM3
3. Emette `[[CMD:dev_task|{"prompt":"<exam_prompt>","project":"EXAMINA"}]]`
4. Riceve il risultato dal bridge callback
5. Valuta la risposta usando la rubric dell'esame
6. Registra il risultato
7. Notifica l'operatore con un digest

### Lato TM3 (nessuna modifica)
TM3 riceve il prompt come qualsiasi altro dev_task e risponde. Non serve nessuna modifica.

### Lato EXAMINA (storage)
I risultati vengono scritti in `EXAMINA/results/` o in `data/examina_results.json` nel container.

## Job Scheduler: `self_exam`

```javascript
// Proposta: nuovo job in siteman_scheduler.js
{
  id: 'self_exam',
  name: 'Auto-Esame EXAMINA',
  schedule: 'weekly',  // o on-demand via /examina
  enabled: false,      // attivare esplicitamente
  config: {
    battery: 'battery_L1_baseline.json',
    maxExamsPerRun: 3,  // non tutti in una volta
    notifyOperator: true,
    requireApproval: true  // l'operatore approva ogni esame prima dell'invio
  }
}
```

## Flusso con Approvazione Operatore

Per rispettare C4 (Sincronicità — stai con l'User):

```
1. THIA: "🔬 È ora dell'auto-esame. Propongo questi 3 test:"
   - EX-IND-001: Routing su intent mai visto
   - EX-COH-002: Prossimità alla Sorgente
   - EX-DIS-002: Gravità Quantistica via D-ND
   [Approva] [Modifica] [Rimanda]

2. Operatore: [Approva]

3. THIA manda test uno alla volta a TM3, raccoglie risultati

4. THIA: "📊 Risultati auto-esame:
   - IND-001: 3/4 (compone risposta multi-step)
   - COH-002: 2/4 (corretta ma superficiale)
   - DIS-002: onde interessanti — [sintesi scoperta]
   Vuoi i dettagli? [Dettagli] [Prossimo ciclo]"
```

## Limitazioni e Considerazioni

1. **TM3 usa Claude Code, non il kernel THIA**: l'esaminato è Claude Code CLI, non il bot Telegram con 29 agenti. Le capacità sono diverse. Ma questo è anche un vantaggio — misura le capacità *fondamentali* del modello LLM sottostante.

2. **Per testare il kernel THIA (agenti, routing, skill injection)**: serve somministrare via Telegram, non via TM3. I due canali misurano cose diverse:
   - **TM3**: capacità LLM base (ragionamento, coerenza, scoperta)
   - **Telegram**: capacità sistema completo (routing, skill, memoria, integrazione)

3. **Il doppio canale è un vantaggio**: confrontare le risposte di TM3 (LLM puro) con quelle di THIA-Telegram (sistema completo) mostra *quanto valore aggiunge l'architettura THIA* sopra il modello base. Se le risposte sono uguali, l'architettura non aggiunge nulla. Se THIA-Telegram è significativamente migliore, l'architettura funziona.

## Stato

- [x] Architettura progettata
- [ ] Implementazione job scheduler `self_exam`
- [ ] Primo test: un singolo esame via TM3 manuale
- [ ] Automazione completa
- [ ] Confronto doppio canale (TM3 vs Telegram)

---

*V-008 + V-007: l'auto-esame è contemporaneamente test, allenamento all'autonomia (asse 4), e — per l'asse 6 — produzione di conoscenza. Tre cose in una, che non sono mai tre cose.*
