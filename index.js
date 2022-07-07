const WebSocket = require("ws").Server;
const HttpsServer = require('https').createServer;
const app = require('express')();
app.use(require('express').json())  
const fs = require("fs");

const connected = {};

server = HttpsServer({
    cert: fs.readFileSync('/proxy_websoket/cert.pem'),
    key: fs.readFileSync('/proxy_websoket/privkey.pem')
})
socket = new WebSocket({
    server: server
});

app.post('/', (req, res) => {
    const {token,data} = req.body
    // console.log(token,data)
    if(connected[token])
    {
        for(const client of connected[token])
        {
            client.send(JSON.stringify(data));
        }
    }
    res.send('ok')
});
app.listen(1368, () => {
    console.log('listening on port 1368');
});


const get_parameters = (req) => {
    const full_url = req.url;
    const raw_url = full_url.split('?');
    if(raw_url.length == 2) {
        const raw_params = raw_url[1];
        const params = raw_params.split('&');
        const result = {};
        params.forEach((param) => {
            const key_value = param.split('=');
            result[key_value[0]] = key_value[1];
        });
        return result;
    }
    return {}
}

// on connect
socket.on('connection', (ws,req) => {
    // setup routes
    const { token } = get_parameters(req);
    // console.log(token)
    // check if token exists in connected
    if(!connected[token]) {
        connected[token] = [];
    }
    // add to connected
    connected[token].push(ws);
    ws.on('close', () => {
        // console.log('closed')
        connected[token] = connected[token].filter((client) => client !== ws);
    });
})

// on disconect remove from the list

server.listen(5963);
console.log('listening on port 5963');
