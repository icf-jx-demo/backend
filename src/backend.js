const Koa = require('koa')
const route = require('koa-route')
// const parse = require('co-body')

const app = new Koa()

app.use(route.get('/*', all))

async function all(ctx) {
  let headers = this.request.headers
  let query = this.request.query
  let env = process.env

  console.log('headers', headers)
  console.log('query', query)
  console.log('ctx', ctx)

  this.set('Access-Control-Allow-Origin', '*')

  let message = env.message || 'hello'

  ctx.body = { headers, query, message }
}

module.exports = app
