require('dotenv').config();
import EventEmitter from "events";
import axios from 'axios';

// Type Classes
type ReturnData = {
    data: unknown,
    status: number
}

type TokenData = {
    client_id: string,
    login: string,
    scopes: string[],
    user_id: string,
    expires_in: number
}

type TokenErrorData = {
    status: number,
    message: string
}

type PromiseData = {
    Success: boolean,
    Message: string
}

export class client{
    private readonly twitchAPIURL: string = process.env.TWITCH_API_URL || "https://api.twitch.tv/helix/"
    private readonly twitchIDAPIURL: string = process.env.TWITCH_API_ID_URL || "https://id.twitch.tv/oauth2/"
    private readonly twitchClientId: string|undefined;
    private readonly twitchClientSecret: string|undefined;
    private readonly twitchToken: string|undefined;
    private readonly twitchRefreshToken: string|undefined;

    constructor(twitchClientId?: string, twitchClientSecret?: string, twitchToken?: string, twitchRefreshToken?: string){
        this.twitchClientId = twitchClientId || process.env.TWITCH_CLIENT_ID;
        this.twitchClientSecret = twitchClientSecret || process.env.TWITCH_CLIENT_SECRET;
        this.twitchToken = twitchToken || process.env.TWITCH_API_ACCESS_TOKEN;
        this.twitchRefreshToken = twitchRefreshToken || process.env.TWITCH_API_REFRESH_TOKEN;

        /* Do some error checking first... */
        if(this.twitchClientId == undefined)
            throw new Error("TWITCH_CLIENT_ID must be defined.");
        if(this.twitchClientSecret == undefined)
            throw new Error("TWITCH_CLIENT_SECRET must be defined.");
        if(this.twitchToken == undefined)
            throw new Error("TWITCH_API_ACCESS_TOKEN must be defined.");
        if(this.twitchRefreshToken == undefined)
            throw new Error("TWITCH_API_REFRESH_TOKEN must be defined.");

        //If we made it this far, we need to make sure we check the token that was given to us.
        this.validateToken()
            .then((data: PromiseData) => {
                if(data.Success){
                    if(process.env.DEBUG == "true")
                        console.log(data.Message);
                }else{
                    throw new Error(data.Message);
                }
            }).catch((e) => {
                throw new Error(e.message);
            })
    }

    private async validateToken(): Promise<PromiseData>{
        return new Promise(async (resolve, reject): Promise<void> => {
            const data: ReturnData = await this.__get('validate', this.twitchIDAPIURL)
            if (data.status == 200) {
                //successful response.
                let tokenData: TokenData = <TokenData>data.data;

                //now let's work out the current time + expiry...
                let seconds: number = (Date.now()) + tokenData.expires_in;
                let date = new Date(seconds);

                if ((tokenData.expires_in < 300) && (process.env.DEBUG == "true"))
                    console.warn(`Token for ${tokenData.login} will expire within the next 5 minutes. You must renew the token soon!`);

                resolve({Message: `Token for ${tokenData.login} will expire on: ${date}`, Success: true})
            }else if(data.status == 401){
                let tokenData: TokenErrorData = <TokenErrorData>data.data;
                resolve({Message: `Token has expired: ${tokenData.message}`, Success: false})
            }else{
                reject({Message: `Twitch returned an ${data.status} error`, Success: false})
            }
        })
    }

    public async __get(endpoint: string, url: string = this.twitchAPIURL) : Promise<ReturnData>{
        return new Promise(async (resolve, reject): Promise<void> => {
            try{
                const {data, status} = await axios.get<any>(url + endpoint,{
                    headers: {
                        Authorization: "Bearer " + this.twitchToken,
                        "Client-Id": this.twitchClientId
                    }
                })

                resolve({data, status});
            }catch(e){
                reject(e);
            }
        })
    }

    private async __post(){

    }
}