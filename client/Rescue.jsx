import { useEffect, useMemo, useRef, useState } from 'react';
import { request, volunteerBase, volunteerLogout } from './api';
import { scorer, rounds, isFinal, column, available, loadRound, submitRound } from './rescue-round';
import Sheet from './sheets/rescue_scorer_2026_nacional';

function RoundDialog({ volunteer, loading, time, data, total, onLoad, close }) {
  const [tables, setTables] = useState([]);
  const [table, setTable] = useState(null);
  const [round, setRound] = useState(null);
  const [row, setRow] = useState(null);
  const [page, setPage] = useState(0);
  const [clock, setClock] = useState(false);
  const [seconds, setSeconds] = useState(time);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    const controller = new AbortController();
    request(volunteer ? volunteerBase + '/tabelas' : '/tables', { signal: controller.signal })
      .then(setTables)
      .catch((error) => {
        if (!controller.signal.aborted) fail(error);
      });
    return () => controller.abort();
  }, [volunteer]);
  function fail(error) {
    if (volunteer && error.status === 401) return location.assign('/tournamenter-obr/acesso');
    setError(
      error.message + (error.status === 409 ? ' Abra o pontuador novamente para atualizar a seleção.' : ''),
    );
  }
  async function finish() {
    if (busy || !row || !available(table, round, row, volunteer)) return;
    try {
      if (loading) {
        onLoad(loadRound(table, round, row), row.team?.name);
      } else {
        const index = column(table, round);
        if (!volunteer && (row.scores?.[index] || (!isFinal(table, round) && row.scores?.[index + 1]))) {
          if (
            prompt(
              'Parece que esta equipe já possui uma pontuação neste round.\nConfirme com o código para substituir.',
            ) !== '1235'
          )
            return setError('Código incorreto.');
        }
        setBusy(true);
        await submitRound(request, {
          table,
          round,
          row,
          total,
          data,
          volunteer,
          time: clock ? seconds : scorer.totalTime,
        });
        window.alert('OK! Salvo com sucesso.');
      }
      close();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }
  const teams = (table?.scores || [])
    .filter((row) => available(table, round, row, volunteer))
    .sort((a, b) => (a.team?.name || '').localeCompare(b.team?.name || '', 'pt-BR'));
  const cell = !volunteer && row?.scores?.[column(table, round)];
  const choices = page === 0 ? tables : page === 1 ? rounds(table) : teams;
  function choose(item, index) {
    if (page === 0) {
      setTable(item);
      setRound(null);
      setRow(null);
    }
    if (page === 1) {
      setRound(index);
      setRow(null);
    }
    if (page === 2) setRow(item);
    setError('');
  }
  return (
    <dialog
      ref={dialog}
      className="obr-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) close();
      }}
    >
      <div className="modal-header">
        <h3 className="modal-title">Salvar pontuação</h3>
      </div>
      <div className="modal-body">
        <ol className="breadcrumb">
          <li>Salvar/Carregar</li>
          {[table?.name, round != null && rounds(table)[round], row?.team?.name].map(
            (label, i) =>
              label && (
                <li key={i}>
                  <button disabled={busy} className="btn btn-link" onClick={() => setPage(i)}>
                    {label}
                  </button>
                </li>
              ),
          )}
        </ol>
        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}
        <h2>
          {['Selecione a Tabela', 'Selecione o Round', 'Selecione a Equipe', 'Confirmar dados'][page]}
        </h2>
        {page < 3 && (
          <div className="list-group">
            {choices.map((item, i) => (
              <button
                key={item.id ?? i}
                className={
                  'list-group-item' +
                  ((page === 0 && item === table) ||
                  (page === 1 && i === round) ||
                  (page === 2 && item === row)
                    ? ' active'
                    : '')
                }
                onClick={() => choose(item, i)}
              >
                {page === 0 ? item.name : page === 1 ? item : item.team?.name || 'Sem nome'}{' '}
                {page === 2 && !volunteer && item.scores?.[column(table, round)] && (
                  <span className="label label-danger">
                    {item.scores[column(table, round)].value} Pontos
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {page === 3 && (
          <>
            {[
              ['Tabela', table.name],
              ['Round', rounds(table)[round]],
              ['Equipe', row.team?.name],
              ['Pontuação', total],
            ].map(([name, value], i) => (
              <h3 key={name}>
                {name}: <span className={'label label-' + (i === 3 ? 'success' : 'info')}>{value}</span>{' '}
                {i === 3 && cell && <span className="label label-danger">← {cell.value} Pontos</span>}
              </h3>
            ))}
            {!isFinal(table, round) && (
              <>
                <div className="input-group input-group-lg">
                  <span className="input-group-addon">Tempo total:</span>
                  {clock ? (
                    <input
                      className="form-control"
                      aria-label="Tempo"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                    />
                  ) : (
                    <span className="form-control">{scorer.totalTime}</span>
                  )}
                </div>
                <div className="btn-group btn-group-justified" style={{ margin: '24px 0' }}>
                  {[scorer.totalTime + ' Seg', 'Tempo do cronômetro'].map((text, i) => (
                    <label
                      key={text}
                      className={'btn btn-default' + (Boolean(i) === clock ? ' active' : '')}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        checked={Boolean(i) === clock}
                        onChange={() => setClock(Boolean(i))}
                      />
                      {text}
                    </label>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <div className="btn-group pull-right">
          {page > 0 && (
            <button className="btn btn-default" disabled={busy} onClick={() => setPage(page - 1)}>
              Mudar {['', 'Tabela', 'Round', 'Equipe'][page]}
            </button>
          )}
          {page === 3 || (page === 2 && loading) ? (
            <button className="btn btn-success" disabled={busy || !row} onClick={finish}>
              {loading ? 'Carregar' : 'SALVAR'}
            </button>
          ) : (
            <button
              className="btn btn-info"
              disabled={page === 0 ? !table : page === 1 ? round == null : !row}
              onClick={() => setPage(page + 1)}
            >
              Próximo
            </button>
          )}
        </div>
        <div className="clearfix" />
      </div>
      <div className="modal-footer">
        <button className="btn btn-warning" disabled={busy} onClick={close}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}

export default function Rescue({ volunteer }) {
  const [data, setData] = useState(() => structuredClone(scorer.model));
  const [ticks, setTicks] = useState(0);
  const [started, setStarted] = useState(null);
  const [team, setTeam] = useState('');
  const [dialog, setDialog] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const running = started !== null;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTicks(Math.floor((performance.now() - started) / 100)), 100);
    return () => clearInterval(id);
  }, [started, running]);
  const { scoreData, scorings } = useMemo(() => {
    const scoreData = structuredClone(data);
    return { scoreData, scorings: scorer.score(scoreData) };
  }, [data]);
  function update(path, value) {
    setData((previous) => {
      const model = structuredClone(previous);
      const parent = path.slice(0, -1).reduce((obj, key) => obj[key], model);
      parent[path.at(-1)] = value;
      return model;
    });
  }
  function resetSheet() {
    if (!confirm('Are you sure you want to delete this?')) return;
    setData(structuredClone(scorer.model));
    setTeam('');
    setTicks(0);
  }
  return (
    <>
      <nav
        className={
          'navbar navbar-default navbar-fixed-top' + (ticks > scorer.totalTime * 10 ? ' ended' : '')
        }
      >
        <div className="container">
          <div className="navbar-text pull-left" style={{ width: 70, fontSize: 22, margin: 8 }}>
            {(ticks / 10).toFixed(1)}s
          </div>
          <div className="btn-group pull-left">
            {[
              [running, 'success', 'play', 'Iniciar', () => setStarted(performance.now() - ticks * 100)],
              [!running, 'info', 'pause', 'Pausar', () => setStarted(null)],
              [running || !ticks, 'warning', 'stop', 'Zerar', () => setTicks(0)],
            ].map(([disabled, color, icon, name, click]) => (
              <button
                key={icon}
                className={'btn navbar-btn btn-' + color}
                disabled={disabled}
                onClick={click}
              >
                <span className={'glyphicon glyphicon-' + icon} /> <span className="hidden-xs">{name}</span>
              </button>
            ))}
          </div>
          <div className={'btn-group navbar-btn pull-right' + (dropdown ? ' open' : '')}>
            <span className="btn btn-default disabled" style={{ minWidth: 50 }}>
              <strong>{scorings.total ?? 'Invalid'}</strong>
            </span>
            <button className="btn btn-danger" disabled={running} onClick={resetSheet}>
              Zerar
            </button>
            <button className="btn btn-success" disabled={running} onClick={() => setDialog('save')}>
              Salvar
            </button>
            {!volunteer && (
              <>
                <button
                  className="btn btn-success dropdown-toggle"
                  disabled={running}
                  aria-label="Mais opções"
                  aria-expanded={dropdown}
                  onClick={() => setDropdown(!dropdown)}
                >
                  <span className="caret" />
                </button>
                {dropdown && (
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        href="#carregar"
                        onClick={(e) => {
                          e.preventDefault();
                          setDropdown(false);
                          setDialog('load');
                        }}
                      >
                        Carregar
                      </a>
                    </li>
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
        <div style={{ backgroundColor: '#dadada', height: 4 }}>
          <div
            style={{
              backgroundColor: ticks > scorer.totalTime * 10 - 480 ? '#DD3322' : '#1bb50d',
              height: 4,
              width: Math.min(100, (ticks * 10) / scorer.totalTime) + '%',
            }}
          />
        </div>
      </nav>
      <div style={{ paddingTop: 90 }}>
        <Sheet
          {...{ scoreData, scorings, update, ticks, running, team }}
          stop={() => setStarted(null)}
          sumSpecial={(values, keys) => keys.reduce((sum, key) => sum + (values?.[key] || 0), 0)}
        />
      </div>
      <a
        href={volunteer ? '/tournamenter-obr/voluntario-artistica' : '/obr-artistica'}
        className="btn btn-default"
      >
        Pontuador Artística
      </a>
      {volunteer && (
        <button className="btn btn-default" onClick={() => volunteerLogout(false)}>
          Sair do pontuador
        </button>
      )}
      {dialog && (
        <RoundDialog
          volunteer={volunteer}
          loading={dialog === 'load'}
          time={Math.min(ticks / 10, scorer.totalTime)}
          data={scoreData}
          total={scorings.total}
          onLoad={(sheet, name) => {
            setData(sheet.data);
            setTicks(sheet.seconds * 10);
            setTeam(name);
          }}
          close={() => setDialog(null)}
        />
      )}
    </>
  );
}
