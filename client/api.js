export async function request(url, options = {}) {
  const { body, ...rest } = options;
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body && { 'Content-Type': 'application/json', 'X-OBR-Pontuador': '1' }),
      ...rest.headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const json = response.headers.get('content-type')?.includes('json');
  const data = json ? await response.json() : await response.text();
  if (!response.ok || (response.redirected && !json)) {
    const error = new Error(
      data?.error ||
        (response.redirected ? 'Sua sessão expirou.' : 'Não foi possível concluir a operação.'),
    );
    error.status = response.redirected ? 401 : response.status;
    throw error;
  }
  return data;
}

export const volunteerBase = '/tournamenter-obr/voluntario-api';
export function volunteerLogout(artistic) {
  return request(volunteerBase + '/logout', { method: 'POST', body: {} })
    .then(() => location.replace('/tournamenter-obr/acesso' + (artistic ? '?modalidade=artistica' : '')))
    .catch((error) => window.alert(error.message));
}
