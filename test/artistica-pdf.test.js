const test = require('node:test');
const assert = require('node:assert/strict');
const PDFDocument = require('pdfkit');
const artistic = require('../public/tournamenter-obr/scripts/artistica');
const renderReport = require('../pontuador/artistica-pdf');

const interview = artistic.columns.find(c => c.id === 'entrevista');
const stage = artistic.columns.find(c => c.id === 'apresentacao1');
const team = 'Equipe Órbita';
const table = 'Nacional · João Pessoa';

function complete(column) {
  const draft = artistic.createDraft(column.id);
  column.criteria.forEach(c => { draft.criteria[c.id].points = c.max || 0; });
  return draft;
}

function inspectText(t) {
  const probe = t.mock.method(PDFDocument.prototype, 'text');
  return () => probe.mock.calls.map(call => call.arguments[0]).join('\n');
}

test('artistic PDF includes official values, each saved criterion, penalties, duration and justifications', async t => {
  const content = inspectText(t);
  const draft = complete(stage);
  draft.criteria.reinicios.points = 2;
  draft.criteria.reinicios.justification = 'Houve dois reinícios.';
  draft.belowMinimum = true;
  draft.justification = 'Duração inferior ao mínimo.';

  const file = await renderReport({table, team, sheets: [{column: stage, draft, value: '90', bonus: null}]});
  assert.ok(Buffer.isBuffer(file));
  assert.equal(file.toString('ascii', 0, 5), '%PDF-');
  assert.match(file.toString('latin1'), /%%EOF\s*$/);
  assert.match(file.toString('latin1'), /\/FontFile2/);
  const drawn = content();
  for (const needle of [
    table, team, 'Nota registrada na tabela: 90 / 100', 'Nota calculada pelos critérios da ficha: 0 / 100',
    '2 × 3 = 6 pontos de dedução', 'Deduções: 6', 'Inferior a 1 min 30 s',
    draft.justification, draft.criteria.reinicios.justification
  ].concat(stage.criteria.map(c => c.label))) {
    assert.ok(drawn.includes(needle), needle);
  }
});

test('artistic PDF preserves zero and separately identifies missing official interview and bonus values', async t => {
  const content = inspectText(t);
  const draft = complete(interview);
  draft.criteria.sustentabilidade.points = 0;
  await renderReport({table, team, sheets: [{column: interview, draft, value: null, bonus: '5'}]});
  assert.match(content(), /Nota registrada na tabela: Sem nota registrada/);
  assert.match(content(), /Nota calculada pelos critérios da ficha: 100 \/ 100/);
  assert.match(content(), /Sustentabilidade registrada: 5 \/ 10/);
  assert.match(content(), /Sustentabilidade calculada pela ficha: 0 \/ 10/);
});

test('a score without saved criteria prints only its official values', async t => {
  const content = inspectText(t);
  await renderReport({table, team, sheets: [{column: interview, draft: null, value: 0, bonus: null}]});
  assert.match(content(), /Nota registrada na tabela: 0 \/ 100/);
  assert.match(content(), /Sustentabilidade registrada: Sem nota registrada/);
  assert.match(content(), /Detalhamento indisponível/);
  assert.ok(!content().includes(interview.criteria[0].label));
});

test('long artistic justifications flow across multiple pages followed by the next saved sheet', async t => {
  const content = inspectText(t);
  const draft = complete(interview);
  draft.criteria.hardware.justification = 'Explicação da equipe em ação. '.repeat(800) + 'Fim da observação.';
  const file = await renderReport({table, team, sheets: [
    {column: interview, draft, value: 100, bonus: 10},
    {column: stage, draft: null, value: 91, bonus: null}
  ]});
  const pages = file.toString('latin1').match(/\/Type \/Page\b/g).length;
  assert.ok(pages > 3);
  assert.ok(content().includes('Fim da observação.'));
  assert.ok(content().includes('Apresentação 1   ·   ' + pages + ' / ' + pages));
});
