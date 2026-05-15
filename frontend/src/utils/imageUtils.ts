export function resizeImageToBase64(file: File, size = 200): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = size
                canvas.height = size

                const ctx = canvas.getContext('2d')!
                const scale = Math.max(size / img.width, size / img.height)
                const scaledW = img.width * scale
                const scaledH = img.height * scale
                const offsetX = (size - scaledW) / 2
                const offsetY = (size - scaledH) / 2

                ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH)
                resolve(canvas.toDataURL('image/jpeg', 0.85))
            }
            img.onerror = reject
            img.src = e.target!.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
