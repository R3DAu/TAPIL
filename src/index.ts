require('dotenv').config();
const client = require('./lib/client');
const helpers = require('./lib/Helpers');

/*let c = new client.client(process.env.TWITCH_USER,process.env.TWITCH_PASS,process.env.TWITCH_CHANNELS,process.env.COMMAND_PREFIX);
c.eventEmitter.on('commandTriggered', (command:string, parameters:string, channel:string, nick:string) => {
    console.log(`${parameters} ${channel} ${nick}`);

    if(command == "test")
        c.send(channel, "Testing!")

    if(command == "memory"){
        c.send(channel, `I am currently using approximately ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB of memory`);
    }
})
c.connect();*/

module.exports = {client, helpers}