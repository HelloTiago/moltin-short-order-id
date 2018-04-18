const { json, send } = require('micro')
const { router, post } = require('microrouter')
const cors = require('micro-cors')()
const motlinGateway = require('@moltin/sdk').gateway
const cuid = require('cuid')

const moltin = motlinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET
})

// const moltinSecret = process.env.MOLTIN_WEBHOOK_SECRET

module.exports = cors(
  router(
    post('/', async (req, res) => {
      // if ((await req.headers['x-moltin-secret-key']) != moltinSecret)
      //   return send(res, 401)

      // const { resources: [resource] } = await json(req)
      const payload = await json(req)

      // We need to parse resources to get around a bug
      const { data: { id } } = JSON.parse(payload.resources)

      try {
        const short_id = cuid.slug().toUpperCase()
        const order = await moltin.Orders.Update(id, { id, short_id })

        send(res, 200)
      } catch ({ status, json }) {
        send(res, status, json)
      }
    })
  )
)
