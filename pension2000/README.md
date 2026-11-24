# PENSIÓN 2000 — Emulador de capacitación

Simulador web independiente, inspirado en el manual **PRESENTACIÓNP2000.pdf (35 diapositivas)**. Reproduce el flujo de práctica y el estilo de escritorio legacy: área gris, ventanas azules, campos compactos, tablas con selección cian, barra de herramientas y panel de navegación lateral. No es el aplicativo oficial ni se conecta a la institución.

**Solo datos ficticios.** El acceso es didáctico, no un mecanismo de seguridad real. No cargue bases de clientes reales, credenciales, identificadores, cuentas bancarias ni archivos con información confidencial. La aplicación no transmite las bases importadas a un servidor y no implementa un backend, controles de acceso de producción ni servicios externos. Los cambios permanecen en memoria de la pestaña; exporte la base para conservarlos antes de recargar o cerrar el navegador.

## Inicio rápido

Requisitos: Node.js 22 LTS o compatible, npm y navegador de escritorio moderno.

```bash
npm install
npm run dev
```

Abra la dirección local que imprime Vite (normalmente `http://localhost:5173`).

| Campo | Valor de práctica |
|---|---|
| Usuario | DEMO |
| Palabra paso | demo2000 |
| NSS del primer cliente | 00000000001 |
| Fecha de nacimiento | 12/05/1966 |
| Entidad nacimiento | NUEVO LEÓN |
| Número telefónico | 0000000001 |

Después de entrar, los datos de cliente estarán en blanco. Presione **F7**, escriba el NSS, presione **F8**, autentique y acepte las alertas. También puede usar los íconos de consulta si el navegador reserva esas teclas. Ctrl+Q limpia la consulta (algunos navegadores o sistemas pueden interceptarlo); existe un botón equivalente. `*` y `%` son comodines de práctica para recuperar varios registros y probar las flechas; cada cliente debe autenticarse por separado.

La base inicial contiene diez clientes inventados y registros relacionados. Descargue **Plantilla Excel** desde la barra para consultar todos los datos de práctica. También se incluye una copia física en `public/Plantilla_Pension2000.xlsx`.

## Publicación en GitHub Pages

1. Cree un repositorio de GitHub (recomendado privado si su plan admite Pages en repositorios privados; no suba el manual ni bases reales).
2. Descomprima el ZIP y suba **el contenido de la carpeta `pension2000`** a la raíz del repositorio, incluidos los archivos ocultos `.github` y `.gitignore`.
3. En GitHub, abra **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. En **Actions**, ejecute `Publicar emulador` o haga un commit en `main`. El flujo instala dependencias, compila y publica `dist/`.
5. Use la URL que GitHub Pages indique al completar la publicación. Los sitios de Pages pueden ser públicos incluso si su repositorio es privado; mantenga todo el contenido sintético.

Para revisar producción localmente:

```bash
npm test
npm run build
npm run preview
```

No abra `index.html` directamente con doble clic: el código fuente utiliza Vite y TypeScript.

## Estructura

```text
pension2000/
├── .github/workflows/deploy.yml
├── .gitignore
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── tsconfig.json
├── vite.config.ts
├── README.md
├── public/
│   └── Plantilla_Pension2000.xlsx
├── tests/
│   ├── data.test.cjs
│   └── excel.test.cjs
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── components/Legacy.tsx
    ├── data/
    │   ├── schema.ts
    │   ├── demo.ts
    │   └── excel.ts
    └── views/
        ├── Customer.tsx
        ├── Reports.tsx
        ├── Domiciliation.tsx
        └── Workflow.tsx
```

React + TypeScript administra el estado; Vite construye el sitio estático. Tailwind está configurado junto con CSS específico para reproducir los controles legacy. SheetJS importa/exporta libros y CSV, y Lucide provee iconos equivalentes (no los iconos originales propietarios).

## Contrato de datos

- El archivo XLSX debe incluir `Clientes`; el resto de hojas son opcionales. El importador avisa si faltan. Las vistas correspondientes quedan sin registros salvo `Referencias`, que se deriva de teléfono y correo cuando la hoja está ausente.
- Un CSV representa únicamente la hoja `Clientes`, no las tablas hijas. Use UTF-8, encabezados idénticos a la plantilla, y conserve ceros a la izquierda. Para alimentar todos los módulos use XLSX.
- La primera fila de cada hoja es el encabezado; los nombres exactos de columnas están en `src/data/schema.ts`. No cambie acentos ni nombres.
- NSS es la clave de 11 dígitos y debe almacenarse como texto; las hojas hijas deben referenciar un NSS existente. Los intentos de cobro deben enlazar a una domiciliación por NSS y No. Trámite.
- Teléfono: diez dígitos. Fechas: AAAA-MM-DD o DD/MM/AAAA. Importes y porcentajes: números sin separadores de miles ni símbolo monetario. Banderas: S/N (también se aceptan 1/0, TRUE/FALSE); Derecho O acepta H. Identificadores de ejemplo son intencionalmente ficticios, sin validación oficial de dígitos verificadores CURP/RFC/NSS.
- Una carga válida reemplaza la base; si hay error, la base anterior se conserva. Tamaño máximo 20 MB. El botón Exportar base conserva todos los registros y modificaciones en un XLSX.

| Hoja | Contenido |
|---|---|
| Clientes | Identidad ficticia, datos generales, afiliación, marcas, patrón y recertificación |
| Referencias | Teléfono, correo, tipo, ubicación, preferencia |
| Beneficiarios | Beneficiarios sustitutos, parentesco y porcentaje |
| Marcas | Marcas internas, inicio, fin y tipo |
| Tramites | Retiros y seguimiento de gestiones |
| Movimientos | Movimientos, saldo y periodo |
| Domiciliaciones | Solicitudes de aportación voluntaria |
| Cobros | Intentos, importes, estatus y motivo |
| Cancelaciones | Solicitudes canceladas |
| Traspasos | Historial de AFORE |
| Chequera | Reporte de saldos de chequera |
| Casos | Codificaciones y folios |
| Comunicaciones | Envíos simulados y estado |

## Escenarios de práctica

| NSS | Escenario |
|---|---|
| 00000000001 | Alertas fiscales y de última validación; marca interna abierta; aportación vigente; cliente de 57 años o más. |
| 00000000002 | CAT originado en servicios en línea; no permite desmarcar; cobro en proceso bloquea cancelación. |
| 00000000003 | Correo devuelto y referencia de correo sin Tipo: no se permite enviar. |
| 00000000004 | Derecho A y correo con ubicación Casa; corrija únicamente ubicación a Otro. |
| 00000000005 | Derecho C Correo: envío bloqueado como regla conservadora de simulación. |
| 00000000006 | Derecho O (H): alerta de privacidad y envío bloqueado. |

Para practicar **Estado de Cuenta Oficial**: seleccione Reportes → Reportes → Saldo Clientes → Estado de Cuenta Oficial. Codifique primero con el mismo usuario mediante Workflow: Macro TRAMITE, Tipo EDC SIN FOLIO, Subtipo ENVIO EDC SIN FOLIO, notas de práctica y guardar/cerrar. Regrese al reporte, seleccione un periodo de la base y genere el envío simulado. El check de envío automático está deshabilitado conforme a la lámina 19.

Para comprobar los errores de importación: elimine una columna obligatoria, repita un NSS o introduzca una fecha inválida en una copia de la plantilla. Vuelva a cargar la plantilla intacta después.

## Trazabilidad con el manual y límites

- Láminas 3–8: conexión, campos iniciales vacíos, consulta F7/F8, autenticación, advertencias y navegación.
- Láminas 9–16: datos generales, constancias, patrón, afiliación, beneficiarios y marcas internas. La alerta de marca activa corresponde a ausencia de fecha final; no se inventó un catálogo de compatibilidad de trámites.
- Láminas 17–21: trámites, reportes, codificación previa del EDC y validación de correo. Las actualizaciones de domicilio y de número/correo se canalizan a sucursal; solo Ubicación es editable en referencias.
- Láminas 22–25: domiciliación, intentos de cobro, alta/cancelación solo titular, cancelación bloqueada durante cobro. Notificaciones simuladas.
- Láminas 26–27: traspasos, reporte de chequera y mensaje de permisos de movimientos fusión.
- Láminas 28–31: Workflow, historial, confirmación y número de caso.
- Láminas 32–35: marcas, CAT, Afore Móvil, derechos ARCO y búsqueda por identificación.

El manual no contiene catálogos completos, plantillas oficiales de reportes ni todos los procesos secundarios. Por ello, los catálogos auxiliares, estados de práctica, numeración de casos, Wizard (guía breve), campos no visibles y controles adicionales son ilustrativos. Los íconos y proporciones se reconstruyeron; no es una copia píxel por píxel. Los menús secundarios sin flujo descrito (p. ej., GFI, orden de selección, SPEI, DATAMART) muestran el historial local de comunicaciones en vez de simular transacciones no documentadas. No hay envío real de mensajes, documentos oficiales, cobros, traspasos ni acceso a Oracle. Las alertas ARCO y bloqueos de envío son didácticos, no interpretación jurídica ni sustituto de los procedimientos autorizados.

## Verificación

`npm test` comprueba el modelo de datos, integridad de relaciones y algunas reglas puras. `npm run test:excel` comprueba lectura del libro de ejemplo con SheetJS y rechazo de archivos mal formados. El pipeline de GitHub ejecuta ambas pruebas y el build. En el entorno de generación solo se pudo comprobar sintaxis TypeScript/TSX, compilar la capa de datos y ejecutar `npm test`; el acceso a npm estaba bloqueado, por lo que no se pudo ejecutar Vite, probar SheetJS real ni revisar la interfaz en un navegador con las dependencias finales. No se incluye `package-lock.json`; `npm install` lo generará. El primer build en GitHub deberá confirmar la integración.
