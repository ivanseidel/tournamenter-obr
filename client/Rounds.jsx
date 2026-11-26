import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { generateTimetable, minuteToTime } from './timetable';
import markdownTable from './markdown';
import { request } from './api';

function minutes(text) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) return null;
  const [h, m] = text.split(':').map(Number);
  return h * 60 + m;
}
function download(table, title) {
  const contents = table
    .map((row) => row.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', contents], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = title + '.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Rounds() {
  const [tables, setTables] = useState([]),
    [error, setError] = useState(''),
    [tableId, setTableId] = useState('');
  const [arenas, setArenas] = useState('1, 2, 3'),
    [starts, setStarts] = useState(['09:00', '13:00', '16:00']),
    [pauses, setPauses] = useState('12:00-13:00');
  const [duration, setDuration] = useState(10),
    [levels, setLevels] = useState({}),
    [printIndex, setPrintIndex] = useState(null);
  useEffect(() => {
    request('/tables')
      .then(setTables)
      .catch((e) => setError(e.message));
  }, []);
  const table = tables.find((t) => String(t.id) === tableId);
  const names = arenas
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => 'Arena ' + x);
  const periods = pauses
    .split(',')
    .filter((x) => x.trim())
    .map((s) =>
      s
        .trim()
        .split('-')
        .map((t) => minutes(t.trim())),
    );
  const valid = periods.every((p) => p.length === 2 && p.every((x) => x !== null) && p[1] > p[0]);
  const rounds = [1, 2, 3];
  function level(round, i) {
    return levels[round + '-' + i] ?? (i < 6 ? (i % 3) + 1 : 0);
  }
  const config = {
    arenas: names,
    periodos: periods.sort((a, b) => a[0] - b[0]),
    inicios: starts.map(minutes),
    duration: Number(duration),
    uso: Object.fromEntries(rounds.map((r) => [r, names.map((_, i) => level(r, i))])),
  };
  const result = useMemo(() => {
    if (!valid || config.inicios.includes(null) || !(config.duration > 0))
      return { tables: [], errors: ['Confira os horários e a duração das rodadas.'] };
    return generateTimetable(config, table && { ...table });
  }, [tables, tableId, arenas, starts, pauses, duration, levels]);
  function print(i) {
    flushSync(() => setPrintIndex(i));
    window.print();
    setPrintIndex(null);
  }
  return (
    <div className="container">
      <h2 className="hidden-print">Gerador de horários de Rounds</h2>
      <hr className="hidden-print" />
      <p className="hidden-print">
        <small>Gere tabelas de horários para cada um os 3 rounds, com suas configurações.</small>
      </p>
      <div className="row">
        <div className="col-md-4 col-sm-5 hidden-print">
          <label htmlFor="round-table">Tabela do Tournamenter para gerar: (Nível)</label>
          <select
            id="round-table"
            className="form-control"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
          >
            <option value="" />
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.scores?.length || 0} equipes)
              </option>
            ))}
          </select>
          <br />
          <label htmlFor="duration">Duração do round total, em minutos:</label>
          <input
            id="duration"
            type="number"
            min="1"
            className="form-control"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <br />
          <label htmlFor="arenas">
            Arenas disponíveis:
            <br />
            <small>(Ex: "1, 2, 3, 4, 5, 6" ou "D, E, F, G")</small>
          </label>
          <input
            id="arenas"
            className="form-control"
            value={arenas}
            onChange={(e) => setArenas(e.target.value)}
          />
          <br />
          <div className="panel panel-warning">
            <div className="panel-heading">
              <h3 className="panel-title">Horários de Pausa</h3>
            </div>
            <div className={'panel-body' + (!valid ? ' has-error' : '')}>
              <p>
                <small>
                  Insira os períodos de pausa, ex: "12:00-13:00, 16:00-16:30". <br />
                  Estes horários serão descartados no momento de gerar os rounds.
                </small>
              </p>
              <input
                aria-label="Horários de Pausa"
                className="form-control"
                value={pauses}
                onChange={(e) => setPauses(e.target.value)}
              />
              {valid &&
                periods.map(([start, end], i) => (
                  <span key={i} className="label label-warning">
                    {minuteToTime(start)} até {minuteToTime(end)}
                  </span>
                ))}
            </div>
          </div>
          {rounds.map((r, i) => (
            <div className="panel panel-primary" key={r}>
              <div className="panel-heading">
                <h3 className="panel-title">Rodada {r}</h3>
              </div>
              <div className="panel-body">
                {result.finalRodadasErrors?.[r] && (
                  <div className="alert alert-danger">
                    O horário de início desta rodada é anterior ao término da rodada {r - 1}
                  </div>
                )}
                <div className="form-group">
                  <div className="input-group input-group-sm">
                    <span className="input-group-addon">◷ Início</span>
                    <input
                      aria-label={'Início da rodada ' + r}
                      className="form-control"
                      value={starts[i]}
                      onChange={(e) => setStarts(starts.map((x, j) => (i === j ? e.target.value : x)))}
                    />
                    <span className="input-group-addon">
                      Término:{' '}
                      {Number.isFinite(result.finalRodadas?.[r])
                        ? minuteToTime(result.finalRodadas[r])
                        : 'Inválido'}
                    </span>
                  </div>
                </div>
                {names.map((name, j) => (
                  <div key={j} className="form-group">
                    <div className="btn-group btn-group-justified">
                      <span className="input-group-addon" style={{ fontSize: '70%' }}>
                        {name}
                      </span>
                      {['Vazia', 'Fácil', 'Médio', 'Difícil'].map((s, n) => (
                        <label
                          key={s}
                          className={'btn btn-default btn-xs' + (level(r, j) === n ? ' active' : '')}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            checked={level(r, j) === n}
                            onChange={() => setLevels({ ...levels, [r + '-' + j]: n })}
                          />
                          <small>{s}</small>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="col-md-8 col-sm-7 print-full-width">
          <button className="btn btn-warning btn-sm pull-right hidden-print" onClick={() => print(null)}>
            ▣ Imprimir Tabelas
          </button>
          <div className="clearfix" />
          <br />
          {[error, ...result.errors].filter(Boolean).map((s) => (
            <div className="alert alert-danger" key={s}>
              {s}
            </div>
          ))}
          {result.tables.map((matrix, i) => {
            const title = table.name + ' - Rodada ' + (i + 1);
            return (
              <div
                key={i}
                className={
                  'panel panel-info print-avoid-break' +
                  (printIndex !== null && i !== printIndex ? ' hidden-print' : '')
                }
              >
                <div className="panel-heading">
                  <div className="pull-right hidden-print">
                    <button className="btn btn-info btn-xs" onClick={() => download(matrix, title)}>
                      Baixar CSV
                    </button>{' '}
                    <button
                      className="btn btn-info btn-xs"
                      onClick={() =>
                        prompt(
                          'Tecle ctrl + c para copiar a tabela abaixo. Depois, cole em uma "MessageView" para mostrar às equipes os horários.',
                          '# ' + title + '\n' + markdownTable(matrix),
                        )
                      }
                    >
                      Copiar Markdown (Views)
                    </button>{' '}
                    <button className="btn btn-info btn-xs" onClick={() => print(i)}>
                      Imprimir
                    </button>
                  </div>
                  <h3 className="panel-title">{title}</h3>
                </div>
                <table className="table table-condensed table-bordered">
                  <tbody>
                    {matrix.map((row, j) => (
                      <tr key={j} style={j === 0 ? { fontWeight: 'bold' } : undefined}>
                        {row.map((cell, k) => (
                          <td key={k}>
                            <small>{cell}</small>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
