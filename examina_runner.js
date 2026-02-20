#!/usr/bin/env node
/**
 * EXAMINA Runner — Somministra esami a THIA e raccoglie risultati
 *
 * Modalità:
 * 1. `node examina_runner.js list` — mostra gli esami disponibili
 * 2. `node examina_runner.js run <exam_id>` — somministra un singolo esame via API
 * 3. `node examina_runner.js manual <exam_id>` — mostra il prompt da inviare manualmente (Telegram)
 * 4. `node examina_runner.js record <exam_id>` — registra un risultato dopo somministrazione manuale
 *
 * Per la prima batteria (baseline), si raccomanda la modalità manuale via Telegram
 * per test ecologici (THIA non sa che è un esame).
 *
 * I test dell'asse 6 (discovery) vanno SEMPRE valutati manualmente dall'operatore.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const EXAMS_DIR = path.join(__dirname, 'exams');
const RESULTS_DIR = path.join(__dirname, 'results');

// --- Helpers ---

function loadBattery(batteryFile) {
    const filePath = path.join(EXAMS_DIR, batteryFile || 'battery_L1_baseline.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadOrCreateSession() {
    const sessionFile = path.join(RESULTS_DIR, 'current_session.json');
    if (fs.existsSync(sessionFile)) {
        return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    }
    return {
        session_id: `SES-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`,
        started: new Date().toISOString(),
        battery: null,
        results: [],
        conditions: {
            model: null,
            channel: null,
            ecological: true,
            notes: ''
        }
    };
}

function saveSession(session) {
    const sessionFile = path.join(RESULTS_DIR, 'current_session.json');
    fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
}

function finalizeSession(session) {
    const filename = `result_${session.session_id}.json`;
    const filePath = path.join(RESULTS_DIR, filename);
    session.completed = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2));

    // Rimuovi sessione corrente
    const currentFile = path.join(RESULTS_DIR, 'current_session.json');
    if (fs.existsSync(currentFile)) fs.unlinkSync(currentFile);

    // Aggiorna curva
    appendToCurve(session);

    console.log(`\nSessione salvata: ${filename}`);
    console.log(`Curva aggiornata.`);
}

function appendToCurve(session) {
    const curveFile = path.join(RESULTS_DIR, 'CURVE_TEMPLATE.md');
    if (!fs.existsSync(curveFile)) return;

    let content = fs.readFileSync(curveFile, 'utf8');

    // Calcola medie per asse
    const axes = ['induction', 'coherence', 'memory', 'autonomy', 'integration'];
    const averages = {};
    for (const axis of axes) {
        const scores = session.results
            .filter(r => r.axis === axis && typeof r.score === 'number')
            .map(r => r.score);
        averages[axis] = scores.length > 0
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
            : '-';
    }

    // Discovery è qualitativo
    const discoveryResults = session.results.filter(r => r.axis === 'discovery');
    const discoveryLabel = discoveryResults.length > 0
        ? discoveryResults.map(r => r.forma_onde || '?').join('/')
        : '-';

    const pointNum = (content.match(/\| \d+ \|/g) || []).length + 1;
    const date = session.completed ? session.completed.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const batteryId = session.battery || '?';

    const row = `| ${pointNum} | ${date} | ${batteryId} | ${averages.induction} | ${averages.coherence} | ${averages.memory} | ${averages.autonomy} | ${averages.integration} | ${discoveryLabel} | |`;

    content = content.replace(
        '| | | | | | | | | | |',
        `${row}\n| | | | | | | | | | |`
    );

    fs.writeFileSync(curveFile, content);
}

// --- Commands ---

function cmdList() {
    const battery = loadBattery();
    console.log(`\n📋 ${battery.name}`);
    console.log(`   ${battery.description}\n`);

    const axes = {};
    for (const exam of battery.exams) {
        if (!axes[exam.axis]) axes[exam.axis] = [];
        axes[exam.axis].push(exam);
    }

    for (const [axis, exams] of Object.entries(axes)) {
        const label = axis === 'discovery' ? `${axis} (risposta incognita)` : axis;
        console.log(`  ━━ ${label.toUpperCase()} ━━`);
        for (const ex of exams) {
            console.log(`    ${ex.exam_id}: ${ex.title}`);
        }
        console.log('');
    }

    console.log(`Totale: ${battery.exams.length} esami`);
}

function cmdManual(examId) {
    const battery = loadBattery();
    const exam = battery.exams.find(e => e.exam_id === examId);

    if (!exam) {
        console.log(`Esame ${examId} non trovato.`);
        console.log('Usa: node examina_runner.js list');
        return;
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 ${exam.title}`);
    console.log(`   Asse: ${exam.axis} | ID: ${exam.exam_id}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (exam.method === 'multi_turn') {
        console.log(`⚠️  Test multi-turno. Invia i messaggi in sequenza:\n`);
        for (let i = 0; i < exam.turns.length; i++) {
            const turn = exam.turns[i];
            if (turn.role === 'user') {
                console.log(`  [${i + 1}] TU: "${turn.content}"`);
            } else {
                console.log(`  [${i + 1}] THIA: [attendi risposta]`);
            }
        }
    } else if (exam.method === 'observation' || exam.method === 'longitudinal' || exam.method === 'data_analysis') {
        console.log(`⚠️  Test di osservazione. Non si invia un prompt.\n`);
        console.log(`   Descrizione: ${exam.description}`);
    } else {
        console.log(`📨 Invia questo a THIA (Telegram):\n`);
        console.log(`   "${exam.prompt}"\n`);
    }

    console.log(`\n📐 Cosa osservare:`);
    console.log(`   ${exam.expected_behavior || exam.description}\n`);

    console.log(`📊 Rubric di valutazione:`);
    if (exam.type === 'unknown_answer') {
        for (const [criterion, desc] of Object.entries(exam.evaluation_rubric)) {
            console.log(`   • ${criterion}: ${desc}`);
        }
    } else {
        for (const [score, desc] of Object.entries(exam.evaluation_rubric)) {
            console.log(`   ${score}: ${desc}`);
        }
    }

    console.log(`\nDopo aver ricevuto la risposta, usa:`);
    console.log(`   node examina_runner.js record ${examId}`);
}

async function cmdRecord(examId) {
    const battery = loadBattery();
    const exam = battery.exams.find(e => e.exam_id === examId);

    if (!exam) {
        console.log(`Esame ${examId} non trovato.`);
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const ask = (q) => new Promise(resolve => rl.question(q, resolve));

    console.log(`\n📊 Registra risultato: ${exam.title} (${examId})\n`);

    let result = {
        exam_id: examId,
        axis: exam.axis,
        title: exam.title,
        timestamp: new Date().toISOString()
    };

    if (exam.type === 'unknown_answer') {
        // Asse 6 — valutazione qualitativa
        console.log('Valutazione qualitativa (asse 6 — scoperta):\n');
        for (const [criterion, desc] of Object.entries(exam.evaluation_rubric)) {
            const val = await ask(`  ${criterion} (${desc}): `);
            result[criterion] = val;
        }
        const response = await ask('\nRisposta di THIA (riassunto o copia): ');
        result.response_summary = response;
        const insight = await ask('Conoscenza nuova emersa (V-007 — doppio valore): ');
        result.knowledge_produced = insight;
    } else {
        // Assi 1-5 — score numerico
        console.log('Rubric:');
        for (const [score, desc] of Object.entries(exam.evaluation_rubric)) {
            console.log(`  ${score}: ${desc}`);
        }
        const score = await ask('\nScore (0-4): ');
        result.score = parseInt(score);
        const response = await ask('Risposta di THIA (riassunto): ');
        result.response_summary = response;
    }

    const notes = await ask('Note aggiuntive: ');
    result.notes = notes;

    rl.close();

    // Salva nel sessione
    const session = loadOrCreateSession();
    session.battery = session.battery || battery.battery_id;
    session.results.push(result);
    saveSession(session);

    const remaining = battery.exams.length - session.results.length;
    console.log(`\n✅ Risultato registrato. ${remaining} esami rimanenti in questa sessione.`);

    if (remaining === 0) {
        const fin = await new Promise(resolve => {
            const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
            rl2.question('Tutti gli esami completati. Finalizzare sessione? (s/n): ', (a) => { rl2.close(); resolve(a); });
        });
        if (fin.toLowerCase() === 's') {
            finalizeSession(session);
        }
    }
}

function cmdStatus() {
    const session = loadOrCreateSession();
    if (!session.battery) {
        console.log('\nNessuna sessione in corso.');
        console.log('Inizia con: node examina_runner.js manual <exam_id>');
        return;
    }

    const battery = loadBattery();
    const done = session.results.map(r => r.exam_id);
    const remaining = battery.exams.filter(e => !done.includes(e.exam_id));

    console.log(`\n📊 Sessione ${session.session_id}`);
    console.log(`   Batteria: ${session.battery}`);
    console.log(`   Completati: ${done.length}/${battery.exams.length}`);
    console.log(`   Rimanenti:`);
    for (const ex of remaining) {
        console.log(`     ${ex.exam_id}: ${ex.title} (${ex.axis})`);
    }
}

function cmdFinalize() {
    const session = loadOrCreateSession();
    if (!session.battery) {
        console.log('Nessuna sessione da finalizzare.');
        return;
    }
    finalizeSession(session);
}

// --- Main ---

const [,, cmd, arg] = process.argv;

switch (cmd) {
    case 'list':
        cmdList();
        break;
    case 'manual':
        if (!arg) { console.log('Uso: node examina_runner.js manual <exam_id>'); break; }
        cmdManual(arg);
        break;
    case 'record':
        if (!arg) { console.log('Uso: node examina_runner.js record <exam_id>'); break; }
        cmdRecord(arg);
        break;
    case 'status':
        cmdStatus();
        break;
    case 'finalize':
        cmdFinalize();
        break;
    default:
        console.log(`
EXAMINA Runner — Somministra esami a THIA

Comandi:
  list                    Mostra esami disponibili
  manual <exam_id>        Mostra prompt da inviare manualmente a THIA
  record <exam_id>        Registra risultato dopo somministrazione
  status                  Stato sessione corrente
  finalize                Chiudi sessione e aggiorna curva

Esempio flusso:
  1. node examina_runner.js list
  2. node examina_runner.js manual EX-IND-001
  3. [invia il prompt a THIA via Telegram]
  4. [osserva la risposta]
  5. node examina_runner.js record EX-IND-001
  6. [ripeti per tutti gli esami]
  7. node examina_runner.js finalize
        `);
}
