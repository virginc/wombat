const { parse } = require('url')
const getConfing = require('../get-config')
const getEntity = require('../get-entity')
const cors = require('../cors')

module.exports = (content, config) => (request, response, dev = false) => {
  config = getConfing(config)
  const params = parse(request.url, true).query
  const name = params.name
  const lang = params.lang || config.defaultLang

  try {
    const entity = getEntity(content, lang, name)

    cors(request, response, config, dev)

    if (!entity) throw new Error('Entity not found')
    response.end(JSON.stringify(entity))
  }
  catch (e) {
    console.error(e)
    response.statusCode = 404
    response.end(`Cannot GET ${request.url}`)
  }
}
