# omada-api
Create vouchers on Omada

## Requirements
- Omada Controller version **5.12.50** or latest
- Omada Controller must be connected to Omada Cloud

#### Create new voucher
```http
  POST https://omada-api.fly.dev/voucher
```
**Required** parameters
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | unique string |
| `expirationTime` | `int` | Voucher expiration date in milliseconds |
| `duration` | `int` | Voucher usage time limit in minutes. |
| `unitPrice` | `int` | Price of the voucher |
| `username` | `string` | Hotspot operator username |
| `password` | `string` | Hotspot operator password |
| `cid` | `string` | Omada controller id |
| `siteId` | `string` | Site id |

**Optional** parameters
| Parameter | Type     | Description                | Default Value                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `codeLength` | `int` | Voucher code length | 6 |
| `amount` | `int` | Number of vouchers that will be created | 1 |
| `type` | `int` | Voucher type. 0-Limited Usage Counts； 1-Limited Online Users； | 1 |
| `trafficLimitEnable` | `bool` | Enable traffic limit. | false |
| `trafficLimit` | `int` | Traffic limit in kilobytes | null |
| `durationType` | `int` | Type of voucher duration. 0 - fixed time upon use, 1 - by usage | 6 |
| `description` | `string` | Voucher description | null |
| `maxUsers` | `int` | How many online users can connect simultaneously | 1 |
| `currency` | `string` | Currency type | PHP |