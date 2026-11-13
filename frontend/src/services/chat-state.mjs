/** @typedef {import('../types/bridge.d.ts').ChatEvent} ChatEvent */
/** @typedef {{role:'user'|'assistant',content:string,status?:'pending'|'complete'|'streaming'|'interrupted'|'failed'}} Message */
/** @typedef {{messages:Message[],state:string,error:string,busy:boolean,sequence:number|null,originCount:number,queued:ChatEvent[],epoch:number}} ChatState */

/** @param {Array<{role:string,content:string}>} [history] @returns {ChatState} */
export function createChatState(history = []) {
  return { messages: history.filter(message => ['user', 'assistant'].includes(message.role))
    .map(message => ({ role: /** @type {'user'|'assistant'} */ (message.role),
      content: message.content, status: 'complete' })),
    state: 'IDLE', error: '', busy: false, sequence: null, originCount: 0, queued: [], epoch: 0 };
}

/** @param {ChatState} chat @param {string} text */
export function beginTurn(chat, text) {
  if (chat.busy || !text.trim() || text.length > 4000) throw new Error('Invalid or active turn');
  chat.epoch++;
  chat.originCount = chat.messages.length;
  chat.messages.push({ role: 'user', content: text, status: 'pending' },
    { role: 'assistant', content: '', status: 'streaming' });
  chat.busy = true; chat.state = 'THINKING'; chat.error = ''; chat.sequence = null; chat.queued = [];
  return chat.epoch;
}

/** @param {ChatState} chat @param {number} sequence @param {number} [epoch] */
export function bindSequence(chat, sequence, epoch = chat.epoch) {
  if (epoch !== chat.epoch || !chat.busy) return false;
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Invalid turn sequence');
  chat.sequence = sequence;
  const pending = chat.queued; chat.queued = [];
  for (const event of pending) consumeEvent(chat, event);
  return true;
}

/** @param {ChatState} chat @param {string} message @param {number} [epoch] */
export function rejectStart(chat, message, epoch = chat.epoch) {
  if (epoch !== chat.epoch) return;
  chat.messages.splice(chat.originCount);
  chat.busy = false; chat.state = 'ERROR'; chat.error = message; chat.sequence = null; chat.queued = [];
}

/** @param {ChatState} chat */
export function interruptTurn(chat) {
  chat.epoch++;
  if (chat.busy) {
    const reply = chat.messages[chat.originCount + 1];
    if (reply) reply.status = 'interrupted';
  }
  chat.busy = false; chat.state = 'INTERRUPTED'; chat.sequence = null; chat.queued = [];
}

/** @param {ChatState} chat @param {ChatEvent} event */
export function consumeEvent(chat, event) {
  if (chat.sequence === null) {
    // IPC notifications can arrive before the chat-start response. Buffer until its
    // sequence is known, then replay only matching events. Old notifications are dropped.
    if (chat.busy && chat.queued.length < 4096) chat.queued.push(event);
    return;
  }
  if (event.sequence !== chat.sequence) return;
  const user = chat.messages[chat.originCount];
  const reply = chat.messages[chat.originCount + 1];
  if (!reply) return;
  if (event.type === 'delta' && chat.busy && typeof event.text === 'string') {
    if (reply.content.length + event.text.length > 16000) {
      reply.status = 'failed'; chat.busy = false; chat.state = 'ERROR'; chat.error = 'Reply exceeded the local text limit.';
      return;
    }
    user.status = 'complete'; reply.content += event.text;
  } else if (event.type === 'done') {
    reply.status = 'complete'; chat.busy = false; chat.state = 'IDLE';
  } else if (event.type === 'error') {
    reply.status = 'failed'; chat.busy = false; chat.state = 'ERROR'; chat.error = event.message || 'Local conversation failed.';
    if (user.status === 'pending') user.status = 'failed';
  } else if (event.type === 'state' && event.state === 'THINKING' && chat.busy) {
    user.status = 'complete'; chat.state = 'THINKING';
  } else if (event.type === 'state' && event.state === 'INTERRUPTED') {
    interruptTurn(chat);
  }
}

/** @param {ChatState} chat */
export function resetChat(chat) {
  const epoch = chat.epoch + 1;
  Object.assign(chat, createChatState());
  chat.epoch = epoch;
}
