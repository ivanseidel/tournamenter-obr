import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchScore, fetchTables, saveScoreColumn } from '../../lib/api';
import type { ScoreRow, TournamenterTable } from '../../types';
import {
  activeScorer,
  cloneModel,
  sumSpecial,
  type RescueScoreModel,
  type ScoredModel,
} from '../../domain/scorers';
import { ButtonGroup } from '../components/ButtonGroup';
import { ErrorAlert, LoadingAlert, Thumbnail } from '../components/LegacyPanel';

const scorer = activeScorer();
const checkboxGroups = [
  { group: 'passage', title: 'Passagem', keys: [11, 12, 13, 14], suffix: '' },
  { group: 'obstacles', title: 'Obstáculos', keys: [11, 12, 13, 14, 15, 16], suffix: 'º' },
  { group: 'seesaw', title: 'Gangorras', keys: [11, 12, 13, 14, 15, 16], suffix: 'º' },
  {
    group: 'speedbump',
    title: 'Redutores',
    keys: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    suffix: 'º',
  },
  {
    group: 'intersection',
    title: 'Interseções',
    keys: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    suffix: 'º',
  },
  { group: 'gaps', title: 'Gap', keys: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], suffix: 'º' },
  { group: 'becos', title: 'Becos sem saída', keys: [11, 12, 13, 14, 15, 16], suffix: 'º' },
  {
    group: 'rampas',
    title: 'Rampas',
    keys: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    suffix: 'º',
  },
];

function numberRange(max: number) {
  return Array.from({ length: max + 1 }, (_, index) => index);
}

function getGroup(model: RescueScoreModel, group: string) {
  return model[group] || {};
}

function getNumber(model: RescueScoreModel, group: string, key: string | number) {
  return Number(getGroup(model, group)[String(key)] || 0);
}

function useScorerTimer() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setValue((current) => current + 1), 100);
    return () => window.clearInterval(id);
  }, [running]);

  return { value, seconds: value / 10, running, setRunning, setValue };
}

export function ScorerPage() {
  const [scoreData, setScoreData] = useState<RescueScoreModel>(() => cloneModel(scorer.model));
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'save' | 'load' | null>(null);
  const timer = useScorerTimer();

  const computed = useMemo(() => {
    const working = cloneModel(scoreData);
    const scored = scorer.score(working);
    return { working, scored };
  }, [scoreData]);

  function setField(group: string, key: string | number, value: number | boolean) {
    setScoreData((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [String(key)]: value,
      },
    }));
  }

  function resetScore(confirmReset: boolean) {
    if (confirmReset && !window.confirm('Are you sure you want to delete this?')) {
      return;
    }
    setScoreData(cloneModel(scorer.model));
    timer.setValue(0);
    timer.setRunning(false);
    setSelectedTeamName(null);
  }

  const isBlank = timer.value === 0 && computed.scored.total === 0;
  const progress = Math.min(100, (timer.value / (scorer.totalTime * 10)) * 100);

  return (
    <div className="tournamenter-obr-app">
      <nav
        className={`navbar navbar-default navbar-fixed-top score-navbar ${
          timer.value > scorer.totalTime * 10 ? 'ended' : ''
        }`}
        role="navigation"
      >
        <div className="container">
          <div className="navbar-text pull-left" style={{ width: 70, fontSize: 22, margin: 8 }}>
            {timer.seconds.toFixed(1)}s
          </div>

          <div className="btn-group pull-left">
            <button
              type="button"
              className={`btn navbar-btn btn-success ${timer.running ? 'disabled' : ''}`}
              onClick={() => setRunningIf(timer, true)}
            >
              <span className="glyphicon glyphicon-play" />{' '}
              <span className="hidden-xs">Iniciar</span>
            </button>
            <button
              type="button"
              className={`btn navbar-btn btn-info ${!timer.running ? 'disabled' : ''}`}
              onClick={() => timer.setRunning(false)}
            >
              <span className="glyphicon glyphicon-pause" />{' '}
              <span className="hidden-xs">Pausar</span>
            </button>
            <button
              type="button"
              className={`btn navbar-btn btn-warning ${
                timer.running || timer.value === 0 ? 'disabled' : ''
              }`}
              onClick={() => timer.setValue(0)}
            >
              <span className="glyphicon glyphicon-stop" /> <span className="hidden-xs">Zerar</span>
            </button>
          </div>

          <div className="btn-group navbar-btn pull-right">
            <button type="button" className="btn btn-default disabled" style={{ minWidth: 50 }}>
              <strong>{computed.scored.total}</strong>
            </button>
            <button
              type="button"
              className={`btn btn-danger ${timer.running ? 'disabled' : ''}`}
              onClick={() => resetScore(true)}
            >
              Zerar
            </button>
            <button
              type="button"
              className={`btn btn-success ${timer.running ? 'disabled' : ''}`}
              onClick={() => setModalMode('save')}
            >
              Salvar
            </button>
            <button
              type="button"
              className={`btn btn-success ${timer.running ? 'disabled' : ''}`}
              onClick={() => setModalMode('load')}
            >
              Carregar
            </button>
          </div>
        </div>
        <div style={{ backgroundColor: '#dadada', height: 4 }}>
          <div
            className={timer.value > scorer.totalTime * 10 - 480 ? 'progress-ending' : ''}
            style={{
              backgroundColor: '#1bb50d',
              height: 4,
              maxWidth: '100%',
              width: `${progress}%`,
            }}
          />
        </div>
      </nav>

      <div className="score-content">
        {selectedTeamName ? (
          <div className="container">
            <div className="alert alert-info">Pontuação carregada para {selectedTeamName}</div>
          </div>
        ) : null}
        {isBlank ? <WaitingPanel /> : null}
        {!isBlank ? (
          <ScorerForm
            model={scoreData}
            working={computed.working}
            scored={computed.scored}
            setField={setField}
            stopTimer={() => timer.setRunning(false)}
          />
        ) : null}
      </div>

      {modalMode ? (
        <ScoreModal
          mode={modalMode}
          scoreData={scoreData}
          total={computed.scored.total}
          time={Math.min(timer.seconds, scorer.totalTime)}
          onClose={() => setModalMode(null)}
          onLoad={(data, time, teamName) => {
            setScoreData(data);
            timer.setValue(Math.floor(time * 10));
            setSelectedTeamName(teamName);
            setModalMode(null);
          }}
        />
      ) : null}
    </div>
  );
}

function setRunningIf(timer: ReturnType<typeof useScorerTimer>, running: boolean) {
  timer.setRunning(running);
}

function WaitingPanel() {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1>Aguardando...</h1>
        <p>Para começar a pontuar, inicie o cronômetro</p>
        <p>Versão: {scorer.version}</p>
      </div>
    </div>
  );
}

type ScorerFormProps = {
  model: RescueScoreModel;
  working: RescueScoreModel;
  scored: ScoredModel;
  setField(group: string, key: string | number, value: number | boolean): void;
  stopTimer(): void;
};

function ScorerForm({ model, working, scored, setField, stopTimer }: ScorerFormProps) {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 col-sm-12">
          <Thumbnail>
            <h3>Ladrilhos</h3>
            <h4 style={{ marginTop: 16 }}>Ladrilho Inicial</h4>
            <div className="btn-group btn-group-justified">
              <ButtonGroup
                value={getNumber(model, 'squares', 'initial')}
                onChange={(value) => setField('squares', 'initial', value)}
                options={[
                  { value: 0, label: 'Não' },
                  { value: 1, label: 'Sim' },
                ]}
              />
              <span className="input-group-addon">
                {scoreValue(scored, 'squares', 'initial')} pts
              </span>
            </div>

            {[1, 2, 3, 4, 5, 6].map((mark) => (
              <div key={mark}>
                <h4>{mark}º Marcador</h4>
                <div className="row">
                  <div className="col-md-3 col-xs-4">
                    <p>Ladrilhos Obtidos</p>
                    <select
                      value={getNumber(model, 'squares', mark)}
                      onChange={(event) => setField('squares', mark, Number(event.target.value))}
                    >
                      {numberRange(50).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="score-points">{scoreValue(scored, 'squares', mark)} pts</span>
                  </div>

                  <div className="col-md-3 col-xs-4">
                    <p>Tentativa</p>
                    <select
                      value={getNumber(model, 'tentativa', mark)}
                      onChange={(event) => setField('tentativa', mark, Number(event.target.value))}
                    >
                      {numberRange(50).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </Thumbnail>
        </div>

        <div className="col-md-12 col-sm-12">
          <Thumbnail>
            {checkboxGroups.map((checkboxGroup) => (
              <CheckboxGroup
                key={checkboxGroup.group}
                group={checkboxGroup.group}
                title={checkboxGroup.title}
                keys={checkboxGroup.keys}
                suffix={checkboxGroup.suffix}
                model={model}
                scored={scored}
                setField={setField}
              />
            ))}
          </Thumbnail>

          <Thumbnail>
            <h2>Vítimas resgatadas</h2>
            {scorer.kind === 'nacional' ? (
              <NacionalVictims model={model} setField={setField} />
            ) : (
              <RegionalVictims model={model} setField={setField} />
            )}

            <h4>Desafio Surpresa</h4>
            <ButtonGroup
              value={getNumber(model, 'desafio_surpresa', 'completed')}
              onChange={(value) => setField('desafio_surpresa', 'completed', value)}
              options={[
                {
                  value: 0,
                  label:
                    scorer.kind === 'regional' && scorer.version.startsWith('Regional 2026')
                      ? 'Não'
                      : 'Nop',
                },
                { value: 1, label: 'Desafio resolvido' },
              ]}
            />

            <h4 style={{ marginTop: 16 }}>Bônus de saída</h4>
            <div className="btn-group btn-group-justified">
              <ButtonGroup
                value={getNumber(model, 'bonus_de_saida', 'final')}
                onChange={(value) => setField('bonus_de_saida', 'final', value)}
                options={[
                  { value: 0, label: 'Não' },
                  { value: 1, label: 'Sim' },
                ]}
              />
              <span className="input-group-addon">
                {scoreValue(scored, 'bonus_de_saida', 'final')} pts
              </span>
            </div>

            <h4>Multiplicador Obtido</h4>
            <span className="input-group-addon">
              {getNumber(working, 'multiplier', 'value') || 1}x
            </span>

            <button
              type="button"
              style={{ marginTop: 28 }}
              className="btn btn-lg btn-block navbar-btn btn-danger"
              onClick={stopTimer}
            >
              <span className="glyphicon glyphicon-pause" /> Parar Tempo
            </button>
          </Thumbnail>
        </div>
      </div>
    </div>
  );
}

function scoreValue(scored: ScoredModel, group: string, key: string | number) {
  const groupScore = scored[group];
  if (!groupScore || typeof groupScore === 'number') return 0;
  return groupScore[String(key)] || 0;
}

type CheckboxGroupProps = {
  title: string;
  group: string;
  keys: number[];
  suffix: string;
  model: RescueScoreModel;
  scored: ScoredModel;
  setField(group: string, key: string | number, value: boolean): void;
};

function CheckboxGroup({
  title,
  group,
  keys,
  suffix,
  model,
  scored,
  setField,
}: CheckboxGroupProps) {
  return (
    <>
      <h5>{title}</h5>
      <div className="btn-group btn-group-justified">
        {keys.map((key, index) => (
          <button
            type="button"
            key={key}
            className={`btn btn-default ${model[group]?.[String(key)] ? 'active' : ''}`}
            onClick={() => setField(group, key, !model[group]?.[String(key)])}
          >
            {index + 1}
            {suffix}
          </button>
        ))}
        <span className="input-group-addon">{sumSpecial(scored, group, keys)} pts</span>
      </div>
    </>
  );
}

function RegionalVictims({
  model,
  setField,
}: {
  model: RescueScoreModel;
  setField(group: string, key: string | number, value: number): void;
}) {
  return (
    <>
      <h4>
        Vítimas <span style={{ color: 'green' }}>Vivas</span> Entregue na{' '}
        <span style={{ color: 'green' }}>Área Verde</span>
      </h4>
      <ButtonGroup
        value={getNumber(model, 'victims_alive', 'total')}
        onChange={(value) => setField('victims_alive', 'total', value)}
        options={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
          { value: 2, label: '2' },
        ]}
      />

      <h4>
        Vítima <span style={{ color: 'red' }}>Morta</span> Entregue na{' '}
        <span style={{ color: 'red' }}>Área Vermelha</span>
      </h4>
      <ButtonGroup
        value={getNumber(model, 'victims_dead', 'total')}
        onChange={(value) => setField('victims_dead', 'total', value)}
        options={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
        ]}
      />

      <h4>
        Vítimas <span style={{ color: 'red' }}>Vivas</span> ou{' '}
        <span style={{ color: 'green' }}>Mortas</span> Entregue na Área Invertida
      </h4>
      <ButtonGroup
        value={getNumber(model, 'victims_switched', 'total')}
        onChange={(value) => setField('victims_switched', 'total', value)}
        options={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
        ]}
      />
    </>
  );
}

function NacionalVictims({
  model,
  setField,
}: {
  model: RescueScoreModel;
  setField(group: string, key: string | number, value: number): void;
}) {
  return (
    <>
      <h4>
        Vítimas Vivas Resgatadas na área de resgate <span style={{ color: 'green' }}>VERDE</span>
      </h4>
      <ButtonGroup
        value={getNumber(model, 'victims_alive', 'total')}
        onChange={(value) => setField('victims_alive', 'total', value)}
        options={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
          { value: 2, label: '2' },
        ]}
      />

      <h4>
        Vítima Morta salva na área de resgate <span style={{ color: 'red' }}>VERMELHA</span>, depois
        que TODAS as vivas foram salvas
      </h4>
      <ButtonGroup
        value={getNumber(model, 'victims_dead', 'total')}
        onChange={(value) => setField('victims_dead', 'total', value)}
        options={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
        ]}
      />
    </>
  );
}

type ScoreModalProps = {
  mode: 'save' | 'load';
  scoreData: RescueScoreModel;
  total: number;
  time: number;
  onClose(): void;
  onLoad(data: RescueScoreModel, time: number, teamName: string): void;
};

function ScoreModal({ mode, scoreData, total, time, onClose, onLoad }: ScoreModalProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<'selectTable' | 'selectRound' | 'selectTeam' | 'confirm'>(
    'selectTable',
  );
  const [selectedTable, setSelectedTable] = useState<TournamenterTable | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedScore, setSelectedScore] = useState<ScoreRow | null>(null);
  const [completeMission, setCompleteMission] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tablesQuery = useQuery({ queryKey: ['tables'], queryFn: fetchTables });

  const selectedIndex = selectedRound === null ? 0 : selectedRound * 2;
  const selectedTimeIndex = selectedRound === null ? 1 : selectedRound * 2 + 1;

  async function ok() {
    if (!selectedScore || selectedRound === null) return;
    setError(null);
    setSaving(true);
    try {
      if (mode === 'load') {
        const column = selectedScore.scores?.[String(selectedIndex)];
        const timeColumn = selectedScore.scores?.[String(selectedTimeIndex)];
        if (!column) throw new Error('Pontuação não encontrada para este round.');
        const parsed =
          typeof column.data === 'string'
            ? (JSON.parse(column.data) as RescueScoreModel)
            : (column.data as RescueScoreModel);
        onLoad(
          parsed,
          Number(timeColumn?.value || 0),
          selectedScore.team?.name || '<Equipe sem nome>',
        );
        return;
      }

      const isScoredAlready =
        selectedScore.scores?.[String(selectedIndex)] ||
        selectedScore.scores?.[String(selectedTimeIndex)];
      if (isScoredAlready) {
        const key = window.prompt(
          'Parece que esta equipe já possui uma pontuação neste round.\nConfirme com o código para substituir.',
        );
        if (key !== '1235') {
          window.alert('Código incorreto.');
          return;
        }
      }

      const finalTime = completeMission ? time : scorer.totalTime;
      await saveScoreColumn({
        id: selectedScore.id,
        number: selectedIndex,
        data: scoreData,
        value: total,
      });
      await saveScoreColumn({
        id: selectedScore.id,
        number: selectedTimeIndex,
        data: scoreData,
        value: Math.floor(finalTime),
      });
      const saved = await fetchScore(selectedScore.id);
      if (saved.scores?.[String(selectedIndex)]?.value !== total) {
        throw new Error('FALHA AO SALVAR #3. REFAÇA A OPERAÇÃO.');
      }
      if (saved.scores?.[String(selectedTimeIndex)]?.value !== Math.floor(finalTime)) {
        throw new Error('FALHA AO SALVAR #4. REFAÇA A OPERAÇÃO.');
      }
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      window.alert('OK! Salvo com sucesso.');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'FALHA AO SALVAR. REFAÇA A OPERAÇÃO.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop-react" />
      <div className="modal modal-react" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">
                {mode === 'save' ? 'Salvar Pontuação' : 'Carregar Pontuação'}
              </h4>
            </div>
            <div className="modal-body">
              <ErrorAlert error={error} />
              {tablesQuery.isLoading ? <LoadingAlert /> : null}
              {tablesQuery.error ? (
                <ErrorAlert error="FALHA AO BAIXAR EQUIPES E TABELAS. REFAÇA A OPERAÇÃO." />
              ) : null}
              {page === 'selectTable' ? (
                <div>
                  <h2>Selecione a Tabela</h2>
                  <div className="list-group">
                    {(tablesQuery.data || []).map((table) => (
                      <button
                        type="button"
                        key={table.id}
                        className={`list-group-item ${selectedTable?.id === table.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedTable(table);
                          setPage('selectRound');
                        }}
                      >
                        {table.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {page === 'selectRound' && selectedTable ? (
                <div>
                  <h2>Selecione o Round</h2>
                  <div className="list-group">
                    {['Round 1', 'Round 2', 'Round 3 ou Final'].map((round, index) => (
                      <button
                        type="button"
                        key={round}
                        className={`list-group-item ${selectedRound === index ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRound(index);
                          setPage('selectTeam');
                        }}
                      >
                        {round}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {page === 'selectTeam' && selectedTable && selectedRound !== null ? (
                <div>
                  <h2>Selecione a Equipe</h2>
                  <div className="list-group">
                    {[...(selectedTable.scores || [])]
                      .sort((a, b) => (a.team?.name || '').localeCompare(b.team?.name || ''))
                      .map((score) => (
                        <button
                          type="button"
                          key={score.id}
                          className={`list-group-item ${selectedScore?.id === score.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedScore(score);
                            setPage(mode === 'save' ? 'confirm' : 'selectTeam');
                          }}
                          onDoubleClick={() => {
                            setSelectedScore(score);
                            if (mode === 'load') void ok();
                          }}
                        >
                          {score.team?.name || '?'}
                          {score.scores?.[String(selectedIndex)] ? (
                            <span className="label label-danger pull-right">Já Pontuado</span>
                          ) : null}
                        </button>
                      ))}
                  </div>
                  {mode === 'load' ? (
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={!selectedScore || saving}
                      onClick={ok}
                    >
                      Carregar
                    </button>
                  ) : null}
                </div>
              ) : null}

              {page === 'confirm' && selectedScore ? (
                <div>
                  <h2>Confirmar</h2>
                  <p>
                    {selectedScore.team?.name} - Pontuação: <strong>{total}</strong>
                  </p>
                  <h4>Missão completa?</h4>
                  <ButtonGroup<number>
                    value={completeMission}
                    onChange={(value) => setCompleteMission(value)}
                    options={[
                      { value: 0, label: 'Não' },
                      { value: 1, label: 'Sim' },
                    ]}
                  />
                  <p style={{ marginTop: 12 }}>
                    Tempo: {completeMission ? time.toFixed(1) : scorer.totalTime}s
                  </p>
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              {page !== 'selectTable' ? (
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() =>
                    setPage(
                      page === 'confirm'
                        ? 'selectTeam'
                        : page === 'selectTeam'
                          ? 'selectRound'
                          : 'selectTable',
                    )
                  }
                >
                  Voltar
                </button>
              ) : null}
              {page === 'confirm' ? (
                <button type="button" className="btn btn-success" disabled={saving} onClick={ok}>
                  OK
                </button>
              ) : null}
              <button type="button" className="btn btn-warning" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
