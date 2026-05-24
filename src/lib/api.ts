import type { ScoreRow, SyncConfig, Team, TournamenterTable } from '../types';

const TOURNAMENTER_URL = '';
const EXTERNAL_API_BASE = 'https://olimpo.robocup.org.br/api/events/steps';

type RequestOptions = {
  method?: string;
  body?: unknown;
};

function queryString(params: Record<string, unknown>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'object') {
      query.set(key, JSON.stringify(value));
    } else {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method || (body ? 'POST' : 'GET'),
    headers,
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Falha HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return (await response.text()) as T;
  }

  return response.json() as Promise<T>;
}

export function fetchTables() {
  return requestJson<TournamenterTable[]>(`${TOURNAMENTER_URL}/tables`);
}

export function fetchScore(id: string) {
  return requestJson<ScoreRow>(`${TOURNAMENTER_URL}/scores/${id}`);
}

export function saveScoreColumn(params: {
  id: string;
  number: number;
  value: number;
  data: unknown;
}) {
  const query = queryString({ value: params.value, data: params.data });
  return requestJson<ScoreRow>(`${TOURNAMENTER_URL}/scores/${params.id}/${params.number}?${query}`);
}

export function updateScore(id: string, body: Partial<ScoreRow>) {
  return requestJson<ScoreRow>(`${TOURNAMENTER_URL}/scores/${id}`, {
    method: 'PUT',
    body: { id, ...body },
  });
}

export function fetchTeams() {
  return requestJson<Team[]>(`${TOURNAMENTER_URL}/teams?limit=10000`);
}

export function createTeam(team: Partial<Team>) {
  return requestJson<Team>(`${TOURNAMENTER_URL}/teams`, { method: 'POST', body: team });
}

export function updateTeam(team: Partial<Team>) {
  return requestJson<Team>(`${TOURNAMENTER_URL}/teams/${team.id || ''}`, {
    method: 'PUT',
    body: team,
  });
}

export function fetchOlimpoEvents() {
  return requestJson<unknown[]>(`${EXTERNAL_API_BASE}/score`);
}

export function fetchOlimpoTeams(token: string) {
  return requestJson<{
    id: string | number;
    name?: string[];
    teams: Array<Team & { id: string | number }>;
  }>(`${EXTERNAL_API_BASE}/participants?${queryString({ token })}`);
}

export function fetchSyncConfig() {
  return requestJson<SyncConfig>(`${TOURNAMENTER_URL}/obr-sync`);
}

export function saveSyncConfig(config: SyncConfig) {
  return requestJson<SyncConfig>(`${TOURNAMENTER_URL}/obr-sync?${queryString(config)}`);
}

export function syncNow() {
  return requestJson<string>(`${TOURNAMENTER_URL}/obr-sync?now=true`);
}

export function fetchLastSync() {
  return requestJson<{ timestamp: string | number | null }>(`${TOURNAMENTER_URL}/obr-last-sync`);
}
