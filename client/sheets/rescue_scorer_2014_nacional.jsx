export default function Sheet({ scoreData, scorings, update, ticks, running, team, stop, sumSpecial }) {
  return (
    <>
      {ticks == 0 && scorings.total == 0 && (
        <div className="container">
          <div className="jumbotron">
            <h1>Aguardando...</h1>
            <p>Para começar a pontuar, inicie o cronômetro</p>
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
                  {[1, 2].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.obstacles[j])}
                      onClick={() => update(['obstacles', j], !scoreData.obstacles[j])}
                      className={'btn btn-default' + (scoreData.obstacles[j] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.obstacles, [1, 2])} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {[1, 2].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.gaps, [1, 2])} pts</span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {[1, 2].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.speedbump[j])}
                      onClick={() => update(['speedbump', j], !scoreData.speedbump[j])}
                      className={'btn btn-default' + (scoreData.speedbump[j] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.speedbump, [1, 2])} pts</span>
                </div>

                <h5>Interceções</h5>
                <div className="btn-group btn-group-justified">
                  {[1, 2].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.intersection[k])}
                      onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                      className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.intersection, [1, 2])} pts</span>
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
                  {[20, 21].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.obstacles[j])}
                      onClick={() => update(['obstacles', j], !scoreData.obstacles[j])}
                      className={'btn btn-default' + (scoreData.obstacles[j] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.obstacles, [20, 21])} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {[20, 21].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.gaps, [20, 21])} pts</span>
                </div>

                <h5>Redutores</h5>
                <div className="btn-group btn-group-justified">
                  {[20, 21].map((j, index) => (
                    <button
                      key={j}
                      type="button"
                      aria-pressed={Boolean(scoreData.speedbump[j])}
                      onClick={() => update(['speedbump', j], !scoreData.speedbump[j])}
                      className={'btn btn-default' + (scoreData.speedbump[j] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">{sumSpecial(scorings.speedbump, [20, 21])} pts</span>
                </div>

                <h5>Interceções</h5>
                <div className="btn-group btn-group-justified">
                  {[20, 21].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.intersection[k])}
                      onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                      className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.intersection, [20, 21])} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Corredor</h2>

                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallway'] === 0)}
                    onClick={() => update(['corridors', 'hallway'], 0)}
                    className={'btn btn-default' + (scoreData.corridors['hallway'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallway'] === 1)}
                    onClick={() => update(['corridors', 'hallway'], 1)}
                    className={'btn btn-default' + (scoreData.corridors['hallway'] === 1 ? ' active' : '')}
                  >
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallway'] === 2)}
                    onClick={() => update(['corridors', 'hallway'], 2)}
                    className={'btn btn-default' + (scoreData.corridors['hallway'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallway'] === 3)}
                    onClick={() => update(['corridors', 'hallway'], 3)}
                    className={'btn btn-default' + (scoreData.corridors['hallway'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallway'] === 4)}
                    onClick={() => update(['corridors', 'hallway'], 4)}
                    className={'btn btn-default' + (scoreData.corridors['hallway'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.corridors['hallway'] || 0} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {['hallway1', 'hallway2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, ['hallway1', 'hallway2'])} pts
                  </span>
                </div>

                <h5>Interceções</h5>
                <div className="btn-group btn-group-justified">
                  {['hallway1', 'hallway2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.intersection[k])}
                      onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                      className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.intersection, ['hallway1', 'hallway2'])} pts
                  </span>
                </div>
              </div>
            </div>

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
                  {['ramp1', 'ramp2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, ['ramp1', 'ramp2'])} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Corredor (Volta)</h2>

                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallwayback'] === 0)}
                    onClick={() => update(['corridors', 'hallwayback'], 0)}
                    className={
                      'btn btn-default' + (scoreData.corridors['hallwayback'] === 0 ? ' active' : '')
                    }
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallwayback'] === 1)}
                    onClick={() => update(['corridors', 'hallwayback'], 1)}
                    className={
                      'btn btn-default' + (scoreData.corridors['hallwayback'] === 1 ? ' active' : '')
                    }
                  >
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallwayback'] === 2)}
                    onClick={() => update(['corridors', 'hallwayback'], 2)}
                    className={
                      'btn btn-default' + (scoreData.corridors['hallwayback'] === 2 ? ' active' : '')
                    }
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallwayback'] === 3)}
                    onClick={() => update(['corridors', 'hallwayback'], 3)}
                    className={
                      'btn btn-default' + (scoreData.corridors['hallwayback'] === 3 ? ' active' : '')
                    }
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['hallwayback'] === 4)}
                    onClick={() => update(['corridors', 'hallwayback'], 4)}
                    className={
                      'btn btn-default' + (scoreData.corridors['hallwayback'] === 4 ? ' active' : '')
                    }
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.corridors['hallwayback'] || 0} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {['hallwayback1', 'hallwayback2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, ['hallwayback1', 'hallwayback2'])} pts
                  </span>
                </div>

                <h5>Interceções</h5>
                <div className="btn-group btn-group-justified">
                  {['hallwayback1', 'hallwayback2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.intersection[k])}
                      onClick={() => update(['intersection', k], !scoreData.intersection[k])}
                      className={'btn btn-default' + (scoreData.intersection[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.intersection, ['hallwayback1', 'hallwayback2'])} pts
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-sm-6">
              <div className="thumbnail">
                <h2>Rampa (Volta)</h2>

                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['rampback'] === 0)}
                    onClick={() => update(['corridors', 'rampback'], 0)}
                    className={'btn btn-default' + (scoreData.corridors['rampback'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['rampback'] === 1)}
                    onClick={() => update(['corridors', 'rampback'], 1)}
                    className={'btn btn-default' + (scoreData.corridors['rampback'] === 1 ? ' active' : '')}
                  >
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['rampback'] === 2)}
                    onClick={() => update(['corridors', 'rampback'], 2)}
                    className={'btn btn-default' + (scoreData.corridors['rampback'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['rampback'] === 3)}
                    onClick={() => update(['corridors', 'rampback'], 3)}
                    className={'btn btn-default' + (scoreData.corridors['rampback'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.corridors['rampback'] === 4)}
                    onClick={() => update(['corridors', 'rampback'], 4)}
                    className={'btn btn-default' + (scoreData.corridors['rampback'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.corridors['rampback'] || 0} pts</span>
                </div>

                <h5>Gaps</h5>
                <div className="btn-group btn-group-justified">
                  {['rampback1', 'rampback2'].map((k, index) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={Boolean(scoreData.gaps[k])}
                      onClick={() => update(['gaps', k], !scoreData.gaps[k])}
                      className={'btn btn-default' + (scoreData.gaps[k] ? ' active' : '')}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span className="input-group-addon">
                    {sumSpecial(scorings.gaps, ['rampback1', 'rampback2'])} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 col-sm-12">
              <div className="thumbnail">
                <h2>Resgate</h2>

                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['last'] === 0)}
                    onClick={() => {
                      update(['rooms', 'last'], 0);
                      stop();
                    }}
                    className={'btn btn-default' + (scoreData.rooms['last'] === 0 ? ' active' : '')}
                  >
                    Nop
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['last'] === 1)}
                    onClick={() => {
                      update(['rooms', 'last'], 1);
                      stop();
                    }}
                    className={'btn btn-default' + (scoreData.rooms['last'] === 1 ? ' active' : '')}
                  >
                    1st
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['last'] === 2)}
                    onClick={() => {
                      update(['rooms', 'last'], 2);
                      stop();
                    }}
                    className={'btn btn-default' + (scoreData.rooms['last'] === 2 ? ' active' : '')}
                  >
                    2nd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['last'] === 3)}
                    onClick={() => {
                      update(['rooms', 'last'], 3);
                      stop();
                    }}
                    className={'btn btn-default' + (scoreData.rooms['last'] === 3 ? ' active' : '')}
                  >
                    3rd
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.rooms['last'] === 4)}
                    onClick={() => {
                      update(['rooms', 'last'], 4);
                      stop();
                    }}
                    className={'btn btn-default' + (scoreData.rooms['last'] === 4 ? ' active' : '')}
                  >
                    4th
                  </button>
                  <span className="input-group-addon">{scorings.rooms['last'] || 0} pts</span>
                </div>

                <h5>Tocou vítima</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victim.touch === false)}
                    onClick={() => update(['victim', 'touch'], false)}
                    className={'btn btn-default' + (scoreData.victim.touch === false ? ' active' : '')}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victim.touch === true)}
                    onClick={() => update(['victim', 'touch'], true)}
                    className={'btn btn-default' + (scoreData.victim.touch === true ? ' active' : '')}
                  >
                    Sim
                  </button>
                  <span className="input-group-addon">{scorings.victim.touch || 0} pts</span>
                </div>

                <h5>Levantou vítima</h5>
                <div className="btn-group btn-group-justified">
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victim.raise === false)}
                    onClick={() => update(['victim', 'raise'], false)}
                    className={'btn btn-default' + (scoreData.victim.raise === false ? ' active' : '')}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    aria-pressed={Boolean(scoreData.victim.raise === true)}
                    onClick={() => update(['victim', 'raise'], true)}
                    className={'btn btn-default' + (scoreData.victim.raise === true ? ' active' : '')}
                  >
                    Sim
                  </button>
                  <span className="input-group-addon">{scorings.victim.raise || 0} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
