const axios = require('axios');
const API = 'http://localhost:4000';
let seen = new Map();

async function getOrders(){
  try {
    const res = await axios.get(`${API}/orders`);
    return res.data;
  } catch(e){
    console.error('GET ORDERS ERR', e.message || e);
    return null;
  }
}

(async ()=>{
  console.log('Polling /orders for PAID changes (120s timeout)...');
  const initial = await getOrders() || [];
  initial.forEach(o => seen.set(o.order_id, o.payment_status));
  console.log('Initial orders loaded:', initial.length);

  const interval = setInterval(async ()=>{
    const cur = await getOrders();
    if(!cur) return;
    for(const o of cur){
      if(!seen.has(o.order_id) && o.payment_status === 'PAID'){
        console.log('Detected NEW PAID order:', o);
        process.exit(0);
      }
      const prevStatus = seen.get(o.order_id);
      if(prevStatus !== 'PAID' && o.payment_status === 'PAID'){
        console.log('Order marked PAID:', o);
        process.exit(0);
      }
      seen.set(o.order_id, o.payment_status);
    }
  }, 3000);

  setTimeout(()=>{
    console.log('Timeout waiting for PAID order.');
    process.exit(2);
  }, 120000);
})();
