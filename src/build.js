const path = require('path')
const fs = require('fs-extra')
const camelCase = require('lodash.camelcase')
const showdown = require('showdown')
const converter = new showdown.Converter()
const getConfig = require('./get-config')

const walk = async dir => {
  dir = path.resolve(dir)
  const tree = {}
  const files = await fs.readdir(dir)

  for (let file of files) {
    const filePath = path.join(dir, file)
    const fileName = path.basename(filePath)
    const propName = camelCase(fileName.replace(/\..*/, ''))
    const stat = await fs.stat(filePath)

    if (stat.isDirectory()) {
      tree[propName] = await walk(filePath)
    }

    if (stat.isFile()) {
      const content = await fs.readFile(filePath, 'utf8')
      const extension = path.extname(filePath)

      switch(extension) {
        case '.json':
          tree[propName] = JSON.parse(content)
          break
        case '.md':
          tree[propName] = converter.makeHtml(content)
          break
      }
    }
  }

  return tree
}

module.exports = async (config = {}, content) => {
  console.log('Building...')
  config = getConfig(config)
  const dbPath = path.resolve(config.dest)

  // Remove old database
  if (await fs.pathExists(dbPath)) {
    await fs.remove(dbPath)
  }

  if (!content) {
    content = await walk(config.src)
  }

  await fs.writeFile(dbPath, JSON.stringify(content), 'utf8')

  console.log('Build finished!')
}
