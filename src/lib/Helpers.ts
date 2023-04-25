const axios = require('axios').default;

async function getData() : Promise<void>{
    try{
        const {data, status} = await axios.get('https://httpbin.org/get');
        console.log(JSON.stringify(data, null, 4));
        console.log('response status is: ', status);
    }
    catch(e: any) {
        console.log(e.message);
    }
}

exports.getData = getData

/*

async function Main(){
    await helpers.getData();
}

Main()
.catch();*/