export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      <style>
        {
          '\n  .btn-group-justified {\n    display: inline-block;\n  }\n  .btn-group-justified > .input-group-addon {\n    width: 0.000001%;\n    min-width: 80px;\n  }\n'
        }
      </style>

      {ticks == 0 && scorings.total == 0 && (
        <div className="container">
          <div className="jumbotron">
            <h1>Aguardando...</h1>
            <p>Para começar a pontuar, inicie o cronômetro</p>
            <p>Versão: 2017.1</p>
          </div>
        </div>
      )}

      {!(ticks == 0 && scorings.total == 0) && (
        <div className="container">
          {team && (
            <div className="row">
              <div className="col-md-12">
                <h4>{team}</h4>
                <hr />
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h5>Marcador 1</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 0)}
                    onClick={() => update(['rooms', 'first'], 0)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 1)}
                    onClick={() => update(['rooms', 'first'], 1)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 1 ? ' active' : '')}
                  >
                    1ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 2)}
                    onClick={() => update(['rooms', 'first'], 2)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 2 ? ' active' : '')}
                  >
                    2ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 3)}
                    onClick={() => update(['rooms', 'first'], 3)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 3 ? ' active' : '')}
                  >
                    3ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 4)}
                    onClick={() => update(['rooms', 'first'], 4)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 4 ? ' active' : '')}
                  >
                    Desistiu
                  </button>
                  <span className="input-group-addon">{scorings.rooms['first'] || 0} pts</span>
                </div>

                <h5>Marcador 2</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 0)}
                    onClick={() => update(['rooms', 'secc'], 0)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 1)}
                    onClick={() => update(['rooms', 'secc'], 1)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 1 ? ' active' : '')}
                  >
                    1ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 2)}
                    onClick={() => update(['rooms', 'secc'], 2)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 2 ? ' active' : '')}
                  >
                    2ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 3)}
                    onClick={() => update(['rooms', 'secc'], 3)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 3 ? ' active' : '')}
                  >
                    3ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 4)}
                    onClick={() => update(['rooms', 'secc'], 4)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 4 ? ' active' : '')}
                  >
                    Desistiu
                  </button>
                  <span className="input-group-addon">{scorings.rooms['secc'] || 0} pts</span>
                </div>

                <h5>Obstáculos</h5>
                <div className="btn-group btn-group-justified">
                  {['A', 'B', 'C', 'D'].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.obstacles[j])}
                      onClick={() => update(['obstacles', j], !scoreData.obstacles[j])}
                      className={'btn btn-default' + (scoreData.obstacles[j] ? ' active' : '')}
                    >
                      {j}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.obstacles, ['A', 'B', 'C', 'D'])} pts
                  </span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.speedbump[j])}
                      onClick={() => update(['speedbump', j], !scoreData.speedbump[j])}
                      className={'btn btn-default' + (scoreData.speedbump[j] ? ' active' : '')}
                    >
                      {j}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.speedbump, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])} pts
                  </span>
                </div>

                <h5>Intersecções</h5>
                <div className="btn-group btn-group-justified">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.intersection[k])}
                      onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                      className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                    >
                      {k}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.intersection, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])} pts
                  </span>
                </div>

                <h5>Gap</h5>
                <div className="btn-group btn-group-justified">
                  {['A', 'B', 'C', 'D'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {k}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, ['A', 'B', 'C', 'D'])} pts
                  </span>
                </div>

                <h5>Passagem</h5>
                <div className="btn-group btn-group-justified">
                  {['A'].map((k, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.passage, ['A'])} pts</span>
                </div>

                <h5>Desafio Surpresa</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['desafio'] === 0)}
                    onClick={() => update(['victims', 'desafio'], 0)}
                    className={'btn btn-default' + (scoreData.victims['desafio'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['desafio'] === 1)}
                    onClick={() => update(['victims', 'desafio'], 1)}
                    className={'btn btn-default' + (scoreData.victims['desafio'] === 1 ? ' active' : '')}
                  >
                    Fez
                  </button>
                  <span className="input-group-addon">{scorings.victims['desafio'] || 0} pts</span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h4>Rampa</h4>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 0)}
                    onClick={() => update(['corridors', 'ramp'], 0)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 1)}
                    onClick={() => update(['corridors', 'ramp'], 1)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 1 ? ' active' : '')}
                  >
                    1ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 2)}
                    onClick={() => update(['corridors', 'ramp'], 2)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 2 ? ' active' : '')}
                  >
                    2ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 3)}
                    onClick={() => update(['corridors', 'ramp'], 3)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 3 ? ' active' : '')}
                  >
                    3ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 4)}
                    onClick={() => update(['corridors', 'ramp'], 4)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 4 ? ' active' : '')}
                  >
                    Desistiu
                  </button>
                  <span className="input-group-addon">{scorings.corridors['ramp'] || 0} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {['RAMPA_A', 'RAMPA_B'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {k}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, ['RAMPA_A', 'RAMPA_B'])} pts
                  </span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {['RAMPA_A', 'RAMPA_B'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.speedbump[k])}
                      onClick={() => update(['speedbump', k], !scoreData.speedbump[k])}
                      className={'btn btn-default' + (scoreData.speedbump[k] ? ' active' : '')}
                    >
                      {k}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.speedbump, ['RAMPA_A', 'RAMPA_B'])} pts
                  </span>
                </div>
              </div>

              <div className="thumbnail">
                <h5>Resgate: 1ª Vítima</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 0)}
                    onClick={() => update(['victims', '1a'], 0)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 1)}
                    onClick={() => update(['victims', '1a'], 1)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 1 ? ' active' : '')}
                  >
                    1ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 2)}
                    onClick={() => update(['victims', '1a'], 2)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 2 ? ' active' : '')}
                  >
                    2ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 3)}
                    onClick={() => update(['victims', '1a'], 3)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 3 ? ' active' : '')}
                  >
                    3ª
                  </button>
                  <span className="input-group-addon">{scorings.victims['1a'] || 0} pts</span>
                </div>

                <h5>Resgate: 2ª Vítima</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 0)}
                    onClick={() => update(['victims', '2a'], 0)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 1)}
                    onClick={() => update(['victims', '2a'], 1)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 1 ? ' active' : '')}
                  >
                    1ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 2)}
                    onClick={() => update(['victims', '2a'], 2)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 2 ? ' active' : '')}
                  >
                    2ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 3)}
                    onClick={() => update(['victims', '2a'], 3)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 3 ? ' active' : '')}
                  >
                    3ª
                  </button>
                  <span className="input-group-addon">{scorings.victims['2a'] || 0} pts</span>
                </div>

                <h5>Resgate: 3ª Vítima</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['3a'] === 0)}
                    onClick={() => update(['victims', '3a'], 0)}
                    className={'btn btn-default' + (scoreData.victims['3a'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['3a'] === 1)}
                    onClick={() => update(['victims', '3a'], 1)}
                    className={'btn btn-default' + (scoreData.victims['3a'] === 1 ? ' active' : '')}
                  >
                    1ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['3a'] === 2)}
                    onClick={() => update(['victims', '3a'], 2)}
                    className={'btn btn-default' + (scoreData.victims['3a'] === 2 ? ' active' : '')}
                  >
                    2ª
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['3a'] === 3)}
                    onClick={() => update(['victims', '3a'], 3)}
                    className={'btn btn-default' + (scoreData.victims['3a'] === 3 ? ' active' : '')}
                  >
                    3ª
                  </button>
                  <span className="input-group-addon">{scorings.victims['3a'] || 0} pts</span>
                </div>
                <button
                  type="button"
                  onClick={stop}
                  disabled={!running}
                  className={'btn btn-lg btn-block navbar-btn btn-danger' + (!running ? ' disabled' : '')}
                  style={{ marginTop: '44px' }}
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
