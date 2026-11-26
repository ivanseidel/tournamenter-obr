import { useEffect, useState } from 'react';
import { request } from './api';
import challenges from './challenges.json';

export default function Challenge() {
  const [tables, setTables] = useState(null),
    [id, setId] = useState(null),
    [rowId, setRowId] = useState(null),
    [search, setSearch] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    request('/tables')
      .then(setTables)
      .catch((e) => setError(e.message));
  }, []);
  const table = tables?.find((t) => t.id === id),
    row = table?.scores.find((r) => r.id === rowId);
  async function generate(n) {
    const name = row.team?.name,
      level = name?.[0];
    if (!challenges[level])
      return setError(
        'Não foi possível identificar o nível a partir do nome da equipe. Use o formato "1 - equipe" ou "2 - equipe" para indicar o nível 1 ou 2.',
      );
    if (!confirm('Tem certeza de que deseja gerar o desafio ' + n + ' da equipe ' + name + '?')) return;
    const pool = challenges[level].filter((text) => text !== row.desafio1);
    const key = 'desafio' + n,
      value = pool[Math.floor(Math.random() * pool.length)];
    setError('');
    setBusy(true);
    try {
      await request('/scores/' + encodeURIComponent(row.id), { method: 'PUT', body: { [key]: value } });
      setTables(
        tables.map((t) =>
          t.id === id
            ? { ...t, scores: t.scores.map((r) => (r.id === rowId ? { ...r, [key]: value } : r)) }
            : t,
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container">
      <h2>Gerenciador de Desafios</h2>
      <hr />
      <p>
        <small>Selecione a Tabela &gt; Equipe e visualize ou gere desafios para equipes.</small>
      </p>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <div className="row">
        <div className="col-md-6 col-sm-6">
          {!table ? (
            <>
              <h4>1) Selecione a Tabela</h4>
              <hr />
              {!tables && !error && <div className="alert alert-warning">Carregando...</div>}
              <div className="list-group">
                {tables?.map((t) => (
                  <button
                    key={t.id}
                    className="list-group-item"
                    onClick={() => {
                      setId(t.id);
                      setSearch('');
                      setError('');
                    }}
                  >
                    {t.name}
                    <span className="pull-right glyphicon glyphicon-chevron-right" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4>
                1) Tabela: {table.name}
                <button
                  className="pull-right btn btn-danger btn-sm"
                  disabled={busy}
                  onClick={() => {
                    setId(null);
                    setRowId(null);
                  }}
                >
                  × Modificar Tabela
                </button>
              </h4>
              <hr />
              <h4>2) Selecione a Equipe</h4>
              <hr />
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Pesquisar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="input-group-btn">
                  <button className="btn btn-info" onClick={() => setSearch('')}>
                    Limpar
                  </button>
                </span>
              </div>
              <br />
              <div className="panel panel-default" style={{ maxHeight: 350, overflowY: 'scroll' }}>
                <div className="list-group">
                  {table.scores
                    .filter((r) =>
                      [r.team?.name, r.team?.country]
                        .join(' ')
                        .toLocaleLowerCase()
                        .includes(search.toLocaleLowerCase()),
                    )
                    .map((r) => (
                      <button
                        key={r.id}
                        disabled={busy}
                        className={'list-group-item' + (r === row ? ' active' : '')}
                        onClick={() => {
                          setRowId(r.id);
                          setError('');
                        }}
                      >
                        <span className="pull-right">
                          {[1, 2, 3].map((n) => (
                            <span
                              key={n}
                              className={'label label-' + (r['desafio' + n] ? 'success' : 'warning')}
                              style={{ marginRight: 8 }}
                            >
                              {n} <i className={'fa fa-' + (r['desafio' + n] ? 'unlock' : 'lock')} />
                            </span>
                          ))}
                        </span>
                        {r.team?.name || '?'}
                        <br />
                        <small>{r.team?.country}</small>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
        {row && (
          <div className="col-md-6 col-sm-6">
            <h4>3) Equipe {row.team?.name || '?'}</h4>
            <hr />
            {[1, 2, 3].map((n) => {
              const text = row['desafio' + n];
              return (
                <div key={n} className={'alert alert-' + (text ? 'success' : 'warning')}>
                  <button
                    disabled={busy}
                    className={'pull-right btn btn-xs btn-' + (text ? 'default' : 'success')}
                    onClick={() => generate(n)}
                  >
                    {text ? 'Gerar novamente' : 'Gerar'}
                  </button>
                  <i className={'fa fa-' + (text ? 'unlock' : 'lock')} /> Desafio {n}
                  {text ? ':' : ' ainda não gerado.'}
                  <div>
                    <strong>{text}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
