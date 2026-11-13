import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const sourceDir = path.resolve('public/images/scene')
const optimizedDir = path.join(sourceDir, 'optimized')

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const getTargetWidth = (fileName) => (fileName.startsWith('bg-') ? 2560 : 1024)

const main = async () => {
  await fs.mkdir(optimizedDir, { recursive: true })

  const files = (await fs.readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => entry.name)
    .sort()

  if (files.length === 0) {
    console.log('No PNG source files found in public/images/scene; original PNGs remain untouched.')
    console.log('Before total: 0 B')
    console.log('After total: 0 B')
    return
  }

  let totalBefore = 0
  let totalAfter = 0

  for (const fileName of files) {
    const sourcePath = path.join(sourceDir, fileName)
    const destinationPath = path.join(optimizedDir, `${path.basename(fileName, '.png')}.webp`)

    const sourceStats = await fs.stat(sourcePath)
    totalBefore += sourceStats.size

    const metadata = await sharp(sourcePath).metadata()
    const targetWidth = getTargetWidth(fileName)
    const width = metadata.width && metadata.width > targetWidth ? targetWidth : metadata.width || targetWidth

    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 80, effort: 6 })
      .toFile(destinationPath)

    const optimizedStats = await fs.stat(destinationPath)
    totalAfter += optimizedStats.size

    console.log(
      `${fileName}: ${formatBytes(sourceStats.size)} -> ${formatBytes(optimizedStats.size)} (${((1 - optimizedStats.size / sourceStats.size) * 100).toFixed(1)}% smaller)`
    )
  }

  console.log(`Total before: ${formatBytes(totalBefore)}`)
  console.log(`Total after: ${formatBytes(totalAfter)}`)
}

main().catch((error) => {
  console.error('Scene image optimization failed:')
  console.error(error)
  process.exitCode = 1
})
