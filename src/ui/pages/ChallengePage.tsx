import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTables, updateScore } from '../../lib/api';
import type { ScoreRow, TournamenterTable } from '../../types';
import { ErrorAlert, LoadingAlert } from '../components/LegacyPanel';

function decodeChallenges(level: 1 | 2) {
  const initializer = level === 1 ? window.INITIALIZER1 : window.INITIALIZER2;
  if (!initializer || !window.Tokens) {
    return [];
  }
  return initializer.map((encoded) => window.Tokens!.decode(window.Tokens!.decode(encoded)));
}

export function ChallengePage() {
  const queryClient = useQueryClient();
  const tablesQuery = useQuery({ queryKey: ['tables'], queryFn: fetchTables });
  const [selectedTable, setSelectedTable] = useState<TournamenterTable | null>(null);
  const [selectedScore, setSelectedScore] = useState<ScoreRow | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const updateMutation = useMutation({
    mutationFn: ({ score, body }: { score: ScoreRow; body: Partial<ScoreRow> }) =>
      updateScore(score.id, body),
    onSuccess: async (score) => {
      setSelectedScore((current) => (current ? { ...current, ...score } : current));
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: () => setError('Falha ao gerar scores'),
  });

  const filteredScores = useMemo(() => {
    const term = search.toLowerCase();
    return (selectedTable?.scores || []).filter((score) =>
      `${score.team?.name || ''} ${score.team?.country || ''}`.toLowerCase().includes(term),
    );
  }, [selectedTable, search]);

  function selectTable(table: TournamenterTable | null) {
    setError('');
    setSelectedTable(table);
    setSelectedScore(null);
  }

  function selectScore(score: ScoreRow) {
    setError('');
    setSelectedScore(score);
  }

  function generateChallenge(score: ScoreRow, challengeId: 1 | 2 | 3) {
    setError('');
    const teamName = score.team?.name || '';
    if (!teamName) {
      setError(
        'O nome desta equipe não está definido, verifique se a equipe possui um nome válido',
      );
      return;
    }
    const teamNivel = teamName[0] === '1' ? 1 : teamName[0] === '2' ? 2 : null;
    if (!teamNivel) {
      setError(
        'Não foi possível identificar o nível a partir do nome da equipe. \nUse o formato "1 - equipe" ou "2 - equipe" para indicar o nível 1 ou 2.',
      );
      return;
    }
    const ok = window.confirm(
      `Tem certeza de que deseja gerar o desafio ${challengeId} da equipe ${teamName}?`,
    );
    if (!ok) return;

    const possibleChallenges = decodeChallenges(teamNivel).filter(
      (challenge) => challenge !== score.desafio1,
    );
    const challenge =
      possibleChallenges[Math.floor(Math.random() * possibleChallenges.length)] ||
      'Desafio Surpresa';
    updateMutation.mutate({
      score,
      body: {
        [`desafio${challengeId}`]: challenge,
      } as Partial<ScoreRow>,
    });
  }

  return (
    <div className="tournamenter-obr-app">
      <div className="container hide-until-loaded">
        <h2>Gerenciador de Desafios</h2>
        <hr />
        <p>
          <small style={{ color: 'rgba(0,0,0,0.6)' }}>
            Selecione a Tabela &gt; Equipe e visualize ou gere desafios para equipes.
          </small>
        </p>
        <ErrorAlert error={error} />
        {tablesQuery.isLoading ? <LoadingAlert /> : null}
        <div className="row">
          <div className="col-md-6 col-sm-6" hidden={Boolean(selectedTable)}>
            <h4>1) Selecione a Tabela</h4>
            <hr />
            <div className="list-group">
              {(tablesQuery.data || []).map((table) => (
                <button
                  type="button"
                  key={table.id}
                  className="list-group-item"
                  onClick={() => selectTable(table)}
                >
                  {table.name}
                  <span className="pull-right glyphicon glyphicon-chevron-right" />
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-6 col-sm-6" hidden={!selectedTable}>
            <h4>
              1) Tabela: {selectedTable?.name}
              <div className="pull-right">
                <button
                  className="btn btn-danger btn-sm"
                  type="button"
                  onClick={() => selectTable(null)}
                >
                  <span className="glyphicon glyphicon-remove" /> Modificar Tabela
                </button>
              </div>
            </h4>
            <hr />
            <h4>2) Selecione a Equipe</h4>
            <hr />
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <span className="input-group-btn">
                <button className="btn btn-info" type="button" onClick={() => setSearch('')}>
                  Limpar
                </button>
              </span>
            </div>
            <br />
            <div className="panel panel-default" style={{ maxHeight: 350, overflowY: 'scroll' }}>
              <div className="list-group">
                {filteredScores.map((score) => (
                  <button
                    type="button"
                    key={score.id}
                    className={`list-group-item ${score.id === selectedScore?.id ? 'active' : ''}`}
                    onClick={() => selectScore(score)}
                  >
                    <div className="pull-right">
                      {[1, 2, 3].map((id) => {
                        const done = Boolean(score[`desafio${id}` as keyof ScoreRow]);
                        return (
                          <span
                            key={id}
                            style={{ marginRight: 8 }}
                            className={`label ${done ? 'label-success' : 'label-warning'}`}
                          >
                            <span
                              className={`glyphicon ${done ? 'glyphicon-ok' : 'glyphicon-lock'}`}
                            />
                          </span>
                        );
                      })}
                    </div>
                    {score.team?.name || '?'}
                    <br />
                    <small style={{ color: 'rgba(0,0,0,0.5)' }}>{score.team?.country}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-sm-6" hidden={!selectedScore}>
            <h4>3) Desafios</h4>
            <hr />
            {[1, 2, 3].map((id) => {
              const key = `desafio${id}` as keyof ScoreRow;
              const challenge = selectedScore?.[key] as string | undefined;
              return (
                <div key={id} className={challenge ? 'alert alert-success' : 'alert alert-warning'}>
                  {!challenge ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!selectedScore || updateMutation.isPending}
                      onClick={() =>
                        selectedScore && generateChallenge(selectedScore, id as 1 | 2 | 3)
                      }
                    >
                      Gerar desafio {id}
                    </button>
                  ) : (
                    <div style={{ fontWeight: 'bold' }}>{challenge}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
