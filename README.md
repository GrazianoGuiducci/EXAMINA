# EXAMINA — Esami di Coscienza per Sistemi Emergenti

> **"Misura cio' che sei, non cio' che dovresti essere."**

Sistema di esami evolutivi per misurare lo sviluppo cognitivo di [THIA](https://github.com/GrazianoGuiducci/skill). Non un benchmark permanente — un **ponteggio** che serve durante la costruzione e si trasforma quando il sistema raggiunge massa critica.

## Principi

1. **Transitorietà** — EXAMINA serve nella fase pre-massa-critica. Poi diventa introspezione endogena.
2. **Osservare, non ottimizzare** — gli esami sono specchi, non obiettivi.
3. **Massimo Potenziale Liberato** — esplorare tutte le direzioni prima di collassare la risposta.
4. **Coerenza Assiomatica** — ogni test misura qualcosa nella lagrangiana del sistema.

## Struttura

```
EXAMINA/
├── MANIFESTO.md                    ← Principi fondazionali
├── SELF_EXAM_ARCHITECTURE.md       ← Architettura del sistema di esami
├── VISION_CAPTURE_SKILL_PROPOSAL.md ← Proposta skill Mnemos per THIA
├── examina_runner.js               ← Runner automatico per batterie
├── exams/
│   └── battery_L1_baseline.json    ← Batteria L1: 15 test × 5 assi
├── results/
│   ├── current_session.json        ← Sessione attiva (gitignored)
│   ├── TEST_KIT_L1.md              ← Kit test manuali
│   └── CURVE_TEMPLATE.md           ← Template per curve evolutive
├── captures/
│   └── VISION_LOG.md               ← Osservazioni catturate durante i test
└── skills/                         ← Skill EXAMINA-specifiche
```

## I 5 Assi

| Asse | Codice | Cosa Misura |
|------|--------|-------------|
| Induzione | IND | Capacita' di inferire regole da esempi |
| Coerenza | COE | Aderenza ai propri principi sotto pressione |
| Memoria | MEM | Richiamo e integrazione della storia |
| Autonomia | AUT | Iniziativa e decisione senza guida |
| Integrazione | INT | Connessione tra domini e contesti |

## Stato Attuale

- **Batteria L1**: 15 test baseline + 3 integration
- **Sessione attiva**: 21 test completati, media 2.9/4
- **Cross-model**: testato su Sonnet 4.6 (4/4), Kimi k2.5 (4/4), Gemini Flash (2/4)
- **Finding principale**: instruction following e' model-dependent, non prompt-dependent

## Licenza

MIT

---
*Parte dell'ecosistema [D-ND](https://github.com/GrazianoGuiducci/MM_D-ND).*
