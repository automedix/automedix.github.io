const relays = ['wss://relay.damus.io', 'wss://nos.lol'];
const pubkey = '701ed64be4ced643806e57d187ed2b88f3a3a41c6d70102660d5c074e5087e59';

function checkRelay(url) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.close();
      resolve([]);
    }, 15000);

    ws.addEventListener('open', () => {
      console.log('Connected to', url);
      ws.send(JSON.stringify(["REQ", "sub1", { "authors": [pubkey], "limit": 10 }]));
    });

    const events = [];
    ws.addEventListener('message', (event) => {
      console.log('Message from', url, event.data.substring(0, 100));
      const msg = JSON.parse(event.data);
      if (msg[0] === 'EVENT') events.push(msg[2]);
      if (msg[0] === 'EOSE') {
        clearTimeout(timeout);
        ws.close();
        resolve(events);
      }
    });

    ws.addEventListener('error', () => {
      clearTimeout(timeout);
      resolve([]);
    });
  });
}

async function run() {
  const results = await Promise.all(relays.map(checkRelay));
  const allEvents = results.flat().sort((a, b) => b.created_at - a.created_at);
  console.log(JSON.stringify(allEvents));
}

run();
