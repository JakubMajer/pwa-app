import { useState, useRef, useEffect } from 'react'
import './App.less'

const STORAGE_KEY = 'pwa-photos'

function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
}

export default function App() {
  const [photos, setPhotos] = useState(loadPhotos)
  const [detail, setDetail] = useState(null) // photo object or null
  const inputRef = useRef()

  // sync to localStorage whenever photos change
  useEffect(() => {
    savePhotos(photos)
  }, [photos])

  function handleCapture(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const newPhoto = {
        id: Date.now(),
        dataUrl: ev.target.result,
        note: '',
        timestamp: new Date().toLocaleString('cs-CZ'),
      }
      setPhotos((prev) => [newPhoto, ...prev])
    }
    reader.readAsDataURL(file)
    // reset input so the same photo can be taken again
    e.target.value = ''
  }

  function updateNote(id, note) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, note } : p))
    )
    setDetail((prev) => (prev?.id === id ? { ...prev, note } : prev))
  }

  function deletePhoto(id) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setDetail(null)
  }

  return (
    <div className="app">
      {/* Hidden camera input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="camera-input"
        onChange={handleCapture}
      />

      {/* Grid of tiles */}
      <div className="grid">
        {photos.length === 0 && (
          <p className="empty">Žádné fotky. Použij tlačítko fotoaparátu.</p>
        )}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="tile"
            onClick={() => setDetail(photo)}
          >
            <img src={photo.dataUrl} alt={photo.timestamp} />
            {photo.note && <div className="tile-note">{photo.note}</div>}
          </div>
        ))}
      </div>

      {/* Floating camera button */}
      <button className="fab" onClick={() => inputRef.current.click()} aria-label="Vyfotit">
        📷
      </button>

      {/* Detail overlay */}
      {detail && (
        <div className="overlay" onClick={() => setDetail(null)}>
          <div className="detail" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setDetail(null)}>✕</button>
            <img src={detail.dataUrl} alt={detail.timestamp} />
            <p className="detail-date">{detail.timestamp}</p>
            <textarea
              className="note-input"
              placeholder="Poznámky..."
              value={detail.note}
              onChange={(e) => updateNote(detail.id, e.target.value)}
            />
            <button className="delete-btn" onClick={() => deletePhoto(detail.id)}>
              Smazat fotku
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
