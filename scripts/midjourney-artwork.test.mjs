// node scripts/midjourney-artwork.test.mjs
import assert from 'node:assert/strict';
import { estraiPrompt } from './midjourney-artwork.mjs';

const FIXTURE = `# PROMPT

**Il Notaio** (ricorrente) → \`artworks/Il Notaio.png\`
\`\`\`
un notaio elegante di notte --ar 3:4
\`\`\`

**Lazzaro** (salva come \`Lazzaro.png\`)
\`\`\`
un medico d'asilo --ar 3:4
\`\`\`

**Dorso** → \`artworks/Dorso <Nome>.png\`
\`\`\`
un dorso qualsiasi --ar 3:4
\`\`\`

**Insidie** — «Prima» → \`artworks/Prima.png\` · «Seconda» → \`artworks/Seconda.png\`
\`\`\`
prima insidia --ar 3:4
\`\`\`
\`\`\`
seconda insidia --ar 3:4
\`\`\`

Un prompt senza nessun nome di file vicino:
\`\`\`
prompt orfano --ar 3:4
\`\`\`
`;

const { trovati, orfani } = estraiPrompt(FIXTURE);

assert.deepEqual(
  trovati.map((v) => v.nome),
  ['Il Notaio.png', 'Lazzaro.png', 'Prima.png', 'Seconda.png'],
  'freccia, "salva come", e intestazione con piu nomi zippata sui blocchi in ordine',
);
assert.equal(trovati[0].prompt, 'un notaio elegante di notte --ar 3:4');
assert.equal(trovati[3].prompt, 'seconda insidia --ar 3:4');
assert.equal(orfani.length, 2, 'modello <Nome> e prompt senza nome finiscono fra gli orfani');

console.log('ok');
