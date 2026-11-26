export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      {ticks == 0 && scorings.total == 0 && (
        <div className="container">
          <div className="jumbotron">
            <h1>Aguardando...</h1>
            <p>Para começar a pontuar, inicie o cronômetro</p>
            <p>Versão: Nacional 2023.2</p>
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
                    aria-pressed={Boolean(scoreData.squares['initial'] === 0)}
                    onClick={() => update(['squares', 'initial'], 0)}
                    className={'btn btn-default' + (scoreData.squares['initial'] === 0 ? ' active' : '')}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.squares['initial'] === 1)}
                    onClick={() => update(['squares', 'initial'], 1)}
                    className={'btn btn-default' + (scoreData.squares['initial'] === 1 ? ' active' : '')}
                  >
                    Sim
                  </button>
                  <span className="input-group-addon">{scorings.squares['initial'] || 0} pts</span>
                </div>

                {[1, 2, 3, 4, 5, 6].map((mark, index) => (
                  <div key={mark}>
                    <h4>{mark}º Marcador</h4>
                    <div className="row">
                      <div className="col-md-3 col-xs-4">
                        <p>Ladrilhos Obtidos</p>
                        <div>
                          <select
                            value={scoreData.squares[mark] ?? ''}
                            onChange={(event) => update(['squares', mark], event.target.value)}
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

                          <span>{scorings.squares[mark]} pts</span>
                        </div>
                      </div>

                      <div className="col-md-3 col-xs-4">
                        <p>Tentativa</p>
                        <div>
                          <select
                            value={scoreData.tentativa[mark] ?? ''}
                            onChange={(event) => update(['tentativa', mark], event.target.value)}
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-12 col-sm-12">
              <div className="thumbnail">
                <h5>Passagem</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12, 13, 14].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.passage[k])}
                      onClick={() => update(['passage', k], !scoreData.passage[k])}
                      className={'btn btn-default' + (scoreData.passage[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.passage, [11, 12, 13, 14])} pts
                  </span>
                </div>

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
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(
                    (k, index) => (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={Boolean(scoreData.intersection[k])}
                        onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                        className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                      >
                        {index + 1}º
                      </button>
                    ),
                  )}
                  <span className="input-group-addon">
                    {sumSpecial(
                      scorings.intersection,
                      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
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
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(
                    (k, index) => (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={Boolean(scoreData.rampas[k])}
                        onClick={() => update(['rampas', k], !scoreData.rampas[k])}
                        className={'btn btn-default' + (scoreData.rampas[k] ? ' active' : '')}
                      >
                        {index + 1}º
                      </button>
                    ),
                  )}
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

                <h4>Falhas de Progresso Contendo Sala de Salvamento</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 0)}
                    onClick={() => update(['victims', 'fails'], 0)}
                    className={'btn btn-default' + (scoreData.victims.fails === 0 ? ' active' : '')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 1)}
                    onClick={() => update(['victims', 'fails'], 1)}
                    className={'btn btn-default' + (scoreData.victims.fails === 1 ? ' active' : '')}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 2)}
                    onClick={() => update(['victims', 'fails'], 2)}
                    className={'btn btn-default' + (scoreData.victims.fails === 2 ? ' active' : '')}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 3)}
                    onClick={() => update(['victims', 'fails'], 3)}
                    className={'btn btn-default' + (scoreData.victims.fails === 3 ? ' active' : '')}
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 4)}
                    onClick={() => update(['victims', 'fails'], 4)}
                    className={'btn btn-default' + (scoreData.victims.fails === 4 ? ' active' : '')}
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 5)}
                    onClick={() => update(['victims', 'fails'], 5)}
                    className={'btn btn-default' + (scoreData.victims.fails === 5 ? ' active' : '')}
                  >
                    5
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 6)}
                    onClick={() => update(['victims', 'fails'], 6)}
                    className={'btn btn-default' + (scoreData.victims.fails === 6 ? ' active' : '')}
                  >
                    6
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 7)}
                    onClick={() => update(['victims', 'fails'], 7)}
                    className={'btn btn-default' + (scoreData.victims.fails === 7 ? ' active' : '')}
                  >
                    7
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 8)}
                    onClick={() => update(['victims', 'fails'], 8)}
                    className={'btn btn-default' + (scoreData.victims.fails === 8 ? ' active' : '')}
                  >
                    8
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 9)}
                    onClick={() => update(['victims', 'fails'], 9)}
                    className={'btn btn-default' + (scoreData.victims.fails === 9 ? ' active' : '')}
                  >
                    9
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.fails === 10)}
                    onClick={() => update(['victims', 'fails'], 10)}
                    className={'btn btn-default' + (scoreData.victims.fails === 10 ? ' active' : '')}
                  >
                    10
                  </button>
                </div>

                <p>.</p>

                <h4>
                  Vítimas Vivas Resgatadas na área de resgate <span style={{ color: 'green' }}>VERDE</span>
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
                </div>

                <h4>
                  Vítima Morta salva na área de resgate <span style={{ color: 'red' }}>VERMELHA</span>,
                  depois que TODAS as vivas foram salvas
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
                </div>

                <h4>Kit de Resgate entregue</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 0)}
                    onClick={() => update(['rescue_kit', 'delivered'], 0)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 1)}
                    onClick={() => update(['rescue_kit', 'delivered'], 1)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 1 ? ' active' : '')}
                  >
                    Entregue (Robô)
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rescue_kit.delivered === 2)}
                    onClick={() => update(['rescue_kit', 'delivered'], 2)}
                    className={'btn btn-default' + (scoreData.rescue_kit.delivered === 2 ? ' active' : '')}
                  >
                    Entregue (Trajeto)
                  </button>
                </div>

                <h4>Desafio Surpresa</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.desafio_surpresa.completed === 0)}
                    onClick={() => update(['desafio_surpresa', 'completed'], 0)}
                    className={
                      'btn btn-default' + (scoreData.desafio_surpresa.completed === 0 ? ' active' : '')
                    }
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.desafio_surpresa.completed === 1)}
                    onClick={() => update(['desafio_surpresa', 'completed'], 1)}
                    className={
                      'btn btn-default' + (scoreData.desafio_surpresa.completed === 1 ? ' active' : '')
                    }
                  >
                    Desafio resolvido
                  </button>
                </div>

                <h4 style={{ marginTop: '16px' }}>Bônus de saída</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.bonus_de_saida['final'] === 0)}
                    onClick={() => update(['bonus_de_saida', 'final'], 0)}
                    className={
                      'btn btn-default' + (scoreData.bonus_de_saida['final'] === 0 ? ' active' : '')
                    }
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.bonus_de_saida['final'] === 1)}
                    onClick={() => update(['bonus_de_saida', 'final'], 1)}
                    className={
                      'btn btn-default' + (scoreData.bonus_de_saida['final'] === 1 ? ' active' : '')
                    }
                  >
                    Sim
                  </button>
                  <span className="input-group-addon">{scorings.bonus_de_saida['final'] || 0} pts</span>
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
