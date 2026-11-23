const path = require('path');
const { createAccess, prefix } = require('./access');
const { withScoreWrite } = require('./score-writes');
const { eligibleTable, roundColumns, addFinalists, roundScore, filled } = require('./submission');

const entry = prefix + '/acesso';
const scorerPage = prefix + '/voluntario';
const api = prefix + '/voluntario-api';
const adminConfig = '/obr-pontuador-config';

function install(app, auth, access = createAccess(app.config)) {
  const { server, models: { Table, Scores, Team } } = app;
  const noCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  };
  const jsonOnly = (req, res, next) => {
    if (req.get('X-OBR-Pontuador') !== '1' || !req.is('application/json')) {
      return res.status(403).json({ error: 'Solicitação inválida.' });
    }
    return next();
  };
  const requireVolunteer = (req, res, next) => {
    if (!access.valid(req)) return res.status(401).json({ error: 'Entre novamente no pontuador.' });
    return next();
  };
  const handle = (handler) => (req, res) => {
    Promise.resolve().then(() => handler(req, res)).catch(() => {
      // Do not render request contents or internal credential details in an error page.
      res.status(500).json({ error: 'O pontuador não pôde concluir a operação.' });
    });
  };
  const checkState = (req, res) => {
    if (!access.valid(req)) {
      res.status(401).json({ error: 'Entre novamente no pontuador.' });
      return false;
    }
    return true;
  };

  server.get(adminConfig, auth, noCache, handle(async (req, res) => res.json(await access.status())));
  server.post(adminConfig, auth, noCache, jsonOnly, handle(async (req, res) => {
    const body = req.body || {};
    const password = body.disable === true ? null : body.password;
    if (!await access.changePassword(password)) {
      return res.status(400).json({ error: 'Configure a senha administrativa e escolha uma senha diferente com pelo menos 12 caracteres (até 256 bytes).' });
    }
    return res.json(await access.status());
  }));
  server.get(entry, noCache, (req, res) => {
    if (req.path !== entry) return res.redirect(entry);
    if (access.valid(req)) return res.redirect(scorerPage);
    return res.sendFile(path.join(__dirname, '../public/tournamenter-obr/acesso.html'));
  });
  server.get(scorerPage, noCache, (req, res) => {
    if (req.path !== scorerPage) return res.redirect(scorerPage);
    if (!access.valid(req)) return res.redirect(entry);
    return res.sendFile(path.join(__dirname, '../public/tournamenter-obr/index.html'));
  });
  server.post(api + '/login', noCache, jsonOnly, handle(access.signIn));
  server.post(api + '/logout', noCache, jsonOnly, handle(access.signOut));
  server.get(api + '/tabelas', noCache, requireVolunteer, handle(async (req, res) => {
    const tables = (await Table.find()).filter(eligibleTable);
    if (!tables.length) return checkState(req, res) && res.json([]);
    const rows = await Scores.find({ tableId: tables.map((table) => table.id) });
    const ids = [...new Set(rows.map((row) => row.teamId).filter(Boolean))];
    const teams = ids.length ? await Team.find({ id: ids }) : [];
    if (!checkState(req, res)) return;
    const nameById = new Map(teams.map((team) => [String(team.id), team.name]));
    return res.json(tables.map((table) => {
      const tableRows = addFinalists(table, rows.filter((row) => String(row.tableId) === String(table.id)));
      return {
        id: table.id, name: table.name, columns: Number(table.columns), evaluateMethod: table.evaluateMethod,
        scores: tableRows.filter((row) => nameById.has(String(row.teamId))).map((row) => {
          const submittedRounds = [0, 1, 2, 3].filter((round) => {
            const columns = roundColumns(table, round, row);
            return columns && (filled(row, columns.index) ||
              (columns.time !== undefined && filled(row, columns.time)));
          });
          return { id: row.id, team: { name: nameById.get(String(row.teamId)) },
            resgateFinalista: Boolean(row.resgateFinalista), submittedRounds };
        }),
      };
    }));
  }));
  server.post(api + '/sumulas/:tableId/:id', noCache, requireVolunteer, jsonOnly,
    handle(async (req, res) => {
      const { tableId, id } = req.params;
      const { round, time, data } = req.body || {};
      if (!Number.isInteger(round) || round < 0 || round > 3 ||
          (round !== 3 && (!Number.isFinite(time) || time < 0 || time > 480))) {
        return res.status(400).json({ error: 'Rodada ou tempo inválido.' });
      }
      let result;
      try { result = roundScore(data); }
      catch (error) { return res.status(400).json({ error: 'Súmula inválida.' }); }
      const conflict = () => res.status(409).json({ error: 'Rodada indisponível ou já registrada. Atualize a lista ou fale com a coordenação.' });
      return withScoreWrite(Scores, id, async () => {
        const table = await Table.findOne(tableId);
        if (!eligibleTable(table)) return conflict();
        const rows = await Scores.find({ tableId: table.id });
        addFinalists(table, rows);
        const row = rows.find((entry) => String(entry.id) === id);
        if (!row || !row.teamId || !await Team.findOne(row.teamId)) {
          return res.status(404).json({ error: 'Equipe não encontrada.' });
        }
        const columns = roundColumns(table, round, row);
        if (!columns || filled(row, columns.index) ||
            (columns.time !== undefined && filled(row, columns.time)) || !row.updatedAt) return conflict();
        const scores = Object.assign({}, row.scores, { [columns.index]: result });
        if (columns.time !== undefined) scores[columns.time] = { value: Math.floor(time), data: result.data };
        if (!checkState(req, res)) return;
        const [saved] = await Scores.update({ id: row.id, tableId: table.id, updatedAt: row.updatedAt }, { scores });
        if (!saved) return conflict();
        return res.status(201).json({ ok: true });
      });
    }));
}

module.exports = { install };
