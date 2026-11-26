const { createHash } = require('crypto');
const path = require('path');
const artistic = require('../public/tournamenter-obr/scripts/artistica');
const renderReport = require('./artistica-pdf');
const { withScoreWrite } = require('./score-writes');
const { filled } = require('./submission');

const adminPage = '/obr-artistica';
const volunteerPage = '/tournamenter-obr/voluntario-artistica';
const login = '/tournamenter-obr/acesso?modalidade=artistica';
const deductionIndex = 7;
const deductionSource = 'obr-artistica-deducoes-v1';
const deductionColumns = artistic.columns.filter((column) => column.stage || column.id === 'entrevista');

function artisticTable(table) {
  return table && table.evaluateMethod === 'artistica2026nacional' &&
    Number(table.columns) >= 8;
}

function indexes(column) {
  return column.bonusIndex === undefined ? [column.index] : [column.index, column.bonusIndex];
}

function snapshot(row, column) {
  const cells = indexes(column).filter((i) => filled(row, i)).map((index) => {
    const cell = row.scores[index] || {};
    return { index, value: cell.value, data: cell.data };
  });
  // Only concurrent changes to this form (including the interview bonus) invalidate it.
  const revision = createHash('sha256').update(JSON.stringify([row.tableId, row.teamId, row.id, column.id, cells])).digest('hex');
  return { cells, revision };
}

function reportSheet(scores, column) {
  const main = scores[column.index];
  const extra = column.bonusIndex === undefined ? null : scores[column.bonusIndex];
  const value = main && main.value != null && main.value !== '' ? main.value : null;
  const bonus = extra && extra.value != null && extra.value !== '' ? extra.value : null;
  if (value === null && bonus === null) return null;
  // The interview stores the same detailed sheet alongside its sustainability bonus.
  const draft = artistic.restore(column.id, main && main.data) || artistic.restore(column.id, extra && extra.data);
  return { column, draft, value, bonus };
}

function updateDeductions(scores) {
  const previous = scores[deductionIndex];
  const previousData = previous && previous.data;
  const previousParts = previousData && previousData.source === deductionSource && previousData.deductions;
  if (Object.prototype.hasOwnProperty.call(scores, deductionIndex)) {
    // A coordinator may edit just the total in the table and leave our old data attached.
    if (!previousParts) return true;
    const previousTotal = Object.keys(previousParts).reduce((sum, id) => sum + previousParts[id], 0);
    if (String(previous.value) !== String(previousTotal)) return true;
  }

  const deductions = {};
  let total = 0;
  for (const column of deductionColumns) {
    if (!Object.prototype.hasOwnProperty.call(scores, column.index)) continue;
    const cell = scores[column.index];
    const draft = artistic.restore(column.id, cell && cell.data);
    const points = draft ? artistic.evaluate(column.id, draft).deduction : previousParts && previousParts[column.id];
    // A manually entered score can hide an unknown deduction. Keep the current tie-break
    // until the coordinator records its total or replaces that score with a full sheet.
    if (!Number.isSafeInteger(points) || points < 0) return true;
    deductions[column.id] = points;
    total += points;
  }
  if (!Number.isSafeInteger(total)) return false;
  scores[deductionIndex] = { value: total, data: { source: deductionSource, deductions } };
  return true;
}

function install(app, { auth, noCache, handle, jsonOnly, requireVolunteer, checkState, access }) {
  const { server, models: { Scores, Table, Team } } = app;
  const render = (req, res) => res.sendFile('artistica.html', { root: __dirname });
  server.get(adminPage, auth, noCache, render);
  server.get(volunteerPage, noCache, (req, res) => {
    if (!access.valid(req)) return res.redirect(login);
    if (req.path !== volunteerPage) return res.redirect(volunteerPage);
    return render(req, res);
  });

  const conflict = (res) => res.status(409).json({
    error: 'Avaliação indisponível ou alterada. Atualize a ficha antes de continuar.',
  });
  async function loadTeam(req, res, allowLocked) {
    const { tableId, id } = req.params;
    const table = await Table.findOne(tableId);
    if (!artisticTable(table) || (!allowLocked && table.locked === 'yes')) {
      conflict(res);
      return;
    }
    const row = await Scores.findOne(id);
    const team = row && String(row.tableId) === String(table.id) && row.teamId && await Team.findOne(row.teamId);
    if (!team) {
      res.status(404).json({ error: 'Equipe não encontrada nesta tabela.' });
      return;
    }
    return { table, row, team };
  }

  server.get('/obr-artistica-api/relatorios/:tableId/:id/:column', noCache, auth, handle(async (req, res) => {
    const id = req.params.column;
    const columns = id === 'equipe' ? artistic.columns : artistic.columns.filter((column) => column.id === id);
    if (!columns.length) return res.status(400).json({ error: 'Coluna artística inválida.' });
    const record = await loadTeam(req, res, true);
    if (!record) return;
    const { table, row, team } = record;
    const sheets = columns.map((column) => reportSheet(row.scores || {}, column)).filter(Boolean);
    if (!sheets.length) return res.status(404).json({ error: 'Nenhuma avaliação registrada para este PDF.' });
    const pdf = await renderReport({ table: table.name, team: team.name, sheets });
    const teamName = (team.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 80).replace(/^-|-$/g, '') || 'equipe';
    return res.attachment('avaliacao-' + teamName + '-' + id + '.pdf').send(pdf);
  }));

  function routes(base, guard, volunteer) {
    const active = (req, res) => !volunteer || checkState(req, res);
    server.get(base + '/tabelas', noCache, guard, handle(async (req, res) => {
      const tables = (await Table.find()).filter((table) => artisticTable(table) && (!volunteer || table.locked !== 'yes'));
      const rows = tables.length ? await Scores.find({ tableId: tables.map((table) => table.id) }) : [];
      const teamIds = Array.from(new Set(rows.map((row) => row.teamId).filter(Boolean)));
      const teams = teamIds.length ? await Team.find({ id: teamIds }) : [];
      if (!active(req, res)) return;
      const names = new Map(teams.map((team) => [String(team.id), team.name]));
      return res.json(tables.map((table) => ({
        id: table.id,
        name: table.name,
        locked: table.locked === 'yes',
        scores: rows.filter((row) => String(row.tableId) === String(table.id) && names.has(String(row.teamId)))
          .map((row) => ({
            id: row.id,
            team: { name: names.get(String(row.teamId)) },
            submittedColumns: artistic.columns.filter((column) => indexes(column).some((i) => filled(row, i)))
              .map((column) => column.id),
          })),
      })));
    }));

    const formRoute = base + '/sumulas/:tableId/:id/:column';
    async function open(req, res) {
      const column = artistic.columns.find((item) => item.id === req.params.column);
      if (!column) {
        res.status(400).json({ error: 'Coluna artística inválida.' });
        return;
      }
      const record = await loadTeam(req, res, false);
      if (!record || !active(req, res)) return;
      const row = record.row;
      const current = snapshot(row, column);
      if (volunteer && current.cells.length) {
        conflict(res);
        return;
      }
      return { row, column, current };
    }

    server.get(formRoute, noCache, guard, handle(async (req, res) => {
      const form = await open(req, res);
      if (form) return res.json(form.current);
    }));
    server.put(formRoute, noCache, guard, jsonOnly, handle((req, res) =>
      withScoreWrite(Scores, req.params.id, async () => {
        const form = await open(req, res);
        if (!form) return;
        const { row, column, current } = form;
        const body = req.body || {};
        if (!row.updatedAt || body.revision !== current.revision) return conflict(res);
        const data = artistic.restore(column.id, body.data);
        if (!data) return res.status(400).json({ error: 'Preencha a ficha com valores válidos.' });
        const result = artistic.evaluate(column.id, data);
        if (!result.valid) return res.status(400).json({ error: 'Ficha artística inválida.' });
        const scores = Object.assign({}, row.scores);
        scores[column.index] = { value: result.total, data };
        if (column.bonusIndex !== undefined) scores[column.bonusIndex] = { value: result.bonus, data };
        if (deductionColumns.includes(column) && !updateDeductions(scores)) {
          return res.status(400).json({ error: 'A soma das deduções excede o limite numérico.' });
        }
        if (!active(req, res)) return;
        const [saved] = await Scores.update({ id: row.id, tableId: row.tableId, updatedAt: row.updatedAt }, { scores });
        if (!saved) return conflict(res);
        return res.json(snapshot(saved, column));
      })));
  }
  routes('/obr-artistica-api', auth, false);
  routes('/tournamenter-obr/voluntario-api/artistica', requireVolunteer, true);
}

module.exports = { install, volunteerPage, login };
