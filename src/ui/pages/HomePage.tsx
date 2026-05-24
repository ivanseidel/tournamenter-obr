type HomePageProps = {
  newestVersion: string | null;
};

export function HomePage({ newestVersion }: HomePageProps) {
  return (
    <div className="tournamenter-obr-app">
      {newestVersion ? (
        <div className="col-md-8 col-md-offset-2" style={{ paddingTop: 20 }}>
          <div className="col-md-12">
            <div className="alert alert-danger">
              <strong>O plugin da OBR possui uma atualização.</strong> Atualize o quanto antes para
              a versão <span className="label label-warning">{newestVersion}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="col-md-8 col-md-offset-2" style={{ paddingTop: 20 }}>
        <div className="col-md-12">
          <div className="alert alert-warning">
            <strong>Bem vindo ao Tournamenter!</strong> O que deseja?
          </div>
        </div>
      </div>

      <div className="col-md-8 col-md-offset-2">
        <div className="col-md-12 col-sm-12">
          <a href="/tournamenter-obr" target="_blank" className="no-decoration" rel="noreferrer">
            <div className="jumbotron">
              <h1 className="text-center">
                <i className="fa fa-flag-checkered" aria-hidden="true" />
              </h1>
              <br />
              <p className="text-center">Pontuar Round</p>
            </div>
          </a>
        </div>

        <div className="col-md-6 col-sm-6">
          <a href="/obr-desafio" target="_blank" className="no-decoration" rel="noreferrer">
            <div className="jumbotron">
              <h1 className="text-center">
                <i className="fa fa-question" aria-hidden="true" />
              </h1>
              <br />
              <p className="text-center">Desafio Surpresa</p>
            </div>
          </a>
        </div>
      </div>

      <div className="col-md-8 col-md-offset-2">
        <div className="col-md-12 col-sm-12">
          <div className="alert alert-info">
            <div className="pull-right">
              <i className="fa fa-file-pdf-o" aria-hidden="true" />
            </div>
            <a href="/ManualOBRTournamenter.pdf" target="_blank" rel="noreferrer">
              Manual do Tournamenter Completo <small>(Para Organização)</small>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
