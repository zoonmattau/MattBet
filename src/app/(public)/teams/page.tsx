import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const supabase = await createServerSupabase();

  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(*)')
    .order('name');

  const teamsList = teams || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white mb-2">The Teams</h1>
      <p className="text-white/50 text-sm mb-6">
        12 players. 3 teams of 4. Who will take the glory?
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {teamsList.map((team) => {
          const players = team.players || [];
          const isFavourite = team.name === 'Group 3';
          const avgHc = team.avg_handicap || (
            players.length > 0
              ? (players.reduce((s: number, p: { handicap: number }) => s + p.handicap, 0) / players.length).toFixed(1)
              : '0'
          );
          const lowestHc = players.length > 0
            ? Math.min(...players.map((p: { handicap: number }) => p.handicap))
            : 0;
          const highestHc = players.length > 0
            ? Math.max(...players.map((p: { handicap: number }) => p.handicap))
            : 0;

          let strengthLabel = 'Contenders';
          if (isFavourite) strengthLabel = 'Favourites';
          else if (team.name === 'Group 2') strengthLabel = 'Dark Horses';

          return (
            <div
              key={team.id}
              className={`bg-navy-card border rounded-xl overflow-hidden ${
                isFavourite ? 'border-gold/30' : 'border-white/8'
              }`}
            >
              <div className={`px-4 py-3 border-b ${isFavourite ? 'border-gold/20 bg-gold/5' : 'border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold">{team.name}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isFavourite
                      ? 'bg-gold/20 text-gold'
                      : 'bg-white/5 text-white/40'
                  }`}>
                    {strengthLabel}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {players
                    .sort((a: { handicap: number }, b: { handicap: number }) => a.handicap - b.handicap)
                    .map((player: { id: string; name: string; handicap: number }) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <span className="text-sm text-white/80 font-medium">{player.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50 font-mono">
                          HC {player.handicap}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="pt-3 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Average HC</span>
                    <span className="text-white/60 font-medium">{avgHc}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">HC Range</span>
                    <span className="text-white/60 font-medium">{lowestHc} - {highestHc}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
