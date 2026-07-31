const http = require('http');

const data = JSON.stringify({
  widget_type: 'ticket-queue',
  name: 'Test Ticket Queue',
  config: { counterName: 'Balcão X' }
});

const req = http.request('http://localhost:3001/api/widgets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer test' // Wait, I need a real token or I can temporarily mock auth? 
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});
req.write(data);
req.end();
