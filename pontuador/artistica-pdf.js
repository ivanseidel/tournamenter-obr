const path = require('path');
const artistic = require('../public/tournamenter-obr/scripts/artistica');

const fonts = path.join(__dirname, '../public/tournamenter-obr/styles/fonts/DejaVu');
const ink = '#1f2e3d';
const muted = '#4d6070';
const accent = '#104c65';
const margin = 48;

function hasScore(value) {
  return value !== null && value !== undefined && value !== '';
}

function officialScore(value, maximum) {
  if (!hasScore(value)) return 'Sem nota registrada';
  return String(value) + ' / ' + maximum;
}

function criterionScore(criterion, points) {
  if (criterion.kind === 'deduction') return points + ' pontos de dedução';
  if (criterion.kind === 'occurrences') {
    return points + ' × 3 = ' + (points * 3) + ' pontos de dedução';
  }
  return points + ' / ' + criterion.max + (criterion.kind === 'bonus' ? ' pontos extras' : ' pontos');
}

function text(doc, value, size, bold, color) {
  doc.font(bold ? 'Bold' : 'Regular').fontSize(size).fillColor(color || ink)
    .text(value, {lineGap: 1.5});
}

function spaceFor(doc, height) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

function writeSheet(doc, table, team, sheet) {
  const {column, draft, value, bonus} = sheet;
  text(doc, column.label, 24, true, accent);
  doc.moveDown(0.18);
  text(doc, 'Equipe: ' + team, 12, true);
  text(doc, 'Tabela: ' + table, 10, false, muted);
  doc.moveDown(0.65);
  text(doc, 'Nota registrada na tabela: ' + officialScore(value, column.max), 13, true);
  if (column.bonusIndex !== undefined) {
    text(doc, 'Sustentabilidade registrada: ' + officialScore(bonus, 10), 11, false);
  }

  if (!draft) {
    doc.moveDown(0.7);
    text(doc, 'Detalhamento indisponível para este lançamento. A tabela não contém uma ficha completa com os critérios e as justificativas.', 10, false, muted);
    return;
  }

  const calculation = artistic.evaluate(column.id, draft);
  if (!hasScore(value) || Number(value) !== calculation.total) {
    text(doc, 'Nota calculada pelos critérios da ficha: ' + calculation.total + ' / ' + column.max, 11, true, accent);
  }
  if (column.bonusIndex !== undefined && (!hasScore(bonus) || Number(bonus) !== calculation.bonus)) {
    text(doc, 'Sustentabilidade calculada pela ficha: ' + calculation.bonus + ' / 10', 11, true, accent);
  }
  if (column.stage || column.bonusIndex !== undefined) {
    text(doc, 'Subtotal dos critérios: ' + calculation.subtotal + '   ·   Deduções: ' + calculation.deduction, 10, false, muted);
  }
  if (column.stage) {
    const duration = draft.belowMinimum ? 'Inferior a 1 min 30 s. A ficha recebe nota zero.' : 'Mínimo de 1 min 30 s atingido.';
    text(doc, 'Duração da apresentação: ' + duration, 10, false, muted);
  }

  doc.moveDown(0.65);
  column.criteria.forEach((criterion) => {
    const entry = draft.criteria[criterion.id];
    spaceFor(doc, 48);
    text(doc, criterion.label + '  ·  ' + criterionScore(criterion, entry.points), 10.5, true);
    const note = entry.justification.trim() ? entry.justification : 'Não informada.';
    text(doc, 'Justificativa: ' + note, 10, false, muted);
    doc.moveDown(0.54);
  });

  spaceFor(doc, 37);
  text(doc, 'Justificativa geral', 10.5, true);
  text(doc, draft.justification.trim() ? draft.justification : 'Não informada.', 10, false, muted);
}

function renderReport({table, team, sheets}) {
  return new Promise((resolve, reject) => {
    if (!sheets.length) throw new Error('Nenhuma avaliação para exportar.');
    // The scoring server loads the PDF engine only when a report is requested.
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({
      autoFirstPage: false, size: 'A4', bufferPages: true,
      margins: {top: 66, bottom: 52, left: margin, right: margin},
      info: {Title: 'Fichas de avaliação artística · ' + team, Author: 'OBR · Tournamenter'}
    });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.registerFont('Regular', path.join(fonts, 'DejaVuSans.ttf'));
    doc.registerFont('Bold', path.join(fonts, 'DejaVuSans-Bold.ttf'));

    let section = '';
    const pageSections = [];
    doc.on('pageAdded', () => pageSections.push(section));
    sheets.forEach((sheet) => {
      section = sheet.column.label;
      doc.addPage();
      writeSheet(doc, table, team, sheet);
    });

    pageSections.forEach((label, index) => {
      doc.switchToPage(index);
      const right = doc.page.width - margin;
      doc.font('Bold').fontSize(8.5).fillColor(accent)
        .text('OBR   /   ROBÓTICA ARTÍSTICA', margin, 29, {lineBreak: false});
      const pageLabel = label + '   ·   ' + (index + 1) + ' / ' + pageSections.length;
      doc.font('Regular').fillColor(muted)
        .text(pageLabel, right - doc.widthOfString(pageLabel), 29, {lineBreak: false});
      doc.moveTo(margin, 48).lineTo(right, 48).lineWidth(0.65).strokeColor('#a8bec6').stroke();
    });
    doc.end();
  });
}

module.exports = renderReport;
