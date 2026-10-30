import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status=200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL')!, serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const body = await req.json();
    const customer = body.customer ?? {}, items = body.items;
    const clean = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0,max) : '';
    const name=clean(customer.name,100), phone=clean(customer.phone,20), address=clean(customer.address,500), district=clean(customer.district,80), note=clean(body.note,500);
    if (!name || !phone || !address || !district) return json({error:'Please complete all required customer fields.'},400);
    if (!Array.isArray(items) || items.length<1 || items.length>30) return json({error:'Invalid order items.'},400);
    const payment=body.payment_method;
    if (!['cod','bkash'].includes(payment)) return json({error:'Unsupported payment method.'},400);
    const trx=clean(body.bkash_trx_id,50);
    if(payment==='bkash' && !trx) return json({error:'bKash transaction ID is required.'},400);
    const ids=[...new Set(items.map((x: any)=>String(x.product_id)))];
    if(ids.length!==items.length || ids.some(id=>!/^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(id))) return json({error:'Invalid product selection.'},400);
    const {data:products,error:pErr}=await admin.from('products').select('id,name,price,stock,is_active').in('id',ids);
    if(pErr) throw pErr;
    if(!products || products.length!==ids.length) return json({error:'One or more products are unavailable.'},400);
    let subtotal=0;const lines=[];
    for(const item of items){const p=products.find(x=>x.id===item.product_id),qty=Number(item.quantity);if(!p||!p.is_active||!Number.isInteger(qty)||qty<1||qty>50)return json({error:'Invalid product or quantity.'},400);if(qty>p.stock)return json({error:`Insufficient stock for ${p.name}.`},409);const unit=Number(p.price);subtotal+=unit*qty;lines.push({product_id:p.id,product_name:p.name,unit_price:unit,quantity:qty,line_total:unit*qty});}
    const delivery=80,total=subtotal+delivery,orderNo=`NYS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,4).toUpperCase()}`;
    const {data:order,error:oErr}=await admin.from('orders').insert({order_number:orderNo,customer_name:name,customer_phone:phone,customer_address:address,customer_district:district,note,subtotal,delivery_charge:delivery,total,payment_method:payment,payment_status:payment==='bkash'?'pending_verification':'unpaid',bkash_trx_id:payment==='bkash'?trx:null}).select('id,order_number').single();
    if(oErr) throw oErr;
    const rows=lines.map(x=>({...x,order_id:order.id}));const {error:iErr}=await admin.from('order_items').insert(rows);
    if(iErr){await admin.from('orders').delete().eq('id',order.id);throw iErr;}
    // Stock is checked here; for high-volume stores, replace with a transactional SQL RPC to prevent simultaneous overselling.
    for(const line of lines){const p=products.find(x=>x.id===line.product_id)!;const {error:sErr}=await admin.from('products').update({stock:p.stock-line.quantity}).eq('id',p.id).gte('stock',line.quantity);if(sErr) console.error('Stock update needs review',sErr.message);}
    return json({order_number:order.order_number,total});
  } catch (e) { console.error(e); return json({error:'Unable to place order right now. Please try again.'},500); }
});
