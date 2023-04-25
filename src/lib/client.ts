const ws = require('websocket').client;
const parseMsg = require('./messageParser');


export class client{
    public socketURL: string = "wss://irc-ws.chat.twitch.tv:443";
    private user: string;
    private pass: string;
    private wsc: typeof ws.client;
    public channels: string[];
    public connection: typeof ws.client;
    public commandPrefix: string = "!";

    constructor(username: string, password: string, channels?: string[], commandprefix?: string){
        this.user = username;
        this.pass = password;
        this.channels = channels || [];
        this.commandPrefix = commandprefix || this.commandPrefix;

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
                        console.log(parsedMessage);

                        let command    = parsedMessage.command;
                        let tags       = parsedMessage.tags;
                        let source     = parsedMessage.source;
                        let parameters = parsedMessage.parameters;

                        let channel : string|null = null;
                        let replyId: string|null = null;
                        let nick: string|null = null;

                        if(command !== null){
                            command = command.command;
                            channel = command.channel;
                        }else
                            return;

                        if(source !== null)
                            nick = source.nick;

                        if(tags !== null)
                            if(tags.hasOwnProperty('reply-parent-msg-id'))
                                replyId = tags['reply-parent-msg-id'];

                        if (command == "PING")
                            this.connection.sendUTF('PONG :tmi.twitch.tv');

                        /*if(nick == this.user && command == "JOIN")
                            this.connection.sendUTF(`PRIVMSG ${parsedMessage.command.channel} :If you're lonely reply to me.`);*/

                        if(replyId)
                            this.connection.sendUTF(`@reply-parent-msg-id=${replyId} PRIVMSG ${parsedMessage.command.channel} :@${nick} You're loved! Tassielove`);

                        if(command == 'PRIVMSG'){
                            if(parameters)
                                if(parameters.toLowerCase().includes(`@${this.user.toLowerCase()}`)){
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

}