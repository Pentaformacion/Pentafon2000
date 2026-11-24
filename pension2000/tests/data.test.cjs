// Run with npm run test after npm install. Transpiles only the pure data layer.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'p2000-'));
try{for(const name of ['schema','demo']){const src=fs.readFileSync(path.join(__dirname,'../src/data',name+'.ts'),'utf8');fs.writeFileSync(path.join(dir,name+'.js'),ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);}
const s=require(path.join(dir,'schema.js')),db=require(path.join(dir,'demo.js')).demoDB();
assert.equal(db.Clientes.length,10);assert.equal(new Set(db.Clientes.map(r=>r.NSS)).size,10);for(const k of s.sheets)for(const r of db[k]){assert.deepEqual(Object.keys(r),s.columns(k));assert(db.Clientes.some(c=>c.NSS===r.NSS));}
assert(s.validMail(db.Referencias[1]));assert(!s.validMail(db.Referencias[5]));assert(!s.validMail(db.Referencias[7]));assert(s.officialCase({Macro:'TRAMITE',Tipo:'EDC SIN FOLIO',Subtipo:'ENVIO EDC SIN FOLIO',Estatus:'ABIERTO'}));assert.equal(s.dateISO('12/05/1966'),'1966-05-12');assert(db.Marcas.some(r=>!r['Fin de marca']));assert(db.Domiciliaciones.some(r=>r['Estado del Cobro']==='EN PROCESO'));console.log('OK: datos, referencias, escenarios y reglas puras.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
