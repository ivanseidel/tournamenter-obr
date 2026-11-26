export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      {ticks == 0 && scorings.total == 0 && (
        <div className="container">
          <div className="jumbotron">
            <h1>Aguardando...</h1>
            <p>Para começar a pontuar, inicie o cronômetro</p>
            <p>Versão: 1.01</p>
          </div>
        </div>
      )}

      {!(ticks == 0 && scorings.total == 0) && (
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Sala 1</h2>

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
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 2)}
                    onClick={() => update(['rooms', 'first'], 2)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 3)}
                    onClick={() => update(['rooms', 'first'], 3)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['first'] === 4)}
                    onClick={() => update(['rooms', 'first'], 4)}
                    className={'btn btn-default' + (scoreData.rooms['first'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.rooms['first'] || 0} pts</span>
                </div>

                <h5>Obstáculos</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12].map((j, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.obstacles, [11, 12])} pts</span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12].map((j, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.speedbump, [11, 12])} pts</span>
                </div>

                <h5>Interceções</h5>
                <div className="btn-group btn-group-justified">
                  {[11, 12].map((k, index) => (
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
                    {sumSpecial(scorings.intersection, [11, 12])} pts
                  </span>
                </div>

                <h5>Gap</h5>
                <div className="btn-group btn-group-justified">
                  {[11].map((k, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.gaps, [11])} pts</span>
                </div>

                <h5>Passagem</h5>
                <div className="btn-group btn-group-justified">
                  {[11].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.passage[k])}
                      onClick={() => update(['passage', k], !scoreData.passage[k])}
                      className={'btn btn-default' + (scoreData.passage[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.passage, [11])} pts</span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Sala 2</h2>

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
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 2)}
                    onClick={() => update(['rooms', 'secc'], 2)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 3)}
                    onClick={() => update(['rooms', 'secc'], 3)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['secc'] === 4)}
                    onClick={() => update(['rooms', 'secc'], 4)}
                    className={'btn btn-default' + (scoreData.rooms['secc'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.rooms['secc'] || 0} pts</span>
                </div>

                <h5>Obstáculos</h5>
                <div className="btn-group btn-group-justified">
                  {[21, 22].map((j, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.obstacles, [21, 22])} pts</span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {[21, 22].map((j, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.speedbump, [21, 22])} pts</span>
                </div>

                <h5>Interceções</h5>
                <div className="btn-group btn-group-justified">
                  {[21, 22].map((k, index) => (
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
                    {sumSpecial(scorings.intersection, [21, 22])} pts
                  </span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {[21].map((k, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.gaps, [21])} pts</span>
                </div>

                <h5>Passagens</h5>
                <div className="btn-group btn-group-justified">
                  {[21].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.passage[k])}
                      onClick={() => update(['passage', k], !scoreData.passage[k])}
                      className={'btn btn-default' + (scoreData.passage[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.passage, [21])} pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Rampa</h2>

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
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 2)}
                    onClick={() => update(['corridors', 'ramp'], 2)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 3)}
                    onClick={() => update(['corridors', 'ramp'], 3)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['ramp'] === 4)}
                    onClick={() => update(['corridors', 'ramp'], 4)}
                    className={'btn btn-default' + (scoreData.corridors['ramp'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.corridors['ramp'] || 0} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {['ramp1'].map((k, index) => (
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
                  <span className="input-group-addon">{sumSpecial(scorings.gaps, ['ramp1'])} pts</span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {['ramp1', 'ramp2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.speedbump[k])}
                      onClick={() => update(['speedbump', k], !scoreData.speedbump[k])}
                      className={'btn btn-default' + (scoreData.speedbump[k] ? ' active' : '')}
                    >
                      {index + 1}º
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.speedbump, ['ramp1', 'ramp2'])} pts
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Resgate</h2>

                <h5>1ª Vítima</h5>
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
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 2)}
                    onClick={() => update(['victims', '1a'], 2)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 3)}
                    onClick={() => update(['victims', '1a'], 3)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['1a'] === 4)}
                    onClick={() => update(['victims', '1a'], 4)}
                    className={'btn btn-default' + (scoreData.victims['1a'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.victims['1a'] || 0} pts</span>
                </div>

                <h5>2ª Vítima</h5>
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
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 2)}
                    onClick={() => update(['victims', '2a'], 2)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 3)}
                    onClick={() => update(['victims', '2a'], 3)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victims['2a'] === 4)}
                    onClick={() => update(['victims', '2a'], 4)}
                    className={'btn btn-default' + (scoreData.victims['2a'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.victims['2a'] || 0} pts</span>
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
