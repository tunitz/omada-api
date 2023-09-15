import { Elysia, t } from "elysia";
import { login, create_voucher, get_voucherGroup } from './omada_callouts'


const cache : {[key: string]: {
  token: string,
  cookie: string,
  timeout: number,
  isvalid: Function
}} = {}
const cache_timeout = 20 * 60 * 1000 // first digit is minutes

const loginStatus = async (cid:string, siteId:string, name:string, password:string) => {
  const { ok, token, cookie, msg } = await login(cid, JSON.stringify({ name, password }))
  if (!ok) return { hasError: !ok, msg }

  cache[`${cid}-${siteId}-${name}`] = { token, cookie, timeout: Date.now(), isvalid: function() { return Date.now() - this.timeout < cache_timeout }}

  return cache[`${cid}-${siteId}-${name}`]
}

const app = new Elysia()
  .onError(({ error, set }) => {
    set.status = 500
    return error
  })
  .post('/voucher', async ({ body }) => {
    const { cid, siteId, username, password  } = body
    let _cache = cache[`${cid}-${siteId}-${username}`]
    
    // Do an initial setup
    if (!_cache?.isvalid()) {
        const result:any = await loginStatus(cid, siteId, username, password)
        if (result.hasError) throw new Error(result.msg)
        _cache = result
    }

    const { token, cookie } = _cache
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
