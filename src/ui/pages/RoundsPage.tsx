import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseTime, tableToCsv } from '../../domain/rounds';
import { fetchTables } from '../../lib/api';
import type { TimetableResult } from '../../types';
import { ErrorAlert, LoadingAlert } from '../components/LegacyPanel';

type RoundsConfig = {
  arenas: string[];
  uso: Record<string, Record<number, number>>;
  periodos: Array<[number, number] | false>;
  inicios: Array<number | false>;
  duration: number;
};

function parsePeriod(value: string): [number, number] | false {
  if (!value) return false;
  const times = value.split('-');
  if (times.length !== 2) return false;
  const start = parseTime(times[0].trim());
  const end = parseTime(times[1].trim());
  if (start === false || end === false || end <= start) return false;
  return [start, end];
}

function minuteToTime(value: number | false, invalid = 'Horário Inválido') {
  if (value === false || value === null || value === undefined) return invalid;
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}`;
}

const defaultUso: Record<string, Record<number, number>> = {
  '1': { 0: 1, 1: 2, 2: 3, 3: 1, 4: 2, 5: 3 },
  '2': { 0: 1, 1: 2, 2: 3, 3: 1, 4: 2, 5: 3 },
  '3': { 0: 1, 1: 2, 2: 3, 3: 1, 4: 2, 5: 3 },
};

export function RoundsPage() {
  const tablesQuery = useQuery({ queryKey: ['tables'], queryFn: fetchTables });
  const [selTable, setSelTable] = useState('');
  const [arenasRaw, setArenasRaw] = useState('1, 2, 3');
  const [iniciosRaw, setIniciosRaw] = useState(['09:00', '13:00', '16:00']);
  const [periodosRaw, setPeriodosRaw] = useState('12:00-13:00');
  const [duration, setDuration] = useState(10);
  const [uso, setUso] = useState(defaultUso);
  const [printTable, setPrintTable] = useState<number | null>(null);

  const config = useMemo<RoundsConfig>(() => {
    const arenas = arenasRaw
      .split(',')
      .filter(Boolean)
      .map((txt) => `Arena ${txt.trim()}`);
    const periodos = periodosRaw
      .split(',')
      .filter(Boolean)
      .map((periodo) => parsePeriod(periodo.trim()));
    return {
      arenas,
      uso,
      periodos,
      inicios: iniciosRaw.map(parseTime),
      duration,
    };
  }, [arenasRaw, duration, iniciosRaw, periodosRaw, uso]);

  const selectedTable = selTable ? tablesQuery.data?.[Number(selTable)] || null : null;
  const result = useMemo<TimetableResult>(() => {
    if (!window.generateTimetable) {
      return { errors: ['Gerador de horários não foi carregado.'], tables: [] };
    }
    return window.generateTimetable(config, selectedTable);
  }, [config, selectedTable]);
  const periodosRawValid = config.periodos.every(Boolean);

  function copyMarkdown(table: string[][], nivel: string, rodada: number) {
    const markdown = window.markdownTable
      ? window.markdownTable(table)
      : table.map((row) => row.join(' | ')).join('\n');
    window.prompt(
      'Tecle `ctrl + c` para copiar a tabela abaixo. Depois, cole em uma "MessageView" para mostrar as equipes os horários.',
      `# ${nivel}: Rodada ${rodada}\n${markdown}`,
    );
  }

  function downloadCSV(table: string[][], nivel: string, rodada: number) {
    const csv = tableToCsv(table);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${nivel}: Rodada ${rodada}`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function print(index: number | null) {
    setPrintTable(index);
    window.setTimeout(window.print, 100);
    window.setTimeout(() => setPrintTable(null), 2000);
  }

  function updateUso(rodada: string, arenaIndex: number, value: number) {
    setUso((current) => ({
      ...current,
      [rodada]: {
        ...current[rodada],
        [arenaIndex]: value,
      },
    }));
  }

  return (
    <div className="tournamenter-obr-app">
      <div className="container hide-until-loaded">
        <h2 className="hidden-print">Gerador de horários de Rounds</h2>
        <hr className="hidden-print" />
        <p className="hidden-print">
          <small style={{ color: 'rgba(0,0,0,0.6)' }}>
            Gere tabelas de horários para cada um os 3 rounds, com suas configurações.
          </small>
        </p>
        {tablesQuery.isLoading ? <LoadingAlert /> : null}
        {(result.errors || []).map((error) => (
          <ErrorAlert key={error} error={error} />
        ))}
        <div className="row">
          <div className="col-md-4 col-sm-5 hidden-print">
            <label>Tabela do Tournamenter para gerar: (Nível)</label>
            <select
              className="form-control"
              value={selTable}
              onChange={(event) => setSelTable(event.target.value)}
            >
              <option value="">Selecione</option>
              {(tablesQuery.data || []).map((table, index) => (
                <option value={index} key={table.id}>
                  {table.name} ({table.scores.length} equipes)
                </option>
              ))}
            </select>
            <br />
            <label>Duração do round total, em minutos:</label>
            <input
              type="number"
              className="form-control"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              placeholder="Duração do round em minutos"
            />
            <br />
            <label>
              Arenas disponíveis: <br />
              <small style={{ fontWeight: 'normal' }}>
                (Ex: "1, 2, 3, 4, 5, 6" ou "D, E, F, G")
              </small>
            </label>
            <input
              type="text"
              className="form-control"
              value={arenasRaw}
              onChange={(event) => setArenasRaw(event.target.value)}
              placeholder="Arenas disponíveis"
            />
            <br />
            <div className={`panel ${periodosRawValid ? 'panel-warning' : 'panel-danger'}`}>
              <div className="panel-heading">Horários de pausa</div>
              <div className="panel-body">
                <input
                  className="form-control"
                  value={periodosRaw}
                  onChange={(event) => setPeriodosRaw(event.target.value)}
                />
                <br />
                {config.periodos.map((periodo, index) => (
                  <span key={index} className="label label-warning" style={{ marginRight: 4 }}>
                    {periodo
                      ? `${minuteToTime(periodo[0])}-${minuteToTime(periodo[1])}`
                      : 'Inválido'}
                  </span>
                ))}
              </div>
            </div>
            {[1, 2, 3].map((rodada, index) => (
              <div key={rodada} className="panel panel-default">
                <div className="panel-heading">Rodada {rodada}</div>
                <div className="panel-body">
                  <div
                    className={`form-group ${config.inicios[index] ? 'has-success' : 'has-error'}`}
                  >
                    <label>
                      <span className="glyphicon glyphicon-time" /> Início
                    </label>
                    <input
                      className="form-control"
                      value={iniciosRaw[index]}
                      onChange={(event) => {
                        const next = [...iniciosRaw];
                        next[index] = event.target.value;
                        setIniciosRaw(next);
                      }}
                    />
                  </div>
                  {config.arenas.map((arena, arenaIndex) => (
                    <div key={`${rodada}-${arena}`} className="form-group">
                      <label>{arena}</label>
                      <div className="btn-group btn-group-justified">
                        {[
                          [0, 'Vazia'],
                          [1, 'Fácil'],
                          [2, 'Médio'],
                          [3, 'Difícil'],
                        ].map(([value, label]) => (
                          <button
                            type="button"
                            key={value}
                            className={`btn btn-default btn-xs ${
                              uso[String(rodada)]?.[arenaIndex] === Number(value) ? 'active' : ''
                            }`}
                            onClick={() => updateUso(String(rodada), arenaIndex, Number(value))}
                          >
                            <small>{label}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-8 col-sm-7 print-full-width">
            {result.tables ? (
              <div className="hidden-print">
                <button type="button" className="btn btn-default" onClick={() => print(null)}>
                  Imprimir Todas
                </button>
              </div>
            ) : null}
            {(result.tables || []).map((table, index) => (
              <div
                key={index}
                className={`print-avoid-break ${printTable !== null && printTable !== index ? 'hidden-print' : ''}`}
              >
                <h3>
                  {selectedTable?.name}: Rodada {index + 1}
                  <span className="pull-right hidden-print">
                    <button
                      className="btn btn-default btn-xs"
                      onClick={() => downloadCSV(table, selectedTable?.name || '', index + 1)}
                    >
                      CSV
                    </button>{' '}
                    <button
                      className="btn btn-default btn-xs"
                      onClick={() => copyMarkdown(table, selectedTable?.name || '', index + 1)}
                    >
                      Markdown
                    </button>{' '}
                    <button className="btn btn-default btn-xs" onClick={() => print(index)}>
                      Imprimir
                    </button>
                  </span>
                </h3>
                <table className="table table-bordered table-condensed">
                  <tbody>
                    {table.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? 'header' : ''}>
                        {row.map((col, colIndex) => (
                          <td key={`${rowIndex}-${colIndex}`}>
                            <small>{col}</small>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
