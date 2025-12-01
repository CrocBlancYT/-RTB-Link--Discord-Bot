const fs = require('fs')

function onJSON(callback) {
    fs.readFile('../teams.json', 'utf8', async function (err, data) {
        if (err) { return console.log(err) }
        try {
            const json = JSON.parse(data)
            callback(json)
        } catch(e) {
            console.log(e)
        }
    })
}

var prev = {
    Blue: {},
    Red: {}
}

async function removePlayer(server, teamName, playerName) {
    server.executeCommand(`/team leave ${teamName} ${playerName}`);
}

async function addPlayer(server, teamName, playerName) {
    server.executeCommand(`/team join ${teamName} ${playerName}`);
}

function refreshTeam(server, prev, curr) {
    for (playerName in curr) {
        if (!prev[playerName]) {
            addPlayer(server, playerName)
        }
    }

    for (playerName in prev) {
        if (!curr[playerName]) {
            removePlayer(server, playerName)
        }
    }
}

async function refresh(server) {
    onJSON(curr => {
        try {
            refreshTeam(server, prev.Blue, curr.Blue)
            refreshTeam(server, prev.Red, curr.Red)
            prev = curr
        } catch(e) {
            console.log("teams: " + e)
        }
    })
}

module.exports = {
    refresh: refresh
}