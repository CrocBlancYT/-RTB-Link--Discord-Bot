
const { CLIENT_TOKEN, SERVER_ID, BOT_TOKEN } = require('../config.json');

var { Client } = require('exaroton');

var account = new Client(CLIENT_TOKEN);
var server = account.server(SERVER_ID);

var { Client, GatewayIntentBits, Guild } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    shards: 'auto'
});

const {commands, onCommand} = require('./commands.js')

client.once('ready', async (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
    
    const guild = await client.guilds.cache.get('1396863586613203086'); // RTB
    await guild.commands.set([]);
    
    console.log('\nLoading commands..')
    for (const name in commands) {
        try {
            var info = commands[name]
            info.name = name
            console.log(' >'+name+': '+info.description)
            guild.commands.create(info);
        } catch (e) {
            console.log('command register: '+e)
        }
    };
});

client.on('interactionCreate', async context => {
    if (!context.isChatInputCommand()) return;

    try {
        console.log('executing '+context.commandName)
        const command = onCommand[context.commandName]
        if (command) {
            command(context, client, server)
        }
    } catch (e) {
        console.log('command exec: '+e)
    }
});


server.subscribe("console");

var lastState = server.STATUS.OFFLINE
server.startDate = null;
server.subscribe("status");
server.on("status", function(server) {
    if (!server.hasStatus(lastState)) { return }
    
    if (server.hasStatus(server.STATUS.STARTING)) {
        server.startDate = Date.now();
        lastState = server.STATUS.STARTING
        console.log('starting')
    } else if (server.hasStatus(server.STATUS.OFFLINE)) {
        server.startDate = null;
        lastState = server.STATUS.OFFLINE
        console.log('ending')
    }
    
    // const status_channel = client.channels.cache.get('1414402449313103946');
    // status_channel.send(getStatusMessage());
});


client.on('shardDisconnect', (event, id) => {
  console.warn(`Shard ${id} disconnected (${event.code})`);
});

client.on('shardReconnecting', id => {
  console.log(`Shard ${id} reconnecting...`);
});

client.on('shardResume', id => {
  console.log(`Shard ${id} successfully resumed`);
});

client.on('shardError', (error, id) => {
  console.error(`Shard ${id} error:`, error);
});

try {
    client.login(BOT_TOKEN);
} catch (e) {
    console.log(e)
}

console.log('running anyway')
