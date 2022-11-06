'use strict'

const axios = require('axios')
const https = require('https')
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
})

axios.defaults.httpsAgent = httpsAgent

class LUCI {
    constructor(host, username, password) {
        this.host = host;
        this.username = username;
        this.password = password;
        this.baseUrl = `${this.host}/cgi-bin/luci/rpc`;
    }

    async init() {
        let authParams = JSON.stringify({
            "id": 1,
            "method": "login",
            "params": [
                this.username,
                this.password
            ]
        })

        try {
            const tokenRes = await axios.post(`${this.baseUrl}/auth`, `${authParams}`);
            this.token = tokenRes.data.result;            
        } catch (error) {
            console.log("Authentication failed", error);
        }

    }

    async getChanges() {
        let params = JSON.stringify({
            method: "changes"
        })

        try {
            const result = await axios.post(`${this.baseUrl}/uci?auth=${this.token}`, params)
            return result.data
        } catch(e) {
            console.log(e, "Getting changes failed")
        }
    }

    async getChangedSections(){
        const changes = (await this.getChanges()).result
        let sections = []

        for(let change in changes) {
            sections.push(change)
        }

        return sections
    }

    async commit(section = null) {
        let sections;

        if(section == null) {
            const changedSections = await this.getChangedSections()
            sections = changedSections
        } else {
            sections = [section]
        }

        if (sections.length === 0) {
            return true
        }

        let params = JSON.stringify({
            method: "commit",
            params: (sections == [] ? [section] : sections)
        })

        try {
            const result = await axios.post(`${this.baseUrl}/uci?auth=${this.token}`, params)
            if(result.data.result !== true) {
                throw new Error("Failed to commit config")
            }

            return result.data.result
        } catch(e) {
            console.log(e)
        }
    }
    
    async set(config) {
        let params = JSON.stringify({
            method: "set",
            params: config
        })

        try {
            const result = await axios.post(`${this.baseUrl}/uci?auth=${this.token}`, params)
            if(result.data.result !== true) {
                throw new Error("Failed to set config")
            }

            return result.data.result
        } catch(e) {
            console.log(e)
        }
    }

    async getAll(config) {
        let params = JSON.stringify({
            method: "get_all",
            params: [config]
        })

        try {
            const result = await axios.post(`${this.baseUrl}/uci?auth=${this.token}`, params)
            const entries = result.data.result
            if(Array.isArray(entries)) {
                if(result.data.result[0] == false && result.data.result[1] == "Entry not found") {
                    throw new Error("Entry not found")
                }
            } else {
                return entries
            }
        } catch(e) {
            console.log(e)
        }
    }

    async get(config) {
        let params = JSON.stringify({
            method: "get",
            params: config
        })

        try {
            const result = await axios.post(`${this.baseUrl}/uci?auth=${this.token}`, params)
            const entries = result.data.result
            if(entries == null) {
                    throw new Error("Entry not found")
            }
            return entries
        } catch(e) {
            console.log(e)
        }
    }

    async delete(config) {
        let params = JSON.stringify({
            method: "delete",
            params: config
        })

        try {
            const result = await axios.post(`${this.baseUrl}/uci?auth=${this.token}`, params)
            if(result.data.result != true) {
                throw new Error("Failed to delete config")
            }

            return result.data.result
        } catch(e) {
            console.log(e)
        }
    }
}

module.exports = {
    LUCI
}