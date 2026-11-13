import { build, createServer, preview } from 'vite'
import config from '../vite.config.js'

const command = process.argv[2]
const options = { ...config, configFile: false }

if (command === 'build') {
  await build(options)
} else if (command === 'dev') {
  const server = await createServer(options)
  await server.listen()
  server.printUrls()
} else if (command === 'preview') {
  const server = await preview(options)
  server.printUrls()
} else {
  throw new Error('Use dev, build, or preview.')
}
