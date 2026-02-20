import { useState, useRef, useEffect } from 'react'
import { openDB } from 'idb'
import './App.less'

const DB_NAME = 'pwa-photos-db'
const STORE = 'photos'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' })
    },
  })
}

async function loadPhotos() {
  const db = await getDB()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => b.id - a.id)
}

async function savePhoto(photo) {
  const db = await getDB()
  await db.put(STORE, photo)
}

async function removePhoto(id) {
  const db = await getDB()
  await db.delete(STORE, id)
}

export default function App() {
  const [photos, setPhotos] = useState([])
  const [detail, setDetail] = useState(null)
  const inputRef = useRef()

  useEffect(() => {
    loadPhotos().then(setPhotos)
  }, [])

  function handleCapture(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const newPhoto = {
        id: Date.now(),
        dataUrl: ev.target.result,
        note: '',
        timestamp: new Date().toLocaleString('cs-CZ'),
      }
      await savePhoto(newPhoto)
      setPhotos((prev) => [newPhoto, ...prev])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function updateNote(id, note) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, note } : p))
    )
    setDetail((prev) => (prev?.id === id ? { ...prev, note } : prev))
    const db = await getDB()
    const photo = await db.get(STORE, id)
    if (photo) await db.put(STORE, { ...photo, note })
  }

  async function deletePhoto(id) {
    await removePhoto(id)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setDetail(null)
  }

  return (
    <div className="app">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="camera-input"
        onChange={handleCapture}
      />

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

      <button className="fab" onClick={() => inputRef.current.click()} aria-label="Vyfotit">
        📷
      </button>

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
