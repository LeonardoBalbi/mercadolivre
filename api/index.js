const bootstrap = require('../server/index')

module.exports = async (req, res) => {
  const app = await bootstrap()
  return app(req, res)
}
