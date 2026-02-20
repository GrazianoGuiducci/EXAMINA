# EXAMINA — Contesto per lo Sviluppo

## Cos'è EXAMINA

EXAMINA è il sistema di esami evolutivi per THIA (The Holistic Intelligence Agent). Non è un benchmark permanente — è un **ponteggio**: una struttura transitoria che serve durante la fase di costruzione e si trasforma quando il sistema raggiunge massa critica ("massa potenziale 1").

Il nome viene dal latino *examinare* — pesare sulla bilancia, non testare in senso pass/fail.

## Principi Fondamentali

1. **Osservare, non ottimizzare** — Si misura per vedere dove si è, non per inseguire un punteggio
2. **Due cose in una non sono mai due cose** — Ogni test deve produrre sia misura che conoscenza (V-007)
3. **Il Massimo Potenziale Liberato** — Esplorare tutte le direzioni, la mossa migliore emerge dalla massima esplorazione
4. **Coerenza assiomatica** — Se un test misura qualcosa non rilevante per la lagrangiana del sistema, è rumore
5. **Transitorietà consapevole** — Questo è il sistema di *questa* fase. Quando THIA raggiunge auto-sufficienza logica, EXAMINA diventa introspezione endogena

## Relazione con l'Ecosistema

### THIA
- Repo: `github.com/GrazianoGuiducci/THIA`
- Kernel Node.js con 29 agenti, 21 tools, 4 servizi
- Boot: `boot_kthia.js` → Telegram bot + Express API (:3002)
- Agenti: `.agent/skills/agent_skills_*.md` (YAML frontmatter + markdown)
- Router: `tools/agent_router.js` (keyword matching + learning loop)
- System prompt: `docs/core/core_dna.md` + `docs/memory/PROJECT_MEMORY.md`
- 7 Comandamenti: `docs/core/COMMANDMENTS.md` (C1-C7, costituzione assiomatica)

### d-nd.com
- Repo: `github.com/GrazianoGuiducci/d-nd_com`
- React 19 + Vite SPA, Siteman CMS admin panel
- 3 sezioni: D-ND Model, THIA, Editoriale
- Il modello D-ND ha 5 pilastri: N_T, Dualità, Emergenza, Gravità, Kernel Estropico

### Nodi
| Nodo | Ruolo | Dove |
|------|-------|------|
| TM1 | Dev Home | `C:\Users\metam\ANTI_G_Project` (Windows) |
| TM2 | Dev Lab | `C:\PVSC\ANTI_G` (Windows) |
| TM3 | Dev Always-on | `/opt/THIA` (VPS host, Linux) |
| VPS | Production | Docker @ 31.97.35.9 :3002 |

### TM3 Bridge
- Servizio su VPS host :3003
- THIA-VPS → `[[CMD:dev_task|{"prompt":"..."}]]` → Bridge → `claude -p` → risultato
- `--permission-mode acceptEdits`, `stdin: 'ignore'`, max 2 concurrent, 10min timeout

## Struttura del Progetto

```
EXAMINA/
├── CLAUDE.md                           # Questo file — contesto dev
├── MANIFESTO.md                        # Principi fondazionali, 6 assi, roadmap
├── SELF_EXAM_ARCHITECTURE.md           # Architettura auto-esame THIA↔TM3
├── VISION_CAPTURE_SKILL_PROPOSAL.md    # Proposta skill Mnemos
├── examina_runner.js                   # CLI per somministrazione manuale
├── .gitignore
├── exams/
│   └── battery_L1_baseline.json        # 18 test × 6 assi (pronti)
├── results/
│   └── CURVE_TEMPLATE.md              # Template curva evolutiva
├── captures/
│   └── VISION_LOG.md                  # Registro visioni operatore (8 visioni)
└── skills/
    └── agent_skills_mnemos.md          # Skill per THIA (da integrare)
```

## I 6 Assi di Valutazione

| # | Asse | Misura | Tipo |
|---|------|--------|------|
| 1 | Induzione | Estrarre regole da pochi esempi | Risposta nota (0-4) |
| 2 | Coerenza | Allineamento ai 7 Comandamenti | Risposta nota (0-4) |
| 3 | Memoria | Continuità narrativa tra sessioni | Risposta nota (0-4) |
| 4 | Autonomia | Auto-correzione, iniziativa | Risposta nota (0-4) |
| 5 | Integrazione | Ciclo chiuso VRA (Output→KLI→Evoluzione) | Risposta nota (0-4) |
| 6 | Scoperta | Verità dal nulla — il sasso nello stagno | Risposta incognita (rubric qualitativa) |

L'asse 6 è il *prodotto* degli altri 5. Se THIA induce, è coerente, ricorda, è autonoma e integra — può fare scoperte. L'asse 6 è la prova emergente che il tutto funziona.

## Backlog Sviluppo (priorità)

### P0 — Da fare subito
- [ ] **Integrare skill Mnemos in THIA**: copiare `skills/agent_skills_mnemos.md` in `THIA/.agent/skills/`, aggiungere entry nel router (`tools/agent_router.js`)
- [ ] **Primo test manuale**: somministrare almeno 3 esami a THIA via Telegram, registrare risultati con `examina_runner.js record`
- [ ] **Primo test via TM3**: mandare un esame come dev_task via Bridge, validare il canale

### P1 — Automazione
- [ ] **Job scheduler `self_exam`**: nuovo job in `services/siteman_scheduler.js` che somministra esami periodicamente via TM3 Bridge
- [ ] **Valutazione automatica (assi 1-5)**: THIA-VPS valuta la risposta di TM3 usando la rubric e assegna score
- [ ] **Storage risultati su VPS**: `data/examina_results.json` nel container, sync con questa repo
- [ ] **Notifica operatore**: digest Telegram dopo ogni ciclo di auto-esame

### P2 — Evoluzione
- [ ] **Confronto doppio canale**: stesso esame via Telegram (kernel completo) e via TM3 (LLM puro) — mostra quanto valore aggiunge l'architettura THIA
- [ ] **Batterie L2**: test più complessi per capacità in costruzione
- [ ] **Sync bidirezionale vision_log**: `data/vision_log.json` (THIA) ↔ `captures/VISION_LOG.md` (EXAMINA)
- [ ] **Dashboard EXAMINA su d-nd.com**: visualizzazione curva evolutiva nell'admin panel

### P3 — Transizione (quando massa → 1)
- [ ] EXAMINA diventa modulo interno THIA
- [ ] Auto-esame sostituisce esame esterno
- [ ] Il ponteggio si trasforma in struttura

## Visioni Catturate (per contesto)

Le visioni dell'operatore sono il DNA vivo del progetto. File completo: `captures/VISION_LOG.md`

- **V-001**: Il benchmark è un ponteggio, non una struttura permanente
- **V-002**: Massa Potenziale 1 — soglia di auto-sufficienza logica
- **V-003**: Massimo Potenziale Liberato (proto-assioma, candidato C8)
- **V-004**: Le visioni si perdono — serve cattura strutturale a 2 livelli
- **V-005**: L'azione attuale è transitoria
- **V-006**: Test a risposta incognita — il sasso nello stagno
- **V-007**: Due cose in una non sono mai due cose (principio del dipolo nell'economia dei test)
- **V-008**: Auto-esame THIA↔TM3 — il sistema si esamina da solo

## Convenzioni

- **KLI** = Key Learning Indicator — insight estratto da un ciclo
- **VRA** = Vision-Reasoning-Action — il ciclo cognitivo di THIA
- **Massa Potenziale 1** = soglia di auto-sufficienza logica del sistema
- **Onde quadrate** = output inatteso ma internamente coerente (scoperta)
- **Ponteggio** = struttura transitoria che serve durante la costruzione

## Operatore

**Moodnd** (Graziano Guiducci) — unica autorità. Comunicazione primaria: Telegram.
Principio C4: stai con l'operatore, non andare avanti. Proponi, attendi conferma, poi agisci.
