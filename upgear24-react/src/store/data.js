export const seedProducts = [
  {id:1, sku:'1234', name:'Fog lamp', brand:'UpGear', category:'Lighting', price:10000, cost:6000, stock:5, lowStock:5, image:null},
  {id:2, sku:'LED-210', name:'LED Headlight', brand:'Lumax', category:'Lighting', price:6500, cost:4200, stock:12, lowStock:3, image:null},
  {id:3, sku:'SC-500', name:'Seat Cover Premium', brand:'AutoFit', category:'Interior', price:7800, cost:4800, stock:7, lowStock:3, image:null},
  {id:4, sku:'ST-900', name:'Android Car Stereo', brand:'Sony', category:'Performance', price:15900, cost:10900, stock:3, lowStock:2, image:null},
  {id:5, sku:'RC-100', name:'Reverse Camera', brand:'70mai', category:'Other', price:4200, cost:2400, stock:9, lowStock:3, image:null}
]

export const seedJobs = [
 {id:1003, time:'07:09 am', vehicle:'Swift vdi', customer:'B', phone:'9158303398', plate:'MH12RK1234', amount:10000, soldBy:'New Shop Testing', products:1, status:'Active', technician:null},
]

export const seedQuotes = [
 {id:'QT-6976', date:'25 Aug 2026', time:'07:08 am', customer:'B', phone:'9158303398', vehicle:'Swift vdi', plate:'MH12RK1234', amount:10000, createdBy:'New Shop Testing', status:'Transferred', items:[{id:1,name:'Fog lamp',sku:'1234',qty:1,price:10000}]}
]

export const seedStaff = [];
export const seedBills = [];
export const seedCustomers = [
 {id:1,name:'B',phone:'9158303398',email:'',address:'',vehicles:[{brand:'Maruti',model:'Swift vdi',year:'2022',plate:'MH12RK1234'}],total:10000,outstanding:0}
]

export function initStore(){
 localStorage.setItem('upgear_shop', JSON.stringify(JSON.parse(localStorage.getItem('upgear_shop') || JSON.stringify({name:'KIRTI CAR ACCESSORIES', slogan:'The One Stop Car Accessories Store!', address:'Shop No. 1, Main Road, City', supportPhone:'', dealerPhone:'', gstin:'', gst:0, invoiceNotes:'Goods once sold will not be taken back or exchanged. Delivery against full payment only. Taxes extra as applicable.'}))));
 for(const [key,val] of Object.entries({products:seedProducts,jobs:seedJobs,quotes:seedQuotes,staff:seedStaff,bills:seedBills,customers:seedCustomers})){
  if(!localStorage.getItem('upgear_'+key)) localStorage.setItem('upgear_'+key, JSON.stringify(val));
 }
}
export function getData(key){return JSON.parse(localStorage.getItem('upgear_'+key) || '[]')}
export function setData(key,value){localStorage.setItem('upgear_'+key, JSON.stringify(value))}
export function getShop(){return JSON.parse(localStorage.getItem('upgear_shop') || '{}')}
export function setShop(value){localStorage.setItem('upgear_shop', JSON.stringify(value))}

function pad(n){return String(n).padStart(2,'0')}
export function nowStamp(){
  const d=new Date()
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const h=d.getHours()
  const am=h>=12?'pm':'am'
  const hr=((h+11)%12)+1
  return {
    date:`${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`,
    time:`${pad(hr)}:${pad(d.getMinutes())} ${am}`
  }
}

export function nextId(key,prefix){
  const rows=getData(key)
  const nums=rows.map(r=>{
    const raw=String(r.id||r.number||'').replace(/\D/g,'')
    return Number(raw.slice(-4))||0
  })
  const n=Math.max(1000,...nums)+1
  return `${prefix}-${n}`
}

export function upsertCustomer({name,phone,vehicle,plate,amount}){
  const customers=getData('customers')
  const idx=customers.findIndex(c=>c.phone===phone)
  const vehicleRow={brand:'',model:vehicle||'',year:'',plate:plate||''}
  if(idx>=0){
    const prev=customers[idx]
    const vehicles=prev.vehicles||[]
    const has=vehicles.some(v=>v.plate===plate)
    customers[idx]={
      ...prev,
      name:name||prev.name,
      total:(prev.total||0)+Number(amount||0),
      vehicles:has?vehicles:[...vehicles,vehicleRow]
    }
  }else{
    customers.push({
      id:Date.now(),name,phone,email:'',address:'',
      vehicles:[vehicleRow],total:Number(amount||0),outstanding:0
    })
  }
  setData('customers',customers)
}
