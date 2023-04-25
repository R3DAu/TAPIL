require('dotenv').config();
const client = require('./lib/client');
const helpers = require('./lib/Helpers');

/*

async function Main(){
    await helpers.getData();
}

Main()
.catch();*/

/*let channels: string[] = [];

if(process.env.TWITCH_CHANNELS)
    channels = process.env.TWITCH_CHANNELS.split(/[\s,]+/)

let c = new client.client(process.env.TWITCH_USER,process.env.TWITCH_PASS,channels,process.env.COMMAND_PREFIX);
c.connect();*/

module.exports = {client, helpers}