const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express()
const activeServers = {}

// Get Server Details
const config = JSON.parse(fs.readFileSync('C:\\config.json',{encoding: 'utf-8'}))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

function getProcesses(){

    const cp = require('child_process')
    var pid_list = cp.execSync('tasklist')

    var list = pid_list.toString().split('\n')
    var processes = []

    list.forEach((line)=>{
        let line_array = line.split(' ').filter((item)=>{
            return item != ''
        })

        processes.push({
            name: line_array[0],
            id: line_array[1],
            session: {
                id: line_array[3],
                name: line_array[2]
            },
            memory: line_array[4]

        })
    })

    return processes

}

function getProcess(id){

        return getProcesses().filter((proc)=>{
            return proc.id == id
        })[0]
}

function getServer(id){

    // 404 - Resource Not Found
    if(activeServers[id] == null || activeServers[id] == undefined){
        //res.statusCode = 404
        //return res.send({
        return {    
            status: "error",
            data: {
                code: 404,
                msg: "Resource Not Found"
            }
        }
        //)
    }

    // 200 - Server Found
    // Check if process still active
    if(getProcess(activeServers[id].instance.pid)){
        // ID found in List
        return {
            status: "success",
            data: {
                id: id,
                created: activeServers[id].created,
                status: "running"
            }
        }

    }

    // 500 - Internal Server Error
    else{
        //res.statusCode = 409
        //return res.send({
        return {
            status: "error",
            data: {
                code: 500,
                msg: "Process is not running - Something went wrong"
            }
        }
        //)

    }
}

// Check for Header Credentials
app.use((req, res, next)=>{
    let c_id = req.headers['client_id']
    let c_secret = req.headers['client_secret']
    if(c_id == config.credential.id && c_secret == config.credential.secret){
        next()
    }
    else{
        res.statusCode = 401
        res.send({
            status: "error",
            error:{
                code: 401,
                msg: "Unauthorized"
            }
        })
    }
})

// GET: SERVERS
// Status of all running servers
app.get('/api/servers', (req, res)=>{

    let keys = Object.keys(activeServers)
    let servers = []

    keys.forEach((id)=>{
        servers.push(getServer(id).data)
    })
    
    res.statusCode = 200
    return res.send({
        status: "success",
        data: servers
    })
})

// POST: /SERVERS
// Start/Create a Server
app.post('/api/servers', (req, res) => {
    const execPath = config.path + "\\configs\\" + req.body.configId + ".txt"
    const port = req.body.port
    const gtPath = '\\savegames'

    const { spawn } = require('child_process')
    var instance = spawn(config.path + '\\haloded.exe',['-exec', execPath, '-port', port])
    
    // Incase you ever get the unbuffered console working
    //var instance = spawn('node',['.\\test.js',config.path, execPath, port])

    // 200 - Success
    setTimeout(()=>{

        //instance.pid && !instance.killed
        if(getProcess(instance.pid)){
            // Created Date
            let created = (new Date())

            // Add running server to List
            activeServers[req.body.id] = {
                instance: instance,
                created: created
            }

            // set return payload
            var statusCode = 200
            var payloadStatus = "success"
            var data = {
                id: req.body.id,
                created: created,
                status: "running"
            }
        }
        // 500 - Internal Server Error
        else{
            console.log("500")
            var statusCode = 500
            var payloadStatus = "error"
            var data = {
                code: 500,
                msg: "Unable to Start/Create new Server"
            }
        }
        
        res.statusCode = statusCode
        return res.send({
            status: payloadStatus,
            data: data
        })
    },500)



})

// GET: SERVERS/:ID
// Status of requested server
app.get('/api/servers/:id', (req, res) => {
    console.log("GET:/servers/" + req.params.id)
    
    var result = getServer(req.params.id)

    if(result.status == "error"){
        res.statusCode = result.data.code
        return res.send(result)
    }
    else{
        res.statusCode = 200
        return res.send(result)
    }

})

// DELETE: SERVERS/:ID
// Stop/Remove a server
app.delete('/api/servers/:id', (req, res) => {
    console.log("DELETE:/servers/" + req.params.id)

    let serv = activeServers[req.params.id]

    process.kill(activeServers[req.params.id].instance.pid)

    res.statusCode = 204
    return res.send()
})

// Start API
app.listen(config.port, ()=>{
    console.log("Runnin on port: " + config.port)
})