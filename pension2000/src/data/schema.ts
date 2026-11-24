export type Row = Record<string,string>;
export const schema = {
 Clientes:'NSS,CURP,RFC,Folio,Apellido Paterno,Apellido Materno,Primer Nombre,Segundo Nombre,REUS,Estado,Estatus,Fecha Estatus,Movimiento,Tipo de Cliente,Datos Fiscales,LFPDPPP,Pred,Pl.Acc,Serv en linea,Folio Traspaso,Tipo Trabajador,Fecha Nacimiento,Entidad Nacimiento,Teléfono,Email,Última Validación,Marca 57 Años o más,Correo Devuelto,Conciliado,CAT,Origen CAT,Afore Movil,FCT Rechazado,Marca Prevalidado,Derecho A,Derecho R,Derecho C Teléfono,Derecho C Correo,Derecho C Todos,Derecho O,Revocación,Finalidades S1,Finalidades S2,Cuenta,Calle,Num Ext,Num Int,Colonia,Ciudad,Estado Domicilio,Cod Postal,País,Promotor,Est Promotor,Sucursal,Fecha Certificación,Sexo,Edad,Siefore,Fecha Liquidación,Fecha Solicitud,Fecha Recepción,Fecha Captura,Año Cedente,Nombre Patrón,Registro Patronal,Dirección Patrón,Teléfono Patrón,Nacionalidad,Estado Civil,Origen,Estado Recertificación,Estado Enrolamiento,Homonimia,St Pago',
 Referencias:'NSS,Numero / Email,Extension,Tipo,Ubicación,Preferente',
 Beneficiarios:'NSS,Primer Nombre,Segundo Nombre,Primer Apellido,Segundo Apellido,CURP,Parentesco,%,Origen',
 Marcas:'NSS,Cuenta,Ini de marca,Fin de marca,Tipo,Descripción',
 Tramites:'NSS,Fecha,Descripción,Estatus Actual,Asesor,Doc',
 Movimientos:'NSS,Fecha,Concepto,Importe,Saldo,Periodo',
 Domiciliaciones:'NSS,No. Trámite,Referencia,Deducibilidad,Estatus,Estado del Cobro,Frecuencia de Aportación,Banco del Cliente,Forma de pago,Cuenta de Cheques,Clabe Interbancaria,Monto de Aportación,Fecha Activación,Fecha primera domiciliación,Incremento,Porcentaje,Periodicidad,Monto inicial,Fecha incremento,F-SAR,No. Oportunidad Siebel,No. Trámite Salesforce,Motivo de Cancelación',
 Cobros:'NSS,No. Trámite,Fecha Envío,Fecha Aporte,Monto,Estatus,Motivo,Lote',
 Cancelaciones:'NSS,No. Trámite,CURP,Fecha Captura,Fecha Cancelación,Motivo,Monto',
 Traspasos:'NSS,NOMBRE,Movimiento,CONCEPTO,AFORE,Fecha',
 Chequera:'NSS,Nombre,Fecha Datamart,Folio Procesar,Fecha desinversión recursos,Días transcurridos',
 Casos:'NSS,No. Caso,Fecha,Campaña,Contacto,Estatus,Sucursal,Macro,Tipo,Subtipo,Filas de trabajo,Recomendaciones,Notas,Asesor',
 Comunicaciones:'NSS,Fecha,Canal,Destino,Concepto,Estatus'
} as const;
export type Sheet = keyof typeof schema;
export type DB = Record<Sheet,Row[]>;
export const sheets = Object.keys(schema) as Sheet[];
export const columns=(s:Sheet)=>schema[s].split(',');
export const emptyDB=():DB=>Object.fromEntries(sheets.map(s=>[s,[]])) as unknown as DB;
export const yes=(s?:string)=>['S','SI','SÍ','1','TRUE','X','H'].includes((s||'').trim().toUpperCase());
export const norm=(s:string)=>s.trim().toUpperCase();
export const fullName=(r?:Row)=>r?[r['Apellido Paterno'],r['Apellido Materno'],r['Primer Nombre'],r['Segundo Nombre']].filter(Boolean).join(' '):'';
export const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
export function dateISO(s:string){const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);return m?`${m[3]}-${m[2]}-${m[1]}`:s;}
export function dateDisplay(s:string){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?`${m[3]}/${m[2]}/${m[1]}`:s;}
export const money=(v:string|number)=>Number(v||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
export const forClient=(db:DB,s:Sheet,nss:string)=>nss?db[s].filter(r=>r.NSS===nss):[];
export const validMail=(r:Row)=>['E-MAIL','EMAIL','CORREO'].includes(norm(r.Tipo||''))&&norm(r['Ubicación']||'')==='OTRO'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r['Numero / Email']||'');
export const officialCase=(r:Row)=>norm(r.Macro||'')==='TRAMITE'&&norm(r.Tipo||'')==='EDC SIN FOLIO'&&norm(r.Subtipo||'')==='ENVIO EDC SIN FOLIO'&&r.Estatus!=='CANCELADO';
