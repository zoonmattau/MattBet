import { ROUNDS, MATCH_STRUCTURE } from '@/lib/constants';

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-2">Rules and Format</h1>
        <p className="text-white/50 text-sm">
          Barnbougle, Tasmania. Everything you need to know about the format, scoring, and betting.
        </p>
      </div>

      {/* Trip Format */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Trip Format</h2>
        <div className="bg-navy-card border border-white/8 rounded-xl p-5 space-y-3 text-sm text-white/70">
          <p>
            12 players split into 3 teams of 4, heading to Barnbougle Dunes and Lost Farm
            on the north-east coast of Tasmania. The trip consists of 4 rounds across 3 days
            (Friday, Saturday, Sunday). Points are allocated each round and the team with the
            most total points at the end of Sunday wins.
          </p>
          <p>
            Handicaps are used as an equaliser across all rounds, ensuring fair competition
            regardless of skill level.
          </p>
        </div>
      </section>

      {/* Rounds */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">The Rounds</h2>
        <div className="space-y-3">
          {ROUNDS.map((round) => (
            <div
              key={round.number}
              className="bg-navy-card border border-white/8 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-white font-semibold">Round {round.number} -- {round.day}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/20 mt-1 inline-block">
                    {round.format}
                  </span>
                </div>
              </div>
              <p className="text-sm text-white/60">{round.description}</p>
              <div className="text-xs text-white/30 mt-1">{round.course} -- {round.teeTime}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Match Structure */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Match Structure</h2>
        <div className="space-y-3">
          {[MATCH_STRUCTURE.round2, MATCH_STRUCTURE.round3, MATCH_STRUCTURE.round4].map((round) => (
            <div key={round.label} className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">{round.label}</h3>
              </div>
              <div className="divide-y divide-white/3">
                {round.matches.map((match, idx) => (
                  <div key={idx} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-white/60">{match.desc}</span>
                    <span className="text-[10px] text-white/20">Match {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Points Structure */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Points Structure</h2>
        <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Friday Stableford Points</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['1st', '8 pts'],
                ['2nd', '7 pts'],
                ['3rd', '6 pts'],
                ['4th', '5 pts'],
                ['5th', '4 pts'],
                ['6th', '3 pts'],
                ['7th', '2 pts'],
                ['8th', '1 pt'],
                ['9th - 12th', '0 pts'],
              ].map(([pos, pts]) => (
                <div key={pos} className="flex justify-between py-1 px-2 rounded bg-white/3">
                  <span className="text-white/60">{pos}</span>
                  <span className="text-green-bright font-medium">{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Handicaps */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Handicaps</h2>
        <div className="bg-navy-card border border-white/8 rounded-xl p-4 text-sm text-white/60">
          <p>
            All players play off their listed handicap. Handicaps are used to level the playing
            field in stableford scoring and to determine strokes given/received in match play
            rounds. The handicaps listed on the Teams page are the official handicaps for this trip.
          </p>
        </div>
      </section>

      {/* Betting Rules */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Betting Rules</h2>
        <div className="bg-navy-card border border-white/8 rounded-xl p-5 space-y-3 text-sm text-white/60">
          <div>
            <h3 className="text-white font-semibold mb-1">Placing Bets</h3>
            <p>
              All bets are placed at the odds displayed at the time of placement. Odds may change
              after your bet is placed, but your bet is locked in at the price taken.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Market Status</h3>
            <p>
              Markets can be Open (accepting bets), Suspended (temporarily closed), or Settled
              (result determined). No bets can be placed on suspended or settled markets.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Settlement</h3>
            <p>
              Markets are settled manually by the bookmaker after the relevant round or event is
              completed. Winning bets are paid at the odds taken. Losing bets forfeit the stake.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Void Bets</h3>
            <p>
              In exceptional circumstances, the bookmaker may void individual bets or entire
              markets. Void bets have their stake returned.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Binding Agreement</h3>
            <p>
              By placing a bet on MattBet you agree to pay MattBet in full on any losing bets.
              All bets are final -- non-cancellable and non-editable. Real money is being
              exchanged. If you win, MattBet pays you. If you lose, you pay MattBet. No exceptions.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-center py-4">
        <p className="text-xs text-white/30">
          All markets are for entertainment purposes only among trip participants.
        </p>
      </div>
    </div>
  );
}
