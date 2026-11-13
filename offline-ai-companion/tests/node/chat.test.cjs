const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { validateChat, streamChat } = require('../../electron/chat.cjs');
test('chat validation refuses cloud models, invalid languages and oversized text', () => {
  assert.equal(validateChat({text:'Kamusta?',model:'qwen3.5:0.8b',language:'taglish'}).text,'Kamusta?');
  for (const input of [null, {}, {text:'hello',model:'gpt:cloud',language:'auto'},
    {text:'hello',model:'qwen3.5:4b',language:'shell'}, {text:'a'.repeat(4001),model:'qwen3.5:4b',language:'auto'}])
    assert.throws(() => validateChat(input));
});
test('local NDJSON streaming uses auth and handles split packets', async () => {
  const server = http.createServer((request,response) => {
    assert.equal(request.url,'/chat'); assert.equal(request.headers.authorization,`Bearer ${'a'.repeat(64)}`);
    assert.equal(request.method,'POST');
    response.writeHead(200,{'Content-Type':'application/x-ndjson'});
    response.write('{"type":"del');
    response.end('ta","text":"Kumusta"}\n{"type":"done"}\n');
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  try {
    const events=[];
    await streamChat(server.address().port,'a'.repeat(64),{},new AbortController().signal,event=>events.push(event));
    assert.equal(events[0].text,'Kumusta');assert.equal(events[1].type,'done');
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
test('stream cancellation closes the local request', async () => {
  let closed;
  const disconnected = new Promise(resolve => { closed=resolve; });
  const server = http.createServer((_request,response) => {
    response.writeHead(200,{'Content-Type':'application/x-ndjson'});
    response.write('{"type":"delta","text":"first"}\n');
    response.on('close',closed);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const controller=new AbortController();
    await assert.rejects(streamChat(server.address().port,'a'.repeat(64),{},controller.signal,
      () => controller.abort()));
    await disconnected;
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
