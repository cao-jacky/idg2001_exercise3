const csv = require('csv-parser');
const fs = require('fs');

const axios = require('axios');

const mqtt = require('mqtt')

const host = 'broker.hivemq.com'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `mqtt://${host}:${port}`

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'test',
  password: '123',
  reconnectPeriod: 1000,
})

function getData(file, type) {
    let data = [];
    const university_data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (data) => university_data.push(data))
            .on('end', () => {
                resolve(university_data);
            });
    });
}

async function post() {
    try {
        const data = await getData("university_data.csv", {});
        console.log(data[0]);
        axios.post('https://ptsv2.com/t/r1u8q-1643904022/post', data[0])
        // .then((response) => console.log(response));
    } catch (error) {
        console.error(error)
    }
    
}

// post();

// axios.get('https://ptsv2.com/t/r1u8q-1643904022/d/latest/json')
//   .then((response)=>console.log(response));

const topic = 'test'
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
  client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
})
client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
})