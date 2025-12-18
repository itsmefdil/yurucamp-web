export interface CompressionOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    type?: string
}

export async function compressImage(file: File, options?: CompressionOptions): Promise<File> {
    const maxWidth = options?.maxWidth || 1920
    const maxHeight = options?.maxHeight || 1920
    const quality = options?.quality || 0.8
    const type = options?.type || 'image/jpeg'

    // Return original file if it's small enough (e.g. < 1MB)
    if (file.size < 1024 * 1024) {
        return file
    }

    return new Promise((resolve, reject) => {
        const image = new Image()
        const reader = new FileReader()

        reader.onload = (e) => {
            if (e.target?.result) {
                image.src = e.target.result as string
            } else {
                reject(new Error("Failed to load image"))
            }
        }

        reader.onerror = (e) => reject(e)

        image.onload = () => {
            let width = image.width
            let height = image.height

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width)
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height)
                    height = maxHeight
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error("Failed to get canvas context"))
                return
            }

            // Draw image to canvas
            ctx.drawImage(image, 0, 0, width, height)

            // Convert to blob/file
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: type,
                            lastModified: Date.now(),
                        })

                        // Use compressed file only if it is smaller than original
                        if (compressedFile.size < file.size) {
                            resolve(compressedFile)
                        } else {
                            resolve(file)
                        }
                    } else {
                        reject(new Error("Failed to compress image"))
                    }
                },
                type,
                quality
            )
        }

        image.onerror = (e) => reject(e)

        reader.readAsDataURL(file)
    })
}
