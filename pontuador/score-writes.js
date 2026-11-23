const writesByModel = new WeakMap();
const guardedControllers = new WeakSet();
const changed = 'A pontuação da equipe mudou. Atualize a tabela e tente novamente.';

function withScoreWrite(Scores, id, write) {
  let writes = writesByModel.get(Scores);
  if (!writes) {
    writes = new Map();
    writesByModel.set(Scores, writes);
  }

  const key = String(id);
  const result = (writes.get(key) || Promise.resolve()).then(write);
  const clear = () => { if (writes.get(key) === done) writes.delete(key); };
  const done = result.then(clear, clear);
  writes.set(key, done);
  return result;
}

function installAdminScoreWrites({ controllers, models: { Scores } }) {
  const controller = controllers.Scores;
  if (guardedControllers.has(controller)) return;
  guardedControllers.add(controller);
  const update = controller.update;

  // The host registers these controllers after collecting plugin assets.
  // Its routing, authentication and metadata-only updates stay in place.
  controller.updateScore = (req, res, next) => {
    const { id, number } = req.params;
    const data = req.param('data', null);
    const value = req.param('value', null);
    if (data === null || value === null) return next('Missing properties');

    return withScoreWrite(Scores, id, async () => {
      const row = await Scores.findOne(id);
      if (!row) return next('Score not found');
      const scores = Object.assign({}, row.scores, { [number]: { value: parseInt(value), data } });
      const [saved] = await Scores.update({ id: row.id, updatedAt: row.updatedAt }, { scores });
      if (!saved) return res.status(409).json({ error: changed });
      return res.json(saved);
    }).catch(next);
  };

  controller.update = (req, res, next) => {
    const values = Object.assign(Object.create(null), req.query, req.body);
    if (!Object.prototype.hasOwnProperty.call(values, 'scores')) return update(req, res, next);

    const id = req.query.id || req.params.id;
    const expected = typeof values.updatedAt === 'string' && Date.parse(values.updatedAt);
    delete values.id;
    delete values.updatedAt;

    // Table management sends a full snapshot, including the version it displayed.
    // Reject a stale snapshot instead of erasing cells saved since it was loaded.
    return withScoreWrite(Scores, id, async () => {
      const row = await Scores.findOne(id);
      if (!row) return res.status(404).send('No object found with the specified `id`');
      if (new Date(row.updatedAt).getTime() !== expected) {
        return res.status(409).json({ error: changed });
      }
      const [saved] = await Scores.update({ id: row.id, updatedAt: row.updatedAt }, values);
      if (!saved) return res.status(409).json({ error: changed });
      return res.json(saved);
    }).catch(next);
  };
}

module.exports = { withScoreWrite, installAdminScoreWrites };
