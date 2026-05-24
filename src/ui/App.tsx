import { ChallengePage } from './pages/ChallengePage';
import { ConfigPage } from './pages/ConfigPage';
import { HomePage } from './pages/HomePage';
import { RoundsPage } from './pages/RoundsPage';
import { ScorerPage } from './pages/ScorerPage';

function currentRoute() {
  const bootRoute = window.__TOURNAMENTER_OBR__?.route;
  return bootRoute || window.location.pathname;
}

export function App() {
  const route = currentRoute();

  if (route.startsWith('/tournamenter-obr')) {
    return <ScorerPage />;
  }
  if (route.startsWith('/obr-config')) {
    return <ConfigPage />;
  }
  if (route.startsWith('/obr-desafio')) {
    return <ChallengePage />;
  }
  if (route.startsWith('/obr-rounds')) {
    return <RoundsPage />;
  }
  return <HomePage newestVersion={window.__TOURNAMENTER_OBR__?.newestVersion || null} />;
}
