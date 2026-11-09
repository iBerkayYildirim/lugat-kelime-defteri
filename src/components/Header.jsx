import { useRef } from 'react'
import {
  BookOpen,
  Download,
  EllipsisVertical,
  GraduationCap,
  Moon,
  NotebookPen,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'

const VIEWS = [
  { id: 'defter', label: 'Defterim', icon: NotebookPen },
  { id: 'calis', label: 'Çalış', icon: GraduationCap },
]

export default function Header({ view, onViewChange, isDark, onToggleTheme, onExport, onImport, onLoadSamples, onClearAll }) {
  const menuRef = useRef(null)
  const fileRef = useRef(null)

  // Menüden bir işlem seçilince açılır menüyü kapat.
  const run = (action) => {
    menuRef.current?.removeAttribute('open')
    action()
  }

  const openFilePicker = () => fileRef.current?.click()

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (file) onImport(file)
    event.target.value = ''
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/85 backdrop-blur">
      <nav className="navbar mx-auto max-w-6xl gap-2 px-4 sm:px-6">
        <div className="navbar-start min-w-0">
          <a href="#defter" className="flex items-center gap-2" aria-label="Lügat ana sayfa">
            <span className="grid size-9 place-items-center rounded-field bg-primary text-primary-content">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden leading-tight min-[420px]:block">
              <span className="block font-serif text-xl font-semibold">Lügat</span>
              <span className="hidden text-xs text-base-content/60 sm:block">Kişisel kelime defteri</span>
            </span>
          </a>
        </div>

        <div className="navbar-center">
          <div role="tablist" aria-label="Görünüm" className="tabs tabs-box tabs-sm">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                className={`tab gap-1.5 ${view === id ? 'tab-active' : ''}`}
                onClick={() => onViewChange(id)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="navbar-end gap-1">
          <button
            type="button"
            className={`btn btn-ghost btn-circle btn-sm swap swap-rotate ${isDark ? 'swap-active' : ''}`}
            onClick={onToggleTheme}
            aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
            title={isDark ? 'Açık tema' : 'Koyu tema'}
          >
            <Sun className="swap-on size-5" aria-hidden="true" />
            <Moon className="swap-off size-5" aria-hidden="true" />
          </button>

          <details ref={menuRef} className="dropdown dropdown-end">
            <summary className="btn btn-ghost btn-circle btn-sm" aria-label="Veri işlemleri menüsü">
              <EllipsisVertical className="size-5" aria-hidden="true" />
            </summary>
            <ul className="menu dropdown-content z-40 mt-2 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
              <li className="menu-title">Veriler</li>
              <li>
                <button type="button" onClick={() => run(onExport)}>
                  <Download className="size-4" aria-hidden="true" /> Yedeği indir (JSON)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => run(openFilePicker)}>
                  <Upload className="size-4" aria-hidden="true" /> Yedekten yükle
                </button>
              </li>
              <li>
                <button type="button" onClick={() => run(onLoadSamples)}>
                  <RotateCcw className="size-4" aria-hidden="true" /> Örnek kelimeleri ekle
                </button>
              </li>
              <li>
                <button type="button" className="text-error" onClick={() => run(onClearAll)}>
                  <Trash2 className="size-4" aria-hidden="true" /> Tüm kelimeleri sil
                </button>
              </li>
            </ul>
          </details>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>
      </nav>
    </header>
  )
}
