# luci-rpc

A simple RPC communication library for the JSON LUCI RPC API.

## Example

```js
const { LUCI } = require('./lib/luci')

async function main() {
    const luci = new LUCI('https://192.168.1.2', 'root', 'x')

    await luci.init()

    console.log(await luci.getAll("network"))
    console.log(await luci.get(["network", "@device[0]", "ports"]))

    await luci.set(["network", "lan", "ipaddr", "192.168.1.1"])
    console.log(await luci.getChangedSections())
    console.log(await luci.getChanges())
    console.log(await luci.commit("network"))
}

main()
```

## LICENSE 

GPL-3.0