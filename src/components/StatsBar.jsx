import { BookMarked, CircleCheckBig, Flame, Repeat } from 'lucide-react'

function StatBox({ icon: Icon, title, value, desc, iconClass }) {
  return (
    <div className="stats border border-base-300 bg-base-100">
      <div className="stat gap-y-0.5 px-4 py-3 sm:px-5 sm:py-4">
        <div className={`stat-figure hidden min-[400px]:block ${iconClass}`}>
          <Icon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
        <div className="stat-title text-xs sm:text-sm">{title}</div>
        <div className="stat-value text-2xl tabular-nums sm:text-3xl">{value}</div>
        <div className="stat-desc whitespace-normal">{desc}</div>
      </div>
    </div>
  )
}

export default function StatsBar({ total, learned, fresh, reviewsToday, streak }) {
  const percent = total ? Math.round((learned / total) * 100) : 0

  return (
    <section aria-label="Özet" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatBox icon={BookMarked} iconClass="text-primary" title="Toplam kelime" value={total} desc={`${fresh} yeni kelime`} />
      <StatBox icon={CircleCheckBig} iconClass="text-success" title="Öğrenildi" value={learned} desc={`%${percent} tamam`} />
      <StatBox icon={Repeat} iconClass="text-info" title="Bugünkü tekrar" value={reviewsToday} desc={reviewsToday ? 'Güzel gidiyorsun' : 'Henüz çalışmadın'} />
      <StatBox icon={Flame} iconClass="text-secondary" title="Çalışma serisi" value={`${streak} gün`} desc={streak ? "Seriyi bozma!" : "Bugün başla"} />
    </section>
  )
}
