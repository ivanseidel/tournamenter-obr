import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTeam,
  fetchLastSync,
  fetchOlimpoTeams,
  fetchSyncConfig,
  fetchTeams,
  saveSyncConfig,
  syncNow,
  updateTeam,
} from '../../lib/api';
import type { SyncConfig, Team } from '../../types';
import { ErrorAlert, LoadingAlert, SuccessAlert } from '../components/LegacyPanel';

type ImportAction = {
  action: 'create' | 'update';
  msg: string;
  team: Partial<Team>;
  status?: 'success' | 'error';
};

const ObrConfigProps: Array<keyof SyncConfig> = ['url', 'sync', 'method', 'interval'];

function countBy<T extends string>(items: Array<Record<string, unknown>>, key: string) {
  return items.reduce<Record<T, number>>(
    (acc, item) => {
      const value = item[key] as T;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function ConfigPage() {
  return (
    <div className="tournamenter-obr-app">
      <div className="container hide-until-loaded">
        <div className="col-md-6" style={{ marginTop: 42 }}>
          <ImportarEquipes />
        </div>
        <div className="col-md-6" style={{ marginTop: 42 }}>
          <ExportarDados />
        </div>
      </div>
    </div>
  );
}

function ImportarEquipes() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importEventToken, setImportEventToken] = useState('');
  const [actions, setActions] = useState<ImportAction[] | null>(null);
  const [executing, setExecuting] = useState(false);
  const [canCommit, setCanCommit] = useState(false);

  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams });
  const teamsToImportQuery = useQuery({
    queryKey: ['olimpo-teams', importEventToken],
    queryFn: () => fetchOlimpoTeams(importEventToken),
    enabled: Boolean(importEventToken),
  });

  const actionsStats = useMemo(
    () => countBy<'create' | 'update'>(actions || [], 'action'),
    [actions],
  );
  const progress = useMemo(() => {
    if (!actions?.length) return 0;
    const successCount = actions.filter((action) => action.status === 'success').length;
    return Math.round((successCount / actions.length) * 100);
  }, [actions]);

  function diffTeams() {
    setError('');
    setSuccess('');
    setActions(null);

    const currentTeams = teamsQuery.data || [];
    const importPayload = teamsToImportQuery.data;
    if (!importPayload?.teams) {
      setError('Falha ao carregar equipes do Sistema Olimpo.');
      return;
    }

    const lastDigitMatch = importPayload.name?.join(' ').split('').reverse().join('').match(/(\d)/);
    const lastDigit = lastDigitMatch ? lastDigitMatch[1] : '?';
    const commits = getCommits(
      currentTeams,
      importPayload.teams,
      lastDigit,
      importEventToken,
      importPayload.id,
    );
    setActions(commits);
    setCanCommit(commits.length > 0);
    setSuccess(
      commits.length === 0
        ? 'Nenhuma diferença encontrada. Equipes já estão sincronizados'
        : 'Diferenças encontradas. Verifique e execute as mudanças (passo 2)',
    );
  }

  async function executeCommits() {
    if (!actions || executing) return;
    setExecuting(true);
    setCanCommit(false);
    setError('');
    setSuccess('');
    const nextActions = [...actions];
    try {
      for (let index = 0; index < nextActions.length; index += 1) {
        const commit = nextActions[index];
        if (commit.action === 'create') {
          await createTeam(commit.team);
        } else {
          await updateTeam(commit.team);
        }
        nextActions[index] = { ...commit, status: 'success' };
        setActions([...nextActions]);
      }
      setSuccess('Importação finalizada com sucesso!');
      await teamsQuery.refetch();
    } catch (err) {
      setError(`Falha ao executar commit: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <>
      <h2>Importar Equipes</h2>
      <hr />
      <p>
        <small style={{ color: 'rgba(0,0,0,0.6)' }}>
          Importe todas as equipes do seu regional específico para o Tournamenter.
        </small>
      </p>
      <ErrorAlert error={error} />
      <SuccessAlert message={success} />
      <label>Token do Evento para importar equipes:</label>
      <div className="form-group row">
        <div className="col-md-6 col-lg-12">
          <input
            className="form-control"
            type="text"
            value={importEventToken}
            onChange={(event) => setImportEventToken(event.target.value)}
          />
        </div>
        <div className="col-md-6" style={{ marginTop: 8 }}>
          {teamsToImportQuery.isSuccess && teamsToImportQuery.data?.teams?.length ? (
            <span className="label label-success" style={{ fontSize: 16 }}>
              {teamsToImportQuery.data.teams.length} Equipes
            </span>
          ) : null}
          {teamsToImportQuery.isError ? (
            <span className="label label-danger" style={{ fontSize: 16 }}>
              Falha ao Carregar
            </span>
          ) : null}
          {teamsToImportQuery.isFetching ? (
            <span className="label label-warning" style={{ fontSize: 16 }}>
              Carregando...
            </span>
          ) : null}
        </div>
      </div>
      <div className="form-group">
        <button
          type="button"
          onClick={diffTeams}
          disabled={!importEventToken || !teamsToImportQuery.data || executing}
          className="btn btn-primary btn-sm btn-block"
        >
          Verificar Diferenças (passo 1)
        </button>
      </div>
      {actions?.length ? (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">
              Alterações a serem feitas
              <button
                type="button"
                style={{ marginTop: -3 }}
                className="pull-right btn btn-success btn-xs"
                disabled={executing || !canCommit}
                onClick={executeCommits}
              >
                Executar (passo 2)
              </button>
            </h3>
          </div>
          {executing ? (
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          ) : null}
          <div className="panel-body">
            <ul>
              {Object.entries(actionsStats).map(([action, value]) => (
                <li key={action}>
                  {action}: {value}
                </li>
              ))}
            </ul>
          </div>
          <ul className="list-group">
            {actions.map((action, index) => (
              <li className="list-group-item" key={`${action.action}-${action.msg}-${index}`}>
                <span className="label label-info" style={{ marginRight: 8 }}>
                  {action.action}
                </span>
                {action.msg}
                {action.status ? (
                  <span className="pull-right label label-success">{action.status}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function getCommits(
  teams: Team[],
  newTeams: Array<Team & { id: string | number }>,
  level: string,
  token: string,
  stepId: string | number,
) {
  const actions: ImportAction[] = [];
  newTeams.forEach((newTeam) => {
    const team = teams.find((candidate) => String(newTeam.id) === String(candidate.olimpoId));
    const teamObj = {
      ...newTeam,
      id: team?.id,
      olimpoId: newTeam.id,
      stepId,
      token,
      name: `${level} - ${newTeam.name}`,
      country: `${newTeam.city} - ${newTeam.state}`,
    };
    if (!team) {
      actions.push({
        action: 'create',
        msg: newTeam.name || '',
        team: { ...teamObj, id: undefined },
      });
      return;
    }
    if (isDifferent(newTeam, team)) {
      actions.push({ action: 'update', msg: `${team.name} -> ${teamObj.name}`, team: teamObj });
    }
  });
  return actions;
}

function isDifferent(a: Team, b: Team) {
  return ['name', 'city', 'state'].some((key) => {
    const left = a[key as keyof Team];
    const right = b[key as keyof Team];
    return left !== undefined && right !== undefined && String(left) !== String(right);
  });
}

function ExportarDados() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsSave, setNeedsSave] = useState(false);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    url: '',
    sync: false,
    method: 'POST',
    interval: 600,
  });

  const configQuery = useQuery({ queryKey: ['obr-sync'], queryFn: fetchSyncConfig });
  const lastSyncQuery = useQuery({
    queryKey: ['obr-last-sync'],
    queryFn: fetchLastSync,
    refetchInterval: 5000,
  });
  const saveMutation = useMutation({
    mutationFn: saveSyncConfig,
    onSuccess: async () => {
      setNeedsSave(false);
      await queryClient.invalidateQueries({ queryKey: ['obr-sync'] });
    },
    onError: () => {
      setNeedsSave(true);
      setError('Falha ao salvar!');
    },
  });

  useEffect(() => {
    if (configQuery.data) {
      setSyncConfig(configQuery.data);
      setNeedsSave(false);
    }
  }, [configQuery.data]);

  function updateConfig(key: keyof SyncConfig, value: string | boolean) {
    setSyncConfig((current) => ({ ...current, [key]: value }));
    setNeedsSave(true);
  }

  async function sync() {
    setError('');
    setSuccess('');
    try {
      await syncNow();
      setSuccess('Sincronizado com sucesso!');
      await lastSyncQuery.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const lastSync = lastSyncQuery.data?.timestamp
    ? new Date(Number(lastSyncQuery.data.timestamp)).toLocaleString('pt-BR')
    : 'Nunca';

  return (
    <>
      <h2>Exportar Dados</h2>
      <hr />
      {configQuery.isLoading ? <LoadingAlert /> : null}
      <ErrorAlert error={error} />
      <SuccessAlert message={success} />
      <div className="form-group">
        <label>URL de envio (Somente a organização nacional da OBR pode fornece-la)</label>
        <input
          className="form-control"
          value={syncConfig.url || ''}
          onChange={(event) => updateConfig('url', event.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Método</label>
        <select
          className="form-control"
          value={syncConfig.method || 'POST'}
          onChange={(event) => updateConfig('method', event.target.value)}
        >
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
        </select>
      </div>
      <div className="form-group">
        <label>Intervalo de sincronização (segundos)</label>
        <input
          className="form-control"
          type="number"
          value={syncConfig.interval}
          onChange={(event) => updateConfig('interval', event.target.value)}
        />
      </div>
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            checked={syncConfig.sync === true || syncConfig.sync === 'true'}
            onChange={(event) => updateConfig('sync', event.target.checked)}
          />{' '}
          Sincronizar automaticamente
        </label>
      </div>
      <p>
        <small>Última sincronização: {lastSync}</small>
      </p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!needsSave || saveMutation.isPending}
        onClick={() => saveMutation.mutate(pickConfig(syncConfig))}
      >
        Salvar
      </button>{' '}
      <button type="button" className="btn btn-success" onClick={sync}>
        Sincronizar agora
      </button>
    </>
  );
}

function pickConfig(config: SyncConfig) {
  return ObrConfigProps.reduce<SyncConfig>(
    (acc, key) => ({
      ...acc,
      [key]: config[key],
    }),
    { sync: false, interval: 600 },
  );
}
