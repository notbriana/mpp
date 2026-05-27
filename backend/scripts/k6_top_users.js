import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  const res = http.get('http://127.0.0.1:3001/api/analytics/naive/top-users');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.1);
}
