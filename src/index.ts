require('dotenv').config();
const client = require('./lib/client');
const helpers = require('./lib/Helpers');

/*let c = new client.client(process.env.TWITCH_USER,process.env.TWITCH_PASS,process.env.TWITCH_CHANNELS,process.env.COMMAND_PREFIX);
c.eventEmitter.on('commandTriggered', (parameters:string, channel:string, nick:string) => {
    console.log(`${parameters} ${channel} ${nick}`);

    if(parameters.startsWith("test"))
        c.send(channel, "Testing!")
})
c.connect();*/

module.exports = {client, helpers}