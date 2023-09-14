import { BASE_URL, API_PATH } from './omada_config'
import { voucher_config } from './voucher_config'

const buildpath = (CID:string, path:string) => `${BASE_URL}/${CID}/${API_PATH}/${path}`

const login = async (cid:string, operator:string) => {
    const response = {
        ok: false,
        token: '',
        cookie: '',
        msg: ''
    }
    await fetch(buildpath(cid, 'hotspot/login'), {
        method: 'POST',
        body: operator,
        headers: {'content-type': 'application/json'},
    })
    .then(res => {
        response.cookie = res.headers.get("Set-Cookie") || ''
        return res.json()
    })
    .then(({ errorCode, msg, result }) => {
        response.ok = errorCode == 0
        response.msg = msg
        response.token = result?.token
    })

    return response
}

const create_voucher = async (cid:string, siteId:string, token:string, cookie:string, request:object) => {
    const body = JSON.stringify({ ...voucher_config, ...request }) // voucher config here!
    let response = null
    await fetch(buildpath(cid, `hotspot/sites/${siteId}/voucherGroups`), {
        method: 'POST',
        headers: {'content-type': 'application/json', 'Csrf-Token': token, 'Cookie': cookie},
        body,
    })
    .then(res => res.json())
    .then(data => {
        response = {...data}
    })

    return response
}

const get_voucherGroup = async (cid:string, siteId:string, token:string, cookie:string, id:string) => {
    let response = null
    await fetch(`${buildpath(cid, `hotspot/sites/${siteId}/voucherGroups`)}/${id}`, {
        method: 'GET',
        headers: {'Csrf-Token': token, 'Cookie': cookie},
    })
    .then(res => res.json())
    .then(data => {
        response = {...data}
    })

    return response
}



export { login, create_voucher, get_voucherGroup }