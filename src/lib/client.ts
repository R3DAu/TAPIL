require('dotenv').config();
const ws = require('websocket').client;
const parseMsg = require('./messageParser');
import EventEmitter from "events";

export class client{
    public readonly socketURL: string = process.env.TWITCH_SOCKET_URL || "wss://irc-ws.chat.twitch.tv:443";
    private readonly user: string;
    private readonly pass: string;
    private wsc: typeof ws.client;
    public channels: string[];
    public connection: typeof ws.client;
    public commandPrefix: string = "!";
    public debug: boolean = (process.env.DEBUG==="true")
    public eventEmitter = new EventEmitter();

    constructor(username: string, password: string, channels?: string, commandprefix?: string){
        this.user = username;
        this.pass = password;
        this.commandPrefix = commandprefix || this.commandPrefix;

        if(channels)
            this.channels = channels.split(/[\s,]+/)
        else
            this.channels = []

        this.wsc = new ws();

        this.wsc.on('connectFailed', function(error:any){
            console.log('Connect Error: ' + error.toString());
        })

        this.wsc.on('connect', (connection: typeof ws.client) => {
            console.log("Connected to Twitch WS IRC");
            this.connection = connection;

            this.connection.on('error', function(error:any) {
                console.log("Connection Error: " + error.toString());
            })

            this.connection.on('close', function() {
                console.log('Connection Closed.')
            })

            this.connection.on('message', (message:any) => {
                if(message.type === 'utf8'){
                    let parsedMessage = parseMsg.parseMessage(message.utf8Data);
                    if(parsedMessage) {

                        if(this.debug)
                            console.log(parsedMessage);

                        let command    = parsedMessage.command;
                        let tags       = parsedMessage.tags;
                        let source     = parsedMessage.source;
                        let parameters = parsedMessage.parameters;

                        let channel : string|null = null;
                        let replyId: string|null = null;
                        let nick: string|null = null;

                        if(command !== null){
                            channel = command.channel;
                            command = command.command;
                        }else
                            return;

                        if(source !== null)
                            nick = source.nick;

                        if(tags !== null)
                            if(tags.hasOwnProperty('reply-parent-msg-id'))
                                replyId = tags['reply-parent-msg-id'];

                        //trim up parameters...
                        if(parameters)
                            parameters = parameters.slice(0,-2).trim();

                        if (command == "PING")
                            this.connection.sendUTF('PONG :tmi.twitch.tv');

                        if(nick == this.user && command == "JOIN")
                            if(process.env.ENABLE_BOT_JOIN_MESSAGE && process.env.ENABLE_BOT_JOIN_MESSAGE === "true")
                                this.connection.sendUTF(`PRIVMSG ${parsedMessage.command.channel} :${process.env.BOT_JOIN_MESSAGE}`);

                        if(replyId)
                            this.connection.sendUTF(`@reply-parent-msg-id=${replyId} PRIVMSG ${parsedMessage.command.channel} :@${nick} ${process.env.BOT_REPLY_MESSAGE}`);

                        if(command == 'PRIVMSG'){
                            if(parameters)
                                if(parameters.toLowerCase().includes(`@${this.user.toLowerCase()}`)){
                                    /* TO-DO: Convert these messages to .env config */
                                    let messages:string[] = [
                                        "Times are super tough, Have a kitkat. #NotSponsored.",
                                        "Have you eaten your Weetbix today? #NotSponsored.",
                                        "You're not you when you're hungry. Eat a Snickers. #NotSponsored.",
                                        "I just want milk to taste like real milk - Pauls smarter white milk, now with only 2% fat. #NotSponsored.",
                                        "Not Happy, Jan!",
                                        "I feel like Chicken Tonight! Like Chicken Tonight, Like Chicken Tonight!. #NotSponsored.",
                                        "Don’t Chop The Dinosaur, Daddy!",
                                        "You look so hawt today Rhonda. Like a Sunrise. Ketut - Save 15% on your insurance with AAMI. #NotSponsored."
                                    ]
                                    let randomNumber:number = Math.floor(Math.random() * messages.length);

                                    this.connection.sendUTF(`PRIVMSG ${parsedMessage.command.channel} :@${nick} ${messages[randomNumber]}`);
                                }
                                if(parameters.startsWith(this.commandPrefix)){
                                        //clean-up parameters, remove the prefix.
                                        parameters = parameters.slice(1, parameters.length + 1);
                                        let cmd = parameters.split(" ")[0];
                                        this.eventEmitter.emit('commandTriggered', cmd, parameters, channel, nick)
                                }
                        }

                    }
                }
            })

            this.authenticate();
        })
    }

    public authenticate(){
        this.connection.sendUTF('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands');
        this.connection.sendUTF('PASS ' + this.pass);
        this.connection.sendUTF('NICK '+ this.user);

        if(this.channels){
            let channelJoinString : string = "";
            this.channels.forEach((channel:string) => {
                channelJoinString += `#${channel},`;
            });

            //remove the last comma.
            channelJoinString.slice(0,-1);

            this.connection.sendUTF(`JOIN ${channelJoinString}`);
        }
    }

    public connect() {
        this.wsc.connect( this.socketURL );
    }

    public send(channel:string, message:string){
        this.connection.sendUTF(`PRIVMSG ${channel} :${message}`);
    }
}