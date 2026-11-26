export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      <div className="container">
        <div className="col-md-6 missions-group">
          <div>
            <h4>Porta</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.door === 1)}
                  onClick={() => update(['door'], 1)}
                  className={'btn btn-default' + (scoreData.door === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.door === 0)}
                  onClick={() => update(['door'], 0)}
                  className={'btn btn-default' + (scoreData.door === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Porta obviamente aberta</p>
            </div>
          </div>

          <div>
            <h4>Acesso à nuvem</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.cloud === 1)}
                  onClick={() => update(['cloud'], 1)}
                  className={'btn btn-default' + (scoreData.cloud === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.cloud === 0)}
                  onClick={() => update(['cloud'], 0)}
                  className={'btn btn-default' + (scoreData.cloud === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Cartão SD levantado</p>
            </div>
          </div>

          <div>
            <h4>Aprendizagem coletiva</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.collective === 1)}
                  onClick={() => update(['collective'], 1)}
                  className={'btn btn-default' + (scoreData.collective === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.collective === 0)}
                  onClick={() => update(['collective'], 0)}
                  className={'btn btn-default' + (scoreData.collective === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Laço sem contato com modelo</p>
            </div>
          </div>

          <div>
            <h4>Braço robótico</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.insert === 1)}
                  onClick={() => update(['insert'], 1)}
                  className={'btn btn-default' + (scoreData.insert === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.insert === 0)}
                  onClick={() => update(['insert'], 0)}
                  className={'btn btn-default' + (scoreData.insert === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Objeto inserido no braço</p>
            </div>
            <div className="row-fluid" style={{ marginTop: '15px' }}>
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.insertLoop === 1)}
                  onClick={() => update(['insertLoop'], 1)}
                  className={'btn btn-default' + (scoreData.insertLoop === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.insertLoop === 0)}
                  onClick={() => update(['insertLoop'], 0)}
                  className={'btn btn-default' + (scoreData.insertLoop === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Loop separado do braço</p>
            </div>
          </div>

          <div>
            <h4>Uso dos Sentidos</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.sense === 1)}
                  onClick={() => update(['sense'], 1)}
                  className={'btn btn-default' + (scoreData.sense === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.sense === 0)}
                  onClick={() => update(['sense'], 0)}
                  className={'btn btn-default' + (scoreData.sense === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Laço sem contato com modelo</p>
            </div>
          </div>

          <div>
            <h4>Pensar fora da [caixa]</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.outbox === 2)}
                  onClick={() => update(['outbox'], 2)}
                  className={'btn btn-default' + (scoreData.outbox === 2 ? ' active' : '')}
                >
                  Para cima
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.outbox === 1)}
                  onClick={() => update(['outbox'], 1)}
                  className={'btn btn-default' + (scoreData.outbox === 1 ? ' active' : '')}
                >
                  Para baixo
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.outbox === 0)}
                  onClick={() => update(['outbox'], 0)}
                  className={'btn btn-default' + (scoreData.outbox === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Ideia tocando o tapete</p>
            </div>
          </div>

          <div>
            <h4>Aprendizado remoto</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.remote === 1)}
                  onClick={() => update(['remote'], 1)}
                  className={'btn btn-default' + (scoreData.remote === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.remote === 0)}
                  onClick={() => update(['remote'], 0)}
                  className={'btn btn-default' + (scoreData.remote === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Puxou a barra deslizante</p>
            </div>
          </div>

          <div className="can-be-wrong">
            <h4>Motor de buscas</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.search === 1)}
                  onClick={() => update(['search'], 1)}
                  className={'btn btn-default' + (scoreData.search === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.search === 0)}
                  onClick={() => update(['search'], 0)}
                  className={'btn btn-default' + (scoreData.search === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Empurrou a barra deslizante</p>
            </div>
            <div className="row-fluid" style={{ marginTop: '15px' }}>
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.searchLoops === 1)}
                  onClick={() => update(['searchLoops'], 1)}
                  className={'btn btn-default' + (scoreData.searchLoops === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.searchLoops === 0)}
                  onClick={() => update(['searchLoops'], 0)}
                  className={'btn btn-default' + (scoreData.searchLoops === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Laço correto, sem contato com modelo</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 missions-group">
          <div>
            <h4>Esportes</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.sports === 2)}
                  onClick={() => update(['sports'], 2)}
                  className={'btn btn-default' + (scoreData.sports === 2 ? ' active' : '')}
                >
                  Sim e fez GOL
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.sports === 1)}
                  onClick={() => update(['sports'], 1)}
                  className={'btn btn-default' + (scoreData.sports === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.sports === 0)}
                  onClick={() => update(['sports'], 0)}
                  className={'btn btn-default' + (scoreData.sports === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Chutou a bola</p>
            </div>
          </div>

          <div>
            <h4>Engenharia reversa</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.reverseBasker === 1)}
                  onClick={() => update(['reverseBasker'], 1)}
                  className={'btn btn-default' + (scoreData.reverseBasker === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.reverseBasker === 0)}
                  onClick={() => update(['reverseBasker'], 0)}
                  className={'btn btn-default' + (scoreData.reverseBasker === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Cesta na base</p>
            </div>
            <div className="row-fluid" style={{ marginTop: '15px' }}>
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.reverseReplicate === 1)}
                  onClick={() => update(['reverseReplicate'], 1)}
                  className={'btn btn-default' + (scoreData.reverseReplicate === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.reverseReplicate === 0)}
                  onClick={() => update(['reverseReplicate'], 0)}
                  className={'btn btn-default' + (scoreData.reverseReplicate === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Modelo replicado corretamente</p>
            </div>
          </div>

          <div>
            <h4>Adaptando às mudanças</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.adapt === 1)}
                  onClick={() => update(['adapt'], 1)}
                  className={'btn btn-default' + (scoreData.adapt === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.adapt === 0)}
                  onClick={() => update(['adapt'], 0)}
                  className={'btn btn-default' + (scoreData.adapt === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Rotacionou 90 graus</p>
            </div>
          </div>

          <div style={{ marginTop: '5px', paddingTop: '3px' }}>
            <h4>Aprendizagem</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.learnBound === 1)}
                  onClick={() => update(['learnBound'], 1)}
                  className={'btn btn-default' + (scoreData.learnBound === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.learnBound === 0)}
                  onClick={() => update(['learnBound'], 0)}
                  className={'btn btn-default' + (scoreData.learnBound === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Ambas as pessoas ligadas</p>
            </div>
            <div className="row-fluid" style={{ marginTop: '15px' }}>
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.learnTouch === 1)}
                  onClick={() => update(['learnTouch'], 1)}
                  className={'btn btn-default' + (scoreData.learnTouch === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.learnTouch === 0)}
                  onClick={() => update(['learnTouch'], 0)}
                  className={'btn btn-default' + (scoreData.learnTouch === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Modelo com pessoas tocando área da balança</p>
            </div>
          </div>

          <div className="can-be-wrong">
            <h4>Aprendizagem com projetos</h4>
            <div className="row-fluid">
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 8)}
                  onClick={() => update(['projects'], 8)}
                  className={'btn btn-default' + (scoreData.projects === 8 ? ' active' : '')}
                >
                  8
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 7)}
                  onClick={() => update(['projects'], 7)}
                  className={'btn btn-default' + (scoreData.projects === 7 ? ' active' : '')}
                >
                  7
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 6)}
                  onClick={() => update(['projects'], 6)}
                  className={'btn btn-default' + (scoreData.projects === 6 ? ' active' : '')}
                >
                  6
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 5)}
                  onClick={() => update(['projects'], 5)}
                  className={'btn btn-default' + (scoreData.projects === 5 ? ' active' : '')}
                >
                  5
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 4)}
                  onClick={() => update(['projects'], 4)}
                  className={'btn btn-default' + (scoreData.projects === 4 ? ' active' : '')}
                >
                  4
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 3)}
                  onClick={() => update(['projects'], 3)}
                  className={'btn btn-default' + (scoreData.projects === 3 ? ' active' : '')}
                >
                  3
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 2)}
                  onClick={() => update(['projects'], 2)}
                  className={'btn btn-default' + (scoreData.projects === 2 ? ' active' : '')}
                >
                  2
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 1)}
                  onClick={() => update(['projects'], 1)}
                  className={'btn btn-default' + (scoreData.projects === 1 ? ' active' : '')}
                >
                  1
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.projects === 0)}
                  onClick={() => update(['projects'], 0)}
                  className={'btn btn-default' + (scoreData.projects === 0 ? ' active' : '')}
                >
                  0
                </button>
              </div>
              <p>Laços na balança</p>
            </div>
          </div>

          <div>
            <h4>Engajamento</h4>
            <div className="row-fluid" style={{ marginTop: '15px' }}>
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.engage === 1)}
                  onClick={() => update(['engage'], 1)}
                  className={'btn btn-default' + (scoreData.engage === 1 ? ' active' : '')}
                >
                  Sim
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.engage === 0)}
                  onClick={() => update(['engage'], 0)}
                  className={'btn btn-default' + (scoreData.engage === 0 ? ' active' : '')}
                >
                  Não
                </button>
              </div>
              <p>Modelo ativado pela alavanca</p>
            </div>
            <div className="row-fluid" style={{ marginTop: '10px' }}>
              <p>Giros de 90˚</p>
              <div className="input-group pull-right col-md-3" style={{ marginTop: '-20px' }}>
                <span className="input-group-btn">
                  <button
                    onClick={() => update(['gyros'], scoreData.gyros <= 0 ? 0 : scoreData.gyros - 1)}
                    className="btn btn-default"
                    type="button"
                  >
                    -
                  </button>
                </span>
                <input
                  value={scoreData.gyros ?? ''}
                  onChange={(event) => update(['gyros'], event.target.value)}
                  className="form-control text-center"
                  type="text"
                  disabled
                />
                <span className="input-group-btn">
                  <button
                    onClick={() => update(['gyros'], scoreData.gyros >= 49 ? 49 : scoreData.gyros + 1)}
                    className="btn btn-default"
                    type="button"
                  >
                    +
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '6px', paddingTop: '5px' }}>
            <div className="row-fluid" style={{ marginTop: '15px' }}>
              <div className="btn-group pull-right">
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 8)}
                  onClick={() => update(['penalties'], 8)}
                  className={'btn btn-default' + (scoreData.penalties === 8 ? ' active' : '')}
                >
                  8
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 7)}
                  onClick={() => update(['penalties'], 7)}
                  className={'btn btn-default' + (scoreData.penalties === 7 ? ' active' : '')}
                >
                  7
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 6)}
                  onClick={() => update(['penalties'], 6)}
                  className={'btn btn-default' + (scoreData.penalties === 6 ? ' active' : '')}
                >
                  6
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 5)}
                  onClick={() => update(['penalties'], 5)}
                  className={'btn btn-default' + (scoreData.penalties === 5 ? ' active' : '')}
                >
                  5
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 4)}
                  onClick={() => update(['penalties'], 4)}
                  className={'btn btn-default' + (scoreData.penalties === 4 ? ' active' : '')}
                >
                  4
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 3)}
                  onClick={() => update(['penalties'], 3)}
                  className={'btn btn-default' + (scoreData.penalties === 3 ? ' active' : '')}
                >
                  3
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 2)}
                  onClick={() => update(['penalties'], 2)}
                  className={'btn btn-default' + (scoreData.penalties === 2 ? ' active' : '')}
                >
                  2
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 1)}
                  onClick={() => update(['penalties'], 1)}
                  className={'btn btn-default' + (scoreData.penalties === 1 ? ' active' : '')}
                >
                  1
                </button>
                <button
                  type="button"
                  aria-pressed={Boolean(scoreData.penalties === 0)}
                  onClick={() => update(['penalties'], 0)}
                  className={'btn btn-default' + (scoreData.penalties === 0 ? ' active' : '')}
                >
                  0
                </button>
              </div>
              <h4>Penalidades</h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
