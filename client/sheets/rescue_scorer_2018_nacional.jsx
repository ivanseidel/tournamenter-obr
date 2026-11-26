export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      {ticks == 0 && scorings.total == 0 && (
        <div className="container">
          <div className="jumbotron">
            <h1>Aguardando...</h1>
            <p>Para começar a pontuar, inicie o cronômetro</p>
            <p>Versão: Nacional 2018.1</p>
          </div>
        </div>
      )}

      {!(ticks == 0 && scorings.total == 0) && (
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12">
              <div className="thumbnail">
                <h3>Ladrilhos</h3>

                {[1, 2, 3, 4].map((mark, index) => (
                  <div key={mark}>
                    <h5>{mark}º Marcador</h5>
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
                  {[11, 12, 13, 14].map((j, index) => (
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
                    {sumSpecial(scorings.obstacles, [11, 12, 13, 14])} pts
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
                  {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((k, index) => (
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
                      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
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
                  {[11, 12, 13, 14, 15, 16].map((k, index) => (
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
                    {sumSpecial(scorings.rampas, [11, 12, 13, 14, 15, 16])} pts
                  </span>
                </div>
              </div>

              <div className="thumbnail">
                <h2>Vítmas resgatadas</h2>

                <h4>Nível</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.altura['final'] === 0)}
                    onClick={() => update(['altura', 'final'], 0)}
                    className={'btn btn-default' + (scoreData.altura['final'] === 0 ? ' active' : '')}
                  >
                    Baixo
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.altura['final'] === 1)}
                    onClick={() => update(['altura', 'final'], 1)}
                    className={'btn btn-default' + (scoreData.altura['final'] === 1 ? ' active' : '')}
                  >
                    Alto
                  </button>
                </div>

                <h4>Total de Vítimas Vivas existentes</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 1)}
                    onClick={() => update(['victims', 'total'], 1)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 1 ? ' active' : '')}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 2)}
                    onClick={() => update(['victims', 'total'], 2)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 2 ? ' active' : '')}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 3)}
                    onClick={() => update(['victims', 'total'], 3)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 3 ? ' active' : '')}
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 4)}
                    onClick={() => update(['victims', 'total'], 4)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 4 ? ' active' : '')}
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 5)}
                    onClick={() => update(['victims', 'total'], 5)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 5 ? ' active' : '')}
                  >
                    5
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 6)}
                    onClick={() => update(['victims', 'total'], 6)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 6 ? ' active' : '')}
                  >
                    6
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 7)}
                    onClick={() => update(['victims', 'total'], 7)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 7 ? ' active' : '')}
                  >
                    7
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['total'] === 8)}
                    onClick={() => update(['victims', 'total'], 8)}
                    className={'btn btn-default' + (scoreData.victims['total'] === 8 ? ' active' : '')}
                  >
                    8
                  </button>
                </div>

                <h4>Total de Tentativas</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 0)}
                    onClick={() => update(['victims', 'attempts'], 0)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 0 ? ' active' : '')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 1)}
                    onClick={() => update(['victims', 'attempts'], 1)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 1 ? ' active' : '')}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 2)}
                    onClick={() => update(['victims', 'attempts'], 2)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 2 ? ' active' : '')}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 3)}
                    onClick={() => update(['victims', 'attempts'], 3)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 3 ? ' active' : '')}
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 4)}
                    onClick={() => update(['victims', 'attempts'], 4)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 4 ? ' active' : '')}
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 5)}
                    onClick={() => update(['victims', 'attempts'], 5)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 5 ? ' active' : '')}
                  >
                    5
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 6)}
                    onClick={() => update(['victims', 'attempts'], 6)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 6 ? ' active' : '')}
                  >
                    6
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 7)}
                    onClick={() => update(['victims', 'attempts'], 7)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 7 ? ' active' : '')}
                  >
                    7
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims.attempts === 8)}
                    onClick={() => update(['victims', 'attempts'], 8)}
                    className={'btn btn-default' + (scoreData.victims.attempts === 8 ? ' active' : '')}
                  >
                    8
                  </button>
                </div>

                <p>.</p>

                <h4>Vítimas Vivas Resgatadas</h4>
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
                  {scoreData.victims['total'] >= 6 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 6)}
                      onClick={() => update(['victims_alive', 'total'], 6)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 6 ? ' active' : '')}
                    >
                      6
                    </button>
                  )}
                  {scoreData.victims['total'] >= 7 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 7)}
                      onClick={() => update(['victims_alive', 'total'], 7)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 7 ? ' active' : '')}
                    >
                      7
                    </button>
                  )}
                  {scoreData.victims['total'] >= 8 && (
                    <button
                      type="button"
                      aria-pressed={Boolean(scoreData.victims_alive.total === 8)}
                      onClick={() => update(['victims_alive', 'total'], 8)}
                      className={'btn btn-default' + (scoreData.victims_alive.total === 8 ? ' active' : '')}
                    >
                      8
                    </button>
                  )}
                  <span className="input-group-addon">{scorings.victims_alive.total || 0} pts</span>
                </div>

                <h4>Vítimas Mortas Resgatadas (antes das vivas)</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 0)}
                    onClick={() => update(['victims_dead', 'before_alive'], 0)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 0 ? ' active' : '')
                    }
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 1)}
                    onClick={() => update(['victims_dead', 'before_alive'], 1)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 1 ? ' active' : '')
                    }
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 2)}
                    onClick={() => update(['victims_dead', 'before_alive'], 2)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 2 ? ' active' : '')
                    }
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 3)}
                    onClick={() => update(['victims_dead', 'before_alive'], 3)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 3 ? ' active' : '')
                    }
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 4)}
                    onClick={() => update(['victims_dead', 'before_alive'], 4)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 4 ? ' active' : '')
                    }
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 5)}
                    onClick={() => update(['victims_dead', 'before_alive'], 5)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 5 ? ' active' : '')
                    }
                  >
                    5
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 6)}
                    onClick={() => update(['victims_dead', 'before_alive'], 6)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 6 ? ' active' : '')
                    }
                  >
                    6
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 7)}
                    onClick={() => update(['victims_dead', 'before_alive'], 7)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 7 ? ' active' : '')
                    }
                  >
                    7
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.before_alive === 8)}
                    onClick={() => update(['victims_dead', 'before_alive'], 8)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.before_alive === 8 ? ' active' : '')
                    }
                  >
                    8
                  </button>
                  <span className="input-group-addon">{scorings.victims_dead.before_alive || 0} pts</span>
                </div>

                <h4>Vítimas Mortas Resgatadas (depois das vivas)</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 0)}
                    onClick={() => update(['victims_dead', 'after_alive'], 0)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 0 ? ' active' : '')
                    }
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 1)}
                    onClick={() => update(['victims_dead', 'after_alive'], 1)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 1 ? ' active' : '')
                    }
                  >
                    1
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 2)}
                    onClick={() => update(['victims_dead', 'after_alive'], 2)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 2 ? ' active' : '')
                    }
                  >
                    2
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 3)}
                    onClick={() => update(['victims_dead', 'after_alive'], 3)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 3 ? ' active' : '')
                    }
                  >
                    3
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 4)}
                    onClick={() => update(['victims_dead', 'after_alive'], 4)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 4 ? ' active' : '')
                    }
                  >
                    4
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 5)}
                    onClick={() => update(['victims_dead', 'after_alive'], 5)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 5 ? ' active' : '')
                    }
                  >
                    5
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 6)}
                    onClick={() => update(['victims_dead', 'after_alive'], 6)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 6 ? ' active' : '')
                    }
                  >
                    6
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 7)}
                    onClick={() => update(['victims_dead', 'after_alive'], 7)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 7 ? ' active' : '')
                    }
                  >
                    7
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims_dead.after_alive === 8)}
                    onClick={() => update(['victims_dead', 'after_alive'], 8)}
                    className={
                      'btn btn-default' + (scoreData.victims_dead.after_alive === 8 ? ' active' : '')
                    }
                  >
                    8
                  </button>
                  <span className="input-group-addon">{scorings.victims_dead.after_alive || 0} pts</span>
                </div>

                <h5>Saiu da sala de salvamento</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.saiu_salvamento['final'] === 0)}
                    onClick={() => update(['saiu_salvamento', 'final'], 0)}
                    className={
                      'btn btn-default' + (scoreData.saiu_salvamento['final'] === 0 ? ' active' : '')
                    }
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.saiu_salvamento['final'] === 1)}
                    onClick={() => update(['saiu_salvamento', 'final'], 1)}
                    className={
                      'btn btn-default' + (scoreData.saiu_salvamento['final'] === 1 ? ' active' : '')
                    }
                  >
                    Sim
                  </button>
                  <span className="input-group-addon">{scorings.saiu_salvamento['final'] || 0} pts</span>
                </div>

                <button
                  type="button"
                  onClick={stop}
                  disabled={!running}
                  className={'btn btn-lg btn-block navbar-btn btn-danger' + (!running ? ' disabled' : '')}
                >
                  <span className="glyphicon glyphicon-pause"></span> Parar Tempo
                </button>
              </div>
            </div>
          </div>

          <div className="row"></div>
        </div>
      )}
    </>
  );
}
