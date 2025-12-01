let commands = {
    'info' : {
        description: "Returns information on how to join"
    },
    'status' : {
        description: "Returns the minecraft server's status"
    },
    'next-event' : {
        description: "Returns the next planned event"
    },
    'run-time' : {
        description: "Returns how long has the server been running for"
    },
    'refresh-teams' : {
        description: "(admin) Refresh teams in-game"
    },
    'execute' : {
        description: "(admin) Execute the given command sequence in-game",
        options: [{
                name: 'name',
                type: 3, // STRING
                description: 'command',
                required: true,
                choices: [
                { name: 'Blue Crew',  value: 'BlueCrew' },
                { name: 'Blue Kits',  value: 'BlueKits' },
                { name: 'Blue Spawn', value: 'BlueSpawn'},

                { name: 'Red Crew', value: 'RedCrew'},
                { name: 'Red Kits', value: 'RedKits'},
                { name: 'Red Spawn', value: 'RedSpawn'},

                { name: 'Start round', value: 'Start'},
                { name: 'End round',   value: 'Stop'},
                ]
        }]
    }
}

let onCommand = {}

onCommand['info'] = async (context, client, server) => {
    context.reply({
        content: "- Host: Username_Watever.exaroton.me \n- Port: 48206 (optional)",
        ephemeral : true
    })
}

function getStatusMessage(server) {
    server.get();
    if (server.hasStatus(server.STATUS.ONLINE)) {
        return "Server is online";
    } else if (server.hasStatus([server.STATUS.PREPARING, server.STATUS.LOADING, server.STATUS.STARTING])) {
        return "Server is online soon";
    } else {
        return "Server is offline";
    }
}

onCommand['status'] = async (context, client, server) => {
    context.reply({
        content: getStatusMessage(server),
        ephemeral : true
    })
}

onCommand['next-event'] = async (context, client, server) => {
    const events_channel = client.channels.cache.get('1396863890146590730');

    const messages = await events_channel.messages.fetch({ after: 0, limit: 1 });
    
    const firstMessage = messages.first();
    
    if (!firstMessage) {
        context.reply({
            content: "No events planned",
            ephemeral : true
        })
        return
    }

    context.reply({
        content: firstMessage.content,
        ephemeral : true
    })
}

function getRuntimeMessage(server) {
    let start = server.startDate

    if (start) {
        let millis = Date.now() - start;
        let hours = Math.floor(millis / 1000 / 60 * 10) / 10
        return 'Server has been running for '+hours+' hours.'
    }
    
    return 'Server is offline'
}

onCommand['run-time'] = async (context, client, server) => {
    context.reply({
        content: getRuntimeMessage(server),
        ephemeral : true
    })
}

const teams = require('./teams.js')

onCommand['refresh-teams'] = async (context, client, server) => {
    if (!isAdmin(context.user.id)) {
        context.reply({
            content: 'User not permitted',
            ephemeral : true
        })
        return
    }

    teams.refresh(server)
    
    context.reply({
        content: 'refreshed',
        ephemeral : true
    })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeSequence(server, name) {
    const commands = require('./command_json/'+name+'.json')

    console.log(commands)

    for (c in commands) {
        const command = commands[c]
        console.log(command)

        if ((typeof command) == 'number') {
            await sleep(command * 1000); 
        } else {
            try {
                var success = await server.executeCommand(command);
                if (!success) {
                    console.log('failed command at: ', command)
                }
            } catch (e) {
                console.error(e.message);
            }
            
        }
    }
}

const vicky = '1318871264412303435'
const crocblancyt = '688684996986273835'

function isAdmin(id) {
    return (id == vicky) || (id == crocblancyt)
}

onCommand['execute'] = async (context, client, server) => {
    if (!isAdmin(context.user.id)) {
        context.reply({
            content: 'User not permitted',
            ephemeral : true
        })
        return
    }

    const serverIsOnline = server.hasStatus(server.STATUS.ONLINE)
    if (!serverIsOnline) {
        context.reply({
            content: 'Server is offline',
            ephemeral : true
        })
        return
    }
        
    const name = context.options.getString('name');

    try {
        executeSequence(server, name)
    } catch(e) {
        console.log(name, + ': ' + e)
    }
    
    context.reply({
        content: 'Sequence executed',
        ephemeral : true
    })
}

module.exports = {
    commands: commands,
    onCommand: onCommand
}