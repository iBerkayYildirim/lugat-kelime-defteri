import { useEffect, useRef } from 'react'

/** Geri alınamayan işlemler için onay penceresi. */
export default function ConfirmDialog({ title, message, confirmLabel = 'Onayla', onConfirm, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const confirm = () => {
    onConfirm()
    dialogRef.current?.close()
  }

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose} aria-labelledby="confirm-title">
      <div className="modal-box max-w-sm">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="py-3 text-base-content/70">{message}</p>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
            Vazgeç
          </button>
          <button type="button" className="btn btn-error" onClick={confirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">Kapat</button>
      </form>
    </dialog>
  )
}
