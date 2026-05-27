'use strict';
const fetch = require('node-fetch');
const CONC = Number(process.env.CONC || 200);
const DUR = Number(process.env.DUR || 20); 
const URL = process.env.TARGET_URL || 'http://127.0.0.1:3001/api/analytics/naive/top-users';

async function worker(id) {
  const end = Date.now() + DUR * 1000;
  let count = 0;
  while (Date.now() < end) {
    try {
      await fetch(URL, { timeout: 5000 });
      count++;
    } catch (e) {
    }
  }
  console.log('worker', id, 'done', count);
}

async function main() {
  const tasks = [];
  for (let i = 0; i < CONC; i++) tasks.push(worker(i));
  await Promise.all(tasks);
  console.log('attack finished');
}

main().catch(console.error);
