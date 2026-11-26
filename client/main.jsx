import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import Rescue from './Rescue';
import Artistic from './Artistic';
import Challenge from './Challenge';
import Rounds from './Rounds';
import Config from './Config';
import { request } from './api';

function Home() {
  const [newest, setNewest] = useState(null);
  useEffect(() => {
    request('/obr-versao')
      .then((info) => setNewest(info.newestVersion))
      .catch(() => {});
  }, []);
  return (
    <>
      {newest && (
        <div className="col-md-8 col-md-offset-2" style={{ paddingTop: 20 }}>
          <div className="col-md-12">
            <div className="alert alert-danger">
              <strong>O plugin da OBR possui uma atualização.</strong> Atualize o quanto antes para a versão{' '}
              <span className="label label-warning">{newest}</span>
            </div>
          </div>
        </div>
      )}
      <div className="col-md-8 col-md-offset-2" style={{ paddingTop: 20 }}>
        <div className="col-md-12">
          <div className="alert alert-warning">
            <strong>Bem vindo ao Tournamenter!</strong> O que deseja?
          </div>
        </div>
      </div>
      <div className="col-md-8 col-md-offset-2">
        {[
          ['/tournamenter-obr', 'flag-checkered', 'Pontuador Resgate'],
          ['/obr-artistica', 'music', 'Pontuador Artística'],
          ['/obr-desafio', 'question', 'Desafio Surpresa'],
        ].map(([url, icon, label]) => (
          <div key={url} className="col-md-6 col-sm-6">
            <a className="no-decoration" target="_blank" rel="noopener" href={url}>
              <div className="jumbotron">
                <h1 className="text-center">
                  <i className={'fa fa-' + icon} />
                </h1>
                <br />
                <p className="text-center">{label}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
      <div className="col-md-8 col-md-offset-2">
        <div className="col-md-12 col-sm-12">
          <div className="alert alert-info">
            <i className="pull-right fa fa-file-pdf-o" />
            <a href="/ManualOBRTournamenter.pdf" target="_blank" rel="noopener">
              Manual do Tournamenter Completo <small>(Para Organização)</small>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
function MenuLink({ item }) {
  return (
    <a href={item.path || '#'}>
      {item.icon && <span className={'glyphicon glyphicon-' + item.icon} />} {item.name}{' '}
      {item.badge && <span className="badge">{String(item.badge).replace(/<[^>]*>/g, '')}</span>}
    </a>
  );
}
const pages = { '/obr-config': Config, '/obr-desafio': Challenge, '/obr-rounds': Rounds, '/': Home };
function Admin({ page }) {
  const [ui, setUI] = useState(null),
    [open, setOpen] = useState(null),
    [expanded, setExpanded] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    request('/api/ui')
      .then(setUI)
      .catch((e) => setError(e.message));
  }, []);
  const Page = pages[page];
  return (
    <>
      <div id="wrap">
        <nav className="navbar navbar-default navbar-fixed-top" style={{ opacity: 0.9 }}>
          <div className="container">
            <div className="navbar-header">
              <button className="navbar-toggle" aria-label="Menu" onClick={() => setExpanded(!expanded)}>
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <img className="navbar-brand" src="/branding.png" alt="" />
              <a className="navbar-brand" href="/">
                {ui?.appName || 'Tournamenter'}
              </a>
            </div>
            <div className={'navbar-collapse collapse' + (expanded ? ' in' : '')}>
              <ul className="nav navbar-nav">
                {ui?.menus.map((item, i) =>
                  item.childs?.length ? (
                    <li key={i} className={'dropdown' + (open === i ? ' open' : '')}>
                      <a
                        href="#"
                        aria-expanded={open === i}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(open === i ? null : i);
                        }}
                      >
                        {item.name} <b className="caret" />
                      </a>
                      <ul className="dropdown-menu">
                        {item.childs.map((child, j) => (
                          <li key={j}>
                            <MenuLink item={child} />
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={i}>
                      <MenuLink item={item} />
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </nav>
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              {error && <p role="alert">{error}</p>}
              <Page />
            </div>
          </div>
        </div>
      </div>
      <div id="footer">
        <div className="container">
          <p className="text-muted credit">
            © 2014 | <a href="https://github.com/ivanseidel">Ivan Seidel</a>
            <small className="pull-right">v{ui?.version}</small>
          </p>
        </div>
      </div>
    </>
  );
}
const page = location.pathname.replace(/\/$/, '') || '/';
const volunteer = page.startsWith('/tournamenter-obr/voluntario');
createRoot(document.getElementById('obr-root')).render(
  pages[page] ? (
    <Admin page={page} />
  ) : page.endsWith('artistica') ? (
    <Artistic volunteer={volunteer} />
  ) : (
    <Rescue volunteer={volunteer} />
  ),
);
