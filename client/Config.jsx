import { useEffect, useState } from 'react';
import { request } from './api';

function VolunteerAccess() {
  const [status, setStatus] = useState(null),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    request('/obr-pontuador-config')
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);
  async function save(body) {
    setBusy(true);
    setError('');
    try {
      setStatus(await request('/obr-pontuador-config', { method: 'POST', body }));
      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="container">
      <h2>Acesso ao pontuador</h2>
      <p>
        Defina uma senha separada para o <a href="/tournamenter-obr/acesso">pontuador dos voluntários</a>.
        Alterar ou revogar a senha encerra as sessões de todos os voluntários.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save({ password });
        }}
      >
        <label htmlFor="volunteer-password">Nova senha do pontuador</label>
        <input
          id="volunteer-password"
          className="form-control"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={256}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" disabled={busy || !status?.adminConfigured}>
          Definir ou trocar senha
        </button>{' '}
        <button
          type="button"
          className="btn btn-danger"
          disabled={busy || !status?.enabled}
          onClick={() => {
            if (confirm('Revogar o acesso de todos os voluntários?')) save({ disable: true });
          }}
        >
          Revogar acesso
        </button>
        <p role="status">
          {error ||
            (!status
              ? 'Consultando o acesso…'
              : !status.adminConfigured
                ? 'Configure primeiro a senha administrativa do Tournamenter.'
                : status.enabled
                  ? 'Acesso ativo.'
                  : 'Acesso desativado.')}
        </p>
      </form>
    </section>
  );
}
function Imports() {
  const [token, setToken] = useState(''),
    [event, setEvent] = useState(null),
    [loading, setLoading] = useState(false),
    [actions, setActions] = useState(null),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    if (!token.trim()) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await request(
          'https://olimpo.robocup.org.br/api/events/steps/participants?' +
            new URLSearchParams({ token: token.trim() }),
          { signal: abort.signal },
        );
        if (!Array.isArray(data?.teams)) throw new Error('Falha ao carregar as equipes do Olimpo.');
        setEvent(data);
      } catch (e) {
        if (!abort.signal.aborted) setError(e.message);
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [token]);
  async function diff() {
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const teams = await request('/teams?limit=10000'),
        lastDigit =
          (Array.isArray(event.name) ? event.name.join(' ') : String(event.name || '')).match(
            /\d(?=\D*$)/,
          )?.[0] || '?';
      const actions = [];
      for (const { id, ...remote } of event.teams) {
        const team = teams.find((t) => String(t.olimpoId) === String(id));
        const values = {
          ...remote,
          olimpoId: id,
          stepId: event.id,
          token: token.trim(),
          name: lastDigit + ' - ' + remote.name,
          country: remote.city + ' - ' + remote.state,
        };
        if (
          !team ||
          Object.entries(values).some(([k, v]) => JSON.stringify(team[k]) !== JSON.stringify(v))
        ) {
          actions.push({
            type: team ? 'update' : 'create',
            id: team?.id,
            values,
            label: team ? team.name + ' → ' + values.name : remote.name,
          });
        }
      }
      setActions(actions);
      setSuccess(
        actions.length
          ? 'Diferenças encontradas. Verifique e execute as mudanças (passo 2).'
          : 'Nenhuma diferença encontrada. Equipes já estão sincronizadas.',
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function commit() {
    setBusy(true);
    setSuccess('');
    setError('');
    try {
      for (const [i, action] of actions.entries()) {
        if (action.done) continue;
        await request(action.type === 'update' ? '/teams/' + encodeURIComponent(action.id) : '/teams', {
          method: action.type === 'update' ? 'PUT' : 'POST',
          body: action.values,
        });
        setActions((current) => current.map((a, j) => (i === j ? { ...a, done: true } : a)));
      }
      setSuccess('Importação finalizada com sucesso!');
    } catch (e) {
      setError(e.message + ' Verifique novamente as diferenças antes de continuar.');
      setActions(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="col-md-6" style={{ marginTop: 42 }}>
      <h2>Importar Equipes</h2>
      <hr />
      <p>
        <small>Importe todas as equipes do seu regional específico para o Tournamenter.</small>
      </p>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <label htmlFor="olimpo-token">Token do Evento para importar equipes:</label>
      <div className="form-group">
        <input
          id="olimpo-token"
          className="form-control"
          disabled={busy}
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setLoading(!!e.target.value.trim());
            setEvent(null);
            setActions(null);
            setError('');
            setSuccess('');
          }}
        />
        {loading && <span className="label label-warning">Carregando...</span>}
        {event && <span className="label label-success">{event.teams.length} Equipes</span>}
      </div>
      <div className="form-group">
        <button className="btn btn-primary btn-sm btn-block" disabled={!event || busy} onClick={diff}>
          Verificar Diferenças (passo 1)
        </button>
      </div>
      {!!actions?.length && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">
              Alterações a serem feitas{' '}
              <button
                className="pull-right btn btn-success btn-xs"
                disabled={busy || actions.every((a) => a.done)}
                onClick={commit}
              >
                Executar (passo 2)
              </button>
            </h3>
          </div>
          {busy && (
            <progress
              className="progress"
              max={actions.length}
              value={actions.filter((a) => a.done).length}
            />
          )}
          <div className="panel-body">
            <ul>
              {['create', 'update']
                .filter((s) => actions.some((a) => a.type === s))
                .map((s) => (
                  <li key={s}>
                    {s}: {actions.filter((a) => a.type === s).length}x
                  </li>
                ))}
            </ul>
            <ul className="list-group" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {actions.map((a) => (
                <li key={a.values.olimpoId} className="list-group-item">
                  {a.label}
                  {a.done && <span className="pull-right text-success glyphicon glyphicon-ok" />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
function Exports() {
  const [original, setOriginal] = useState(null),
    [config, setConfig] = useState(null),
    [last, setLast] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    request('/obr-sync', { signal: abort.signal })
      .then((c) => {
        setConfig(c);
        setOriginal(c);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    function refresh() {
      request('/obr-last-sync', { signal: abort.signal })
        .then((c) => setLast(c.timestamp))
        .catch((e) => {
          if (!abort.signal.aborted) setError(e.message);
        });
    }
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
      abort.abort();
    };
  }, []);
  const dirty = JSON.stringify(original) !== JSON.stringify(config);
  async function send(now) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await request('/obr-sync', { method: 'POST', body: now ? { now: true } : config });
      if (now) {
        setLast(Date.now());
        setSuccess('Sincronizado com sucesso!');
      } else {
        setConfig(data);
        setOriginal(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="col-md-6">
      <h2>Envio de notas</h2>
      <hr />
      <p>
        <small>Configure para habilitar o envio das pontuações automaticamente durante o torneio.</small>
      </p>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {config && (
        <>
          <div className="alert alert-info">
            Última sincronização: <b>{last ? new Date(Number(last)).toLocaleString('pt-BR') : '—'}</b>
            <span
              className={
                'pull-right label label-' + (dirty ? 'danger' : config.sync ? 'success' : 'warning')
              }
            >
              {dirty
                ? 'Salve as Configurações'
                : config.sync
                  ? 'Habilitado (' + config.interval + 's)'
                  : 'Desabilitado'}
            </span>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <input
                  id="olimpo-sync"
                  type="checkbox"
                  checked={config.sync}
                  onChange={(e) => setConfig({ ...config, sync: e.target.checked })}
                />
              </span>
              <label htmlFor="olimpo-sync" className="input-group-addon" style={{ width: '95%' }}>
                Habilitar/Desabilitar sincronização automática
              </label>
              <span className="input-group-btn">
                <button
                  className={'btn btn-' + (dirty ? 'success' : 'default')}
                  disabled={
                    busy || !dirty || (config.sync && (config.interval < 60 || config.interval > 1800))
                  }
                  onClick={() => send(false)}
                >
                  Salvar
                </button>
              </span>
            </div>
          </div>
          {config.sync && (
            <div className="form-group">
              <label htmlFor="sync-interval">Intervalo de sincronização (em segundos)</label>
              <input
                id="sync-interval"
                className="form-control"
                type="number"
                min={60}
                max={1800}
                value={config.interval}
                onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
              />
            </div>
          )}
          <button
            className="btn btn-warning btn-sm btn-block"
            disabled={dirty || busy}
            onClick={() => send(true)}
          >
            Enviar dados (agora)
          </button>
        </>
      )}
    </div>
  );
}
export default function Config() {
  return (
    <>
      <VolunteerAccess />
      <div className="container">
        <Imports />
        <Exports />
      </div>
    </>
  );
}
