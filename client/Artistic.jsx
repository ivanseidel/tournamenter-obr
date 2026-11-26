import { useEffect, useState } from 'react';
import forms from '../public/tournamenter-obr/scripts/artistica';
import { request, volunteerBase, volunteerLogout } from './api';

const icons = {
  video: 'film',
  poster: 'picture',
  entrevista: 'comment',
  apresentacao1: 'music',
  apresentacao2: 'music',
  stand: 'flag',
};

export default function Artistic({ volunteer }) {
  const [column, setColumn] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [sheet, setSheet] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const api = volunteer ? volunteerBase + '/artistica' : '/obr-artistica-api';
  const table = tables.find((item) => String(item.id) === tableId);
  const row = table?.scores.find((item) => String(item.id) === teamId);
  const submitted = row?.submittedColumns.includes(column?.id);
  const teamPath = encodeURIComponent(tableId) + '/' + encodeURIComponent(teamId);
  const sheetUrl = api + '/sumulas/' + teamPath + '/' + column?.id;
  const result = draft && forms.evaluate(column.id, draft);
  const dirty = draft && JSON.stringify(draft) !== JSON.stringify(sheet.initial);
  const conflict = error?.status === 409 && Boolean(draft);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function clear() {
    setDraft(null);
    setSaved(null);
    setSheet(null);
    setError(null);
    setShowErrors(false);
  }
  function leave() {
    return !busy && (!dirty || confirm('Descartar as alterações desta ficha?'));
  }
  async function loadTables() {
    setBusy(true);
    setTeamId('');
    setError(null);
    try {
      const tables = await request(api + '/tabelas');
      setTables(tables);
      setTableId(
        tables.some((t) => String(t.id) === tableId)
          ? tableId
          : tables.length === 1
            ? String(tables[0].id)
            : '',
      );
    } catch (e) {
      setError(e);
      setTables([]);
    } finally {
      setBusy(false);
    }
  }
  function back() {
    if (leave()) {
      clear();
      loadTables();
    }
  }
  function markColumn(hasScore) {
    setTables((current) =>
      current.map((t) =>
        t === table
          ? {
              ...t,
              scores: t.scores.map((r) =>
                r === row
                  ? {
                      ...r,
                      submittedColumns: [
                        ...r.submittedColumns.filter((id) => id !== column.id),
                        ...(hasScore ? [column.id] : []),
                      ],
                    }
                  : r,
              ),
            }
          : t,
      ),
    );
  }
  async function open() {
    if (busy || !row || table.locked || (volunteer && submitted)) return;
    clear();
    setBusy(true);
    try {
      const { cells, revision } = await request(sheetUrl);
      const main = cells.find((c) => c.index === column.index);
      const bonus = cells.find((c) => c.index === column.bonusIndex);
      const restored = forms.restore(column.id, (main || bonus)?.data);
      const initial = restored || forms.createDraft(column.id);
      if (bonus) initial.criteria.sustentabilidade.points = Number(bonus.value);
      const values = cells.map(
        (c) =>
          (c.index === column.bonusIndex ? 'Sustentabilidade' : column.label) + ' (' + c.value + ' pontos)',
      );
      const summary = cells.length
        ? 'Nota registrada: ' +
          values.join(' e ') +
          '. ' +
          (restored
            ? 'Confira a ficha antes de salvar uma correção.'
            : 'Preencha os critérios para substituir a nota anterior.')
        : '';
      markColumn(cells.length > 0);
      setSheet({ revision, summary, initial });
      setDraft(initial);
    } catch (e) {
      if (volunteer && e.status === 409) await loadTables();
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  function criterion(id, patch) {
    setDraft((old) => ({ ...old, criteria: { ...old.criteria, [id]: { ...old.criteria[id], ...patch } } }));
  }
  async function save(e) {
    e.preventDefault();
    setShowErrors(true);
    if (busy || conflict || !result.valid) return;
    if (
      sheet.summary &&
      !confirm('Substituir a nota registrada de ' + row.team.name + ' em ' + column.label + '?')
    )
      return;
    setError(null);
    setBusy(true);
    try {
      await request(sheetUrl, { method: 'PUT', body: { revision: sheet.revision, data: draft } });
      markColumn(true);
      clear();
      setSaved(result);
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <nav className="art-nav" aria-label="Pontuadores">
        <div className="art-width">
          <a href={volunteer ? '/tournamenter-obr/voluntario' : '/tournamenter-obr'}>Pontuador Resgate</a>
          <span aria-current="page">Pontuador Artística</span>
          {volunteer && (
            <button className="btn btn-default btn-sm" onClick={() => volunteerLogout(true)}>
              Sair do pontuador
            </button>
          )}
        </div>
      </nav>
      <main className="art-width">
        <header className="art-header">
          <h1>Pontuador Artística</h1>
          {!column && <p>Selecione a coluna para registrar a nota de consenso dos juízes.</p>}
        </header>
        {!column ? (
          <div className="art-columns">
            {forms.columns.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  clear();
                  setColumn(item);
                  loadTables();
                }}
              >
                <span aria-hidden="true" className={'glyphicon glyphicon-' + icons[item.id]} />
                <strong>{item.label}</strong>
                <span aria-hidden="true" className="glyphicon glyphicon-chevron-right" />
              </button>
            ))}
          </div>
        ) : (
          <section>
            <div className="art-context">
              <div>
                <h2>{column.label}</h2>
                {(draft || saved) && (
                  <p>
                    {table.name} · {row.team.name}
                  </p>
                )}
              </div>
              <button
                className="btn btn-default"
                disabled={busy}
                onClick={() => {
                  if (leave()) {
                    clear();
                    setColumn(null);
                  }
                }}
              >
                Trocar coluna
              </button>
            </div>
            {!draft && !saved && (
              <div className="art-sheet">
                {busy && <p role="status">Carregando…</p>}
                {!busy && !tables.length && (
                  <>
                    <p>Nenhuma tabela de Artística Nacional com oito colunas disponível.</p>
                    <button className="btn btn-default" onClick={loadTables}>
                      Atualizar tabelas
                    </button>
                  </>
                )}
                {!!tables.length && (
                  <div className="art-selectors">
                    <div>
                      <label htmlFor="art-table">Tabela</label>
                      <select
                        id="art-table"
                        className="form-control"
                        value={tableId}
                        disabled={busy}
                        onChange={(e) => {
                          setTableId(e.target.value);
                          setTeamId('');
                          setError(null);
                        }}
                      >
                        <option value="">Selecione uma tabela</option>
                        {tables.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                            {t.locked ? ' · bloqueada' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="art-team">Equipe</label>
                      <select
                        id="art-team"
                        className="form-control"
                        value={teamId}
                        disabled={!table || busy}
                        onChange={(e) => setTeamId(e.target.value)}
                      >
                        <option value="">Selecione uma equipe</option>
                        {[...(table?.scores || [])]
                          .sort((a, b) => (a.team.name || '').localeCompare(b.team.name || '', 'pt-BR'))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.team.name || 'Equipe sem nome'}
                              {r.submittedColumns.includes(column.id) ? ' · já avaliada' : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                    <button
                      className="btn btn-primary"
                      disabled={busy || !row || table.locked || (volunteer && submitted)}
                      onClick={open}
                    >
                      Abrir ficha
                    </button>
                  </div>
                )}
                {table && !table.scores.length && <p>Nenhuma equipe cadastrada nesta tabela.</p>}
                {table?.locked && (
                  <p>Tabela bloqueada para edição. Selecione uma equipe para baixar suas avaliações.</p>
                )}
                {volunteer && submitted && (
                  <p>Esta equipe já tem nota nesta coluna. Correções são feitas pela coordenação.</p>
                )}
              </div>
            )}
            {!volunteer && row?.submittedColumns.length > 0 && (
              <section className="art-sheet art-reports">
                <h3>Avaliação em PDF</h3>
                <p>
                  O PDF usa as notas e justificativas já salvas. O PDF da equipe reúne todas as fichas
                  registradas nesta tabela.
                </p>
                <div className="art-downloads">
                  {submitted && (
                    <a
                      className="btn btn-default"
                      href={api + '/relatorios/' + teamPath + '/' + column.id}
                      target="_blank"
                      rel="noopener"
                    >
                      Baixar PDF da ficha
                    </a>
                  )}
                  <a
                    className="btn btn-default"
                    href={api + '/relatorios/' + teamPath + '/equipe'}
                    target="_blank"
                    rel="noopener"
                  >
                    Baixar PDF da equipe
                  </a>
                </div>
              </section>
            )}
            {draft && (
              <form className="art-sheet" onSubmit={save} noValidate>
                <fieldset disabled={busy}>
                  <div className="art-sheet-heading">
                    <h3>Ficha de avaliação</h3>
                    <a href={column.source} target="_blank" rel="noopener noreferrer">
                      Formulário de referência
                    </a>
                  </div>
                  {sheet.summary && <p className="alert alert-info">{sheet.summary}</p>}
                  {column.criteria.map((c) => {
                    const entry = draft.criteria[c.id];
                    const points = {
                      id: 'points-' + c.id,
                      className: 'form-control',
                      required: true,
                      value: entry.points ?? '',
                      onChange: (e) =>
                        criterion(c.id, { points: e.target.value === '' ? null : Number(e.target.value) }),
                    };
                    return (
                      <div key={c.id} className="art-criterion">
                        <div className="art-criterion-head">
                          <label htmlFor={points.id}>{c.label}</label>
                          <div className="art-number">
                            {c.choices ? (
                              <select {...points}>
                                <option value="">—</option>
                                {c.choices.map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={c.max ?? undefined}
                                step={1}
                                aria-describedby={'help-' + c.id}
                                {...points}
                              />
                            )}
                            {!!c.max && <span>/ {c.max}</span>}
                          </div>
                        </div>
                        <p id={'help-' + c.id} className="art-help">
                          {c.help}
                        </p>
                        <label className="art-note-label" htmlFor={'note-' + c.id}>
                          Justificativa <span>(opcional)</span>
                        </label>
                        <textarea
                          className="form-control"
                          rows={1}
                          id={'note-' + c.id}
                          value={entry.justification}
                          onChange={(e) => criterion(c.id, { justification: e.target.value })}
                        />
                      </div>
                    );
                  })}
                  {column.stage && (
                    <label className="art-short-show">
                      <input
                        type="checkbox"
                        checked={draft.belowMinimum}
                        onChange={(e) => setDraft({ ...draft, belowMinimum: e.target.checked })}
                      />{' '}
                      Apresentação com menos de 1 min 30 s (nota zero)
                    </label>
                  )}
                  <label htmlFor="art-note">
                    Justificativa geral <span className="art-optional">(opcional)</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="art-note"
                    rows={2}
                    value={draft.justification}
                    onChange={(e) => setDraft({ ...draft, justification: e.target.value })}
                  />
                </fieldset>
                <div className="art-total">
                  <div>
                    <span>Nota da coluna</span>
                    <strong>
                      {result.total} <small>/ {column.max}</small>
                    </strong>
                    {column.id === 'entrevista' && (
                      <span>Sustentabilidade: +{result.bonus} pontos em coluna separada</span>
                    )}
                    {!!result.deduction && <span>Dedução: {result.deduction} pontos</span>}
                  </div>
                  <button className="btn btn-primary" disabled={busy || conflict}>
                    {busy ? 'Salvando…' : 'Salvar avaliação'}
                  </button>
                </div>
                {showErrors && !!result.errors.length && (
                  <ul className="alert alert-warning art-errors" role="alert">
                    {result.errors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                )}
                <button className="btn btn-link" type="button" onClick={back} disabled={busy}>
                  Voltar às equipes
                </button>
              </form>
            )}
            {saved && (
              <div className="art-sheet">
                <h3>Avaliação salva</h3>
                <p role="status">
                  {saved.total} pontos em {column.label}
                  {column.id === 'entrevista' ? ' e ' + saved.bonus + ' em Sustentabilidade' : ''}.
                </p>
                <button className="btn btn-primary" onClick={back}>
                  Pontuar outra equipe
                </button>
              </div>
            )}
          </section>
        )}
        {error && (
          <div className="alert alert-danger art-feedback" role="alert">
            {error.message}{' '}
            {error.status === 401 && (
              <a href={volunteer ? '/tournamenter-obr/acesso?modalidade=artistica' : '/login'}>
                Entrar novamente
              </a>
            )}
            {conflict && (
              <button className="btn btn-default btn-sm" onClick={back}>
                Atualizar equipes
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}
