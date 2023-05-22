require('dotenv').config();
const client = require('./lib/client');
const helpers = require('./lib/Helpers');
const twitchClient = require('./lib/TwitchAPI');

/*let c = new client.client(process.env.TWITCH_USER,process.env.TWITCH_PASS,process.env.TWITCH_CHANNELS,process.env.COMMAND_PREFIX);
c.eventEmitter.on('commandTriggered', (command:string, parameters:string, channel:string, nick:string) => {
    console.log(`${parameters} ${channel} ${nick}`);

    if(command == "test")
        c.send(channel, "Testing!")

    if(command == "memory"){
        c.send(channel, `I am currently using approximately ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB of memory`);
    }
})
c.connect();

async function Main(){
    let tc = new twitchClient.client();
    let data = await tc.__get('users?login=twitchdev');

    //console.log(data.data);
}

Main().catch();
*/

module.exports = {client, helpers, twitchClient}