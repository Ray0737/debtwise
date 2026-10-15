function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

export async function fileToInline(file: File): Promise<{ mimeType: string; data: string }> {
  if (file.type === 'application/pdf') {
    if (file.size > 3_000_000) throw new Error('pdf too large')
    return { mimeType: 'application/pdf', data: await blobToBase64(file) }
  }
  if (!file.type.startsWith('image/')) throw new Error('unsupported file')
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.8))
  return { mimeType: 'image/jpeg', data: await blobToBase64(blob) }
}
