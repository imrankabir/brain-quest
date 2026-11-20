const DB_NAME='brainquest-db';
export const DB_VERSION=2;
export const STORE_NAMES=Object.freeze(['players','progress','results','skills','achievements','dailyActivity']);
export function upgradeSchema(db){const paths={players:'id',progress:'id',results:'id',skills:'id',achievements:'id',dailyActivity:'id'};for(const [name,keyPath] of Object.entries(paths))if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath});}
export class Database{
 constructor(){this.db=null;this.fallback=false;}
 async open(){if(typeof indexedDB==='undefined'){this.fallback=true;return;}try{this.db=await new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>upgradeSchema(req.result);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Database upgrade is blocked by another open tab.'));});this.db.onversionchange=()=>this.db?.close();}catch(error){console.warn('IndexedDB unavailable; using local fallback',error);this.fallback=true;}}
 async all(store){if(this.fallback)return JSON.parse(localStorage.getItem(`bq-${store}`)||'[]');return this.request(store,'readonly',s=>s.getAll());}
 async put(store,value){if(this.fallback){const rows=await this.all(store),i=rows.findIndex(x=>x.id===value.id);if(i<0)rows.push(value);else rows[i]=value;localStorage.setItem(`bq-${store}`,JSON.stringify(rows));return value;}return this.request(store,'readwrite',s=>s.put(value));}
 async get(store,id){if(this.fallback)return(await this.all(store)).find(x=>x.id===id)||null;return this.request(store,'readonly',s=>s.get(id));}
 async delete(store,id){if(this.fallback){localStorage.setItem(`bq-${store}`,JSON.stringify((await this.all(store)).filter(x=>x.id!==id)));return;}return this.request(store,'readwrite',s=>s.delete(id));}
 request(store,mode,operation){return new Promise((resolve,reject)=>{const tx=this.db.transaction(store,mode),req=operation(tx.objectStore(store));let result;req.onsuccess=()=>{result=req.result;};req.onerror=()=>reject(req.error);tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||req.error||new Error('IndexedDB transaction failed'));tx.onabort=()=>reject(tx.error||new Error('IndexedDB transaction aborted'));});}
}
