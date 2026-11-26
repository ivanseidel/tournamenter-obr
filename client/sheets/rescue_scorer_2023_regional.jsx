export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      {ticks == 0 && scorings.total == 0 && (
        <div className="container">
          <div className="jumbotron">
            <h1>Aguardando...</h1>
            <p>Para começar a pontuar, inicie o cronômetro</p>
            <p>Versão: Regional 2023.1</p>
          </div>
        </div>
      )}

      {!(ticks == 0 && scorings.total == 0) && (
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12">
              <div className="thumbnail">
                <h3>Ladrilhos</h3>

                <h4 style={{ marginTop: '16px' }}>Ladrilho Inicial</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.squares1['initial'] === 0)}
                    onClick={() => update(['squares1', 'initial'], 0)}
                    className={'btn btn-default' + (scoreData.squares1['initial'] === 0 ? ' active' : '')}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.squares1['initial'] === 1)}
                    onClick={() => update(['squares1', 'initial'], 1)}
                    className={'btn btn-default' + (scoreData.squares1['initial'] === 1 ? ' active' : '')}
                  >
                    Sim
                  </button>
                  <span className="input-group-addon">{scorings.squares1['initial'] || 0} pts</span>
                </div>

                {[1, 2, 3, 4].map((mark, index) => (
                  <div key={mark}>
                    <h4>{mark}º Marcador</h4>
                    <div className="row">
                      <div className="col-md-4 col-xs-4">
                        <p>1ª Tentativa</p>
                        <div>
                          <select
                            value={scoreData.squares1[mark] ?? ''}
                            onChange={(event) => update(['squares1', mark], event.target.value)}
                          >
                            <option value="0">0</option>
                            {[
                              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                              23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
                              42, 43, 44, 45, 46, 47, 48, 49, 50,
                            ].map((k, index) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>

                          <span>{scorings.squares1[mark]} pts</span>
                        </div>
                      </div>

                      <div className="col-md-4 col-xs-4">
                        <p>2ª Tentativa</p>
                        <div>
                          <select
                            value={scoreData.squares2[mark] ?? ''}
                            onChange={(event) => update(['squares2', mark], event.target.value)}
                            disabled={scorings.squares1[mark] > 0}
                          >
                            <option value="0">0</option>
                            {[
                              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                              23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
                              42, 43, 44, 45, 46, 47, 48, 49, 50,
                            ].map((k, index) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>

                          <span>{scorings.squares2[mark]} pts</span>
                        </div>
                      </div>

                      <div className="col-md-4 col-xs-4">
                        <p>3ª Tentativa</p>
                        <div>
                          <select
                            value={scoreData.squares3[mark] ?? ''}
                            onChange={(event) => update(['squares3', mark], event.target.value)}
                            disabled={scorings.squares1[mark] > 0 || scorings.squares2[mark] > 0}
                          >
                            <option value="0">0</option>
                            {[
                              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                              23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
                              42, 43, 44, 45, 46, 47, 48, 49, 50,
                            ].map((k, index) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>

                          <span>{scorings.squares3[mark]} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-12 col-sm-12">
              <div className="thumbnail">
                <h5>Obstáculos</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.obstacles[j])}
                      onClick={() => update(['obstacles', j], !scoreData.obstacles[j])}
                      className={'btn btn-default' + (scoreData.obstacles[j] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.obstacles, [11, 12, 13, 14, 15, 16])} pts
                  </span>
                </div>

                <h5>Gangorras</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.seesaw[j])}
                      onClick={() => update(['seesaw', j], !scoreData.seesaw[j])}
                      className={'btn btn-default' + (scoreData.seesaw[j] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.seesaw, [11, 12, 13, 14, 15, 16])} pts
                  </span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.speedbump[j])}
                      onClick={() => update(['speedbump', j], !scoreData.speedbump[j])}
                      className={'btn btn-default' + (scoreData.speedbump[j] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(
                      scorings.speedbump,
                      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
                    )}{' '}
                    pts
                  </span>
                </div>

                <h5>Interseções</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.intersection[k])}
                      onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                      className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(
                      scorings.intersection,
                      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                    )}{' '}
                    pts
                  </span>
                </div>

                <h5>Gap</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20])} pts
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h5>Passagem</h5>
                </div>
                <div className="btn-group btn-group-justified">
                  {['A', 'B', 'C'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.passage[k])}
                      onClick={() => update(['passage', k], !scoreData.passage[k])}
                      className={'btn btn-default' + (scoreData.passage[k] ? ' active' : '')}
                    >
                      {k}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.passage, ['A', 'B', 'C'])} pts
                  </span>
                </div>

                <h5>Becos sem saída</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.becos[k])}
                      onClick={() => update(['becos', k], !scoreData.becos[k])}
                      className={'btn btn-default' + (scoreData.becos[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.becos, [11, 12, 13, 14, 15, 16])} pts
                  </span>
                </div>

                <h5>Rampas</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.rampas[k])}
                      onClick={() => update(['rampas', k], !scoreData.rampas[k])}
                      className={'btn btn-default' + (scoreData.rampas[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(
                      scorings.rampas,
                      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                    )}{' '}
                    pts
                  </span>
                </div>
              </div>

              <div className="thumbnail">
                <h2>Vítimas resgatadas</h2>

                <h4>
                  Vítimas <span style={{ color: 'green' }}>Vivas</span> Entregue na{' '}
                  <span style={{ color: 'green' }}>Área Verde</span>
                </h4>
                <div className="btn-group btn-group-justified">
                  {scoreData.victims['total'] >= 0 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 0)}
                      onClick={() => update(['victims_alive', 'total'], 0)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 0 ? ' active' : '')}
                    >
                      0
                    </button>
                  )}
                  {scoreData.victims['total'] >= 1 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 1)}
                      onClick={() => update(['victims_alive', 'total'], 1)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 1 ? ' active' : '')}
                    >
                      1
                    </button>
                  )}
                  {scoreData.victims['total'] >= 2 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 2)}
                      onClick={() => update(['victims_alive', 'total'], 2)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 2 ? ' active' : '')}
                    >
                      2
                    </button>
                  )}
                  {scoreData.victims['total'] >= 3 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 3)}
                      onClick={() => update(['victims_alive', 'total'], 3)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 3 ? ' active' : '')}
                    >
                      3
                    </button>
                  )}
                  {scoreData.victims['total'] >= 4 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 4)}
                      onClick={() => update(['victims_alive', 'total'], 4)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 4 ? ' active' : '')}
                    >
                      4
                    </button>
                  )}
                  {scoreData.victims['total'] >= 5 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 5)}
                      onClick={() => update(['victims_alive', 'total'], 5)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 5 ? ' active' : '')}
                    >
                      5
                    </button>
                  )}
                </div>

                <h4>
                  Vítima <span style={{ color: 'red' }}>Morta</span> Entregue na{' '}
                  <span style={{ color: 'red' }}>Área Vermelha</span>
                </h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.total === 0)}
                    onClick={() => update(['victims_dead', 'total'], 0)}
                    className={'btn btn-default' + (scoreData.victims_dead.total === 0 ? ' active' : '')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.total === 1)}
                    onClick={() => update(['victims_dead', 'total'], 1)}
                    className={'btn btn-default' + (scoreData.victims_dead.total === 1 ? ' active' : '')}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.total === 2)}
                    onClick={() => update(['victims_dead', 'total'], 2)}
                    className={'btn btn-default' + (scoreData.victims_dead.total === 2 ? ' active' : '')}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.total === 3)}
                    onClick={() => update(['victims_dead', 'total'], 3)}
                    className={'btn btn-default' + (scoreData.victims_dead.total === 3 ? ' active' : '')}
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.total === 4)}
                    onClick={() => update(['victims_dead', 'total'], 4)}
                    className={'btn btn-default' + (scoreData.victims_dead.total === 4 ? ' active' : '')}
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.total === 5)}
                    onClick={() => update(['victims_dead', 'total'], 5)}
                    className={'btn btn-default' + (scoreData.victims_dead.total === 5 ? ' active' : '')}
                  >
                    5
                  </button>
                </div>

                <h4>
                  Vítimas <span style={{ color: 'red' }}>Vivas</span> ou{' '}
                  <span style={{ color: 'green' }}>Mortas</span> Entregue na Área Invertida
                </h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 0)}
                    onClick={() => update(['victims_switched', 'total'], 0)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 0 ? ' active' : '')
                    }
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 1)}
                    onClick={() => update(['victims_switched', 'total'], 1)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 1 ? ' active' : '')
                    }
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 2)}
                    onClick={() => update(['victims_switched', 'total'], 2)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 2 ? ' active' : '')
                    }
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 3)}
                    onClick={() => update(['victims_switched', 'total'], 3)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 3 ? ' active' : '')
                    }
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 4)}
                    onClick={() => update(['victims_switched', 'total'], 4)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 4 ? ' active' : '')
                    }
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 5)}
                    onClick={() => update(['victims_switched', 'total'], 5)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 5 ? ' active' : '')
                    }
                  >
                    5
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 6)}
                    onClick={() => update(['victims_switched', 'total'], 6)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 6 ? ' active' : '')
                    }
                  >
                    6
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 7)}
                    onClick={() => update(['victims_switched', 'total'], 7)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 7 ? ' active' : '')
                    }
                  >
                    7
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 8)}
                    onClick={() => update(['victims_switched', 'total'], 8)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 8 ? ' active' : '')
                    }
                  >
                    8
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 9)}
                    onClick={() => update(['victims_switched', 'total'], 9)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 9 ? ' active' : '')
                    }
                  >
                    9
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_switched.total === 10)}
                    onClick={() => update(['victims_switched', 'total'], 10)}
                    className={
                      'btn btn-default' + (scoreData.victims_switched.total === 10 ? ' active' : '')
                    }
                  >
                    10
                  </button>
                </div>

                <h4>Kit de Resgate entregue</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 0)}
                    onClick={() => update(['rescue_kit', 'delivered'], 0)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 0 ? ' active' : '')}
                  >
                    Não Entregue
                  </button>
                </div>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 1)}
                    onClick={() => update(['rescue_kit', 'delivered'], 1)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 1 ? ' active' : '')}
                    style={{ color: 'red' }}
                  >
                    Entregue na Área Vermelha (Robô)
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 2)}
                    onClick={() => update(['rescue_kit', 'delivered'], 2)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 2 ? ' active' : '')}
                    style={{ color: 'red' }}
                  >
                    Entregue na Área Vermelha (Trajeto)
                  </button>
                </div>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 3)}
                    onClick={() => update(['rescue_kit', 'delivered'], 3)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 3 ? ' active' : '')}
                    style={{ color: '#1cd404' }}
                  >
                    Entregue na Área Verde (Robô)
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 4)}
                    onClick={() => update(['rescue_kit', 'delivered'], 4)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 4 ? ' active' : '')}
                    style={{ color: '#1cd404' }}
                  >
                    Entregue na Área Verde (Trajeto)
                  </button>
                </div>

                <h4>Multiplicador Obtido</h4>
                <span className="input-group-addon">{scoreData.multiplier['value'] || 1}x</span>

                <button
                  type="button"
                  onClick={stop}
                  disabled={!running}
                  className={'btn btn-lg btn-block navbar-btn btn-danger' + (!running ? ' disabled' : '')}
                  style={{ marginTop: '28px' }}
                >
                  <span className="glyphicon glyphicon-pause"></span> Parar Tempo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
