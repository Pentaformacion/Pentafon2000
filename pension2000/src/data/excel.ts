import * as XLSX from 'xlsx';
import {columns,emptyDB,sheets,dateISO,type DB,type Row,type Sheet} from './schema';
import {demoDB} from './demo';
const required:Record<Sheet,string[]>={Clientes:['NSS','CURP','RFC','Apellido Paterno','Apellido Materno','Primer Nombre','Fecha Nacimiento','Entidad Nacimiento','Teléfono','Email'],Referencias:['NSS','Numero / Email','Tipo','Ubicación'],Beneficiarios:['NSS','Primer Nombre','%'],Marcas:['NSS','Cuenta','Ini de marca','Fin de marca','Tipo'],Tramites:['NSS','Fecha','Descripción','Estatus Actual'],Movimientos:['NSS','Fecha','Concepto','Importe','Saldo','Periodo'],Domiciliaciones:['NSS','No. Trámite','Estatus','Estado del Cobro','Monto de Aportación'],Cobros:['NSS','No. Trámite','Fecha Envío','Monto','Estatus'],Cancelaciones:['NSS','No. Trámite','Fecha Cancelación','Motivo'],Traspasos:['NSS','Movimiento','AFORE','Fecha'],Chequera:['NSS','Fecha Datamart','Folio Procesar'],Casos:['NSS','No. Caso','Macro','Tipo','Subtipo','Estatus'],Comunicaciones:['NSS','Fecha','Canal','Destino','Concepto']};
const clean=(v:unknown)=>String(v??'').trim();
function readSheet(w:XLSX.WorkSheet,s:Sheet){
 const grid=XLSX.utils.sheet_to_json<unknown[]>(w,{header:1,raw:false,defval:'',blankrows:false});
 const headers=(grid.shift()||[]).map(clean);const missing=required[s].filter(k=>!headers.includes(k));
 if(missing.length)throw Error(`${s}: faltan columnas: ${missing.join(', ')}.`);
 if(headers.filter(Boolean).length!==new Set(headers.filter(Boolean)).size)throw Error(`${s}: encabezados duplicados.`);
 return grid.filter(r=>r.some(v=>clean(v))).map((r,i)=>{
 const row:Row=Object.fromEntries(columns(s).map(k=>[k,clean(r[headers.indexOf(k)])]));
 if(!/^\d{11}$/.test(row.NSS))throw Error(`${s}, fila ${i+2}: NSS debe tener 11 dígitos (formato Texto).`);
 for(const [k,v] of Object.entries(row)){
 if(v&&(/^(Fecha|Última Validación|Ini de marca|Fin de marca)/.test(k))){const d=dateISO(v);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)throw Error(`${s}, fila ${i+2}: fecha inválida en ${k}; utilice AAAA-MM-DD o DD/MM/AAAA.`);row[k]=d;}
 if(v&&['Monto','Importe','Saldo','Monto de Aportación','%','Porcentaje','Monto inicial','Días transcurridos'].includes(k)&&!Number.isFinite(Number(v)))throw Error(`${s}, fila ${i+2}: ${k} debe ser numérico sin separadores.`);
 }
 if(s==='Clientes'&&(!row.CURP||!row['Primer Nombre']||!row['Fecha Nacimiento']||!row['Entidad Nacimiento']||!/^\d{10}$/.test(row.Teléfono)))throw Error(`Clientes, fila ${i+2}: faltan datos de autenticación o teléfono de 10 dígitos.`);
 return row;});
}
export async function importDB(file:File):Promise<{db:DB;warnings:string[]}>{
 if(!/\.(xlsx|csv)$/i.test(file.name))throw Error('Seleccione un archivo .xlsx o .csv.');
 if(file.size>20*1024*1024)throw Error('El archivo supera 20 MB.');
 const csv=/\.csv$/i.test(file.name), w=csv?XLSX.read(await file.text(),{type:'string',raw:true}):XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false,dateNF:'yyyy-mm-dd'});
 const db=emptyDB(),warnings:string[]=[];
 for(const s of sheets){const ws=w.Sheets[csv&&s==='Clientes'?w.SheetNames[0]:s];if(ws&&(!csv||s==='Clientes'))db[s]=readSheet(ws,s);else if(s==='Clientes')throw Error('Falta la hoja Clientes.');else warnings.push(s);}
 if(!db.Clientes.length)throw Error('La base no contiene clientes.');
 const ids=new Set<string>();for(const r of db.Clientes){if(ids.has(r.NSS))throw Error(`NSS duplicado: ${r.NSS}`);ids.add(r.NSS);}
 for(const s of sheets.filter(s=>s!=='Clientes'))for(const r of db[s])if(!ids.has(r.NSS))throw Error(`${s}: NSS ${r.NSS} no existe en Clientes.`);
 for(const r of db.Cobros)if(!db.Domiciliaciones.some(d=>d.NSS===r.NSS&&d['No. Trámite']===r['No. Trámite']))throw Error(`Cobros: trámite ${r['No. Trámite']} no existe en Domiciliaciones.`);
 if(warnings.includes('Referencias'))for(const r of db.Clientes){if(r.Teléfono)db.Referencias.push({NSS:r.NSS,'Numero / Email':r.Teléfono,Tipo:'Celular',Ubicación:'Casa',Preferente:'S'});if(r.Email)db.Referencias.push({NSS:r.NSS,'Numero / Email':r.Email,Tipo:'E-Mail',Ubicación:'Otro',Preferente:'S'});}
 return {db,warnings};
}
export function exportDB(db:DB=demoDB(),name='Plantilla_Pension2000.xlsx'){
 const w=XLSX.utils.book_new();for(const s of sheets){const cols=columns(s);const ws=XLSX.utils.aoa_to_sheet([cols,...db[s].map(r=>cols.map(k=>r[k]||''))]);ws['!cols']=cols.map(k=>({wch:Math.min(42,Math.max(15,k.length+3))}));XLSX.utils.book_append_sheet(w,ws,s);}XLSX.writeFile(w,name);
}
export function exportRows(rows:Row[],name:string){const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,XLSX.utils.json_to_sheet(rows),'Reporte');XLSX.writeFile(w,`${name}.xlsx`);}
