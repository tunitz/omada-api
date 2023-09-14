import { Elysia, t } from "elysia";
import { staticPlugin } from '@elysiajs/static'
import { login, create_voucher, get_voucherGroup } from './omada_callouts'

const cache : { [key: string]: any } = {}
const cache_timeout = 20 * 60 * 1000 // first digit is minutes

const loginStatus = async (cid:string, siteId:string, name:string, password:string) => {
  const { ok, token, cookie, msg } = await login(cid, JSON.stringify({ name, password }))
  if (!ok) return { ok, error: msg }

  cache[cid] = { ...cache[cid], [siteId]: { token, cookie, timeout: Date.now(), isvalid: function() {return Date.now() - this.timeout < cache_timeout} }}
  return { ok, token, cookie }
}

const app = new Elysia()
  .use(staticPlugin())
  .onError(({ error, set }) => {
    set.status = 500
    return error
  })
  .post('/voucher', async ({ body }) => {
    const { cid, siteId, username, password  } = body

    // Do an initial setup
    if (!cache[cid]?.[siteId]?.isvalid) {
        const { ok, error } = await loginStatus(cid, siteId, username, password)
        if (!ok) throw new Error(error)
    }

    const { token, cookie } = cache[cid][siteId]
    let new_voucher:any = await create_voucher(cid, siteId, token, cookie, body)

    if (new_voucher?.errorCode != 0) throw new Error(new_voucher.msg)
    
    const voucherGroup:any = await get_voucherGroup(cid, siteId, token, cookie, new_voucher?.result?.id)

    if (voucherGroup?.errorCode != 0) throw new Error(voucherGroup.msg)

    const { data } = voucherGroup.result
    const [ voucher ] = data
    return voucher
  }, {
    body: t.Object({
      cid: t.String(),
      siteId: t.String(),
      username: t.String(),
      password: t.String(),
      name: t.String(),
      rateLimitId: t.String(),
      expirationTime: t.Integer(),
      duration: t.Integer(),
      unitPrice: t.Integer(),
    })
  })
  .get('/install', () => Bun.file('public/install.sh'))
  .listen(3000);
