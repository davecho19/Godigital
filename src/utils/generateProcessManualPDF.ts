import jsPDF from "jspdf";

export function generateProcessManualPDF(): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 15;

  const addHeaderFooter = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    
    // Top Bar Header
    doc.setFillColor(11, 37, 69); // Deep Navy #0B2545
    doc.rect(0, 0, pageWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("PLATAFORMA GODI — MANUAL DE PROCESOS OPERATIVOS PASO A PASO", margin, 5.5);
    doc.text("UpConta S.A.S. | Gerencia", pageWidth - margin, 5.5, { align: "right" });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Godi Partner Network © 2026 — Guía de Uso Interno e Instrucciones de Trabajo", margin, pageHeight - 7);
    doc.text(`Página ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 18;
      addHeaderFooter();
    }
  };

  // --- PORTADA INSTITUCIONAL ---
  doc.setFillColor(11, 37, 69); // #0B2545
  doc.rect(0, 0, pageWidth, 68, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("GODI", margin, 24);

  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text("MANUAL DE PROCESOS OPERATIVOS Y GUÍA PASO A PASO", margin, 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text("Ecosistema Empresarial de Gestión de Socios, Ventas, Puntos, Eventos y Comisiones", margin, 42);
  doc.text("Manual de Instrucción para Usuarios — Perfiles: Gerencia y Socio / Distribuidor", margin, 48);
  doc.text("Documento Exclusivo de Administración General | UpConta S.A.S. © 2026", margin, 54);

  y = 76;
  addHeaderFooter();

  // Helper title drawing
  const drawSectionHeader = (title: string) => {
    checkPageBreak(16);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
    doc.setFillColor(11, 37, 69);
    doc.rect(margin, y, 3, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(11, 37, 69);
    doc.text(title, margin + 6, y + 5.5);
    y += 12;
  };

  const drawSubHeader = (subtitle: string) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(subtitle, margin, y);
    y += 5.5;
  };

  const drawParagraph = (text: string) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.2 + 3;
  };

  const drawStepBox = (stepNum: string, title: string, desc: string) => {
    const textW = pageWidth - margin * 2 - 28;
    const lines = doc.splitTextToSize(desc, textW);
    const boxH = Math.max(14, lines.length * 4 + 7);
    checkPageBreak(boxH + 3);

    // Container box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, boxH, 2, 2, "FD");

    // Badge
    doc.setFillColor(11, 37, 69);
    doc.roundedRect(margin + 2.5, y + 2.5, 19, boxH - 5, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(stepNum, margin + 12, y + (boxH / 2) + 1, { align: "center" });

    // Step Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 25, y + 6);

    // Step Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(lines, margin + 25, y + 10);

    y += boxH + 3;
  };

  // --- SECCIÓN 1: INTRODUCCIÓN Y CONCEPTO GENERAL ---
  drawSectionHeader("1. ARQUITECTURA GENERAL Y PROPÓSITO DE GODI");
  drawParagraph(
    "GODI es la plataforma oficial de UpConta S.A.S. diseñada para gestionar de forma automatizada y sin complicaciones toda la operación comercial con la red de socios distribuidores autorizados. El sistema conecta en tiempo real los datos guardados en el navegador con las hojas oficiales de Google Sheets (pestañas USUARIOS, SOCIOS y VENTAS), garantizando cero pérdidas de datos y transparencia total."
  );

  // --- SECCIÓN 2: MATRIZ DE ROLES Y PERMISOS ---
  drawSectionHeader("2. RESUMEN DE PERMISOS: GERENCIA VS. SOCIO");
  
  checkPageBreak(50);
  const colW = [(pageWidth - margin * 2) * 0.35, (pageWidth - margin * 2) * 0.32, (pageWidth - margin * 2) * 0.33];
  doc.setFillColor(11, 37, 69);
  doc.rect(margin, y, colW[0], 7, "F");
  doc.rect(margin + colW[0], y, colW[1], 7, "F");
  doc.rect(margin + colW[0] + colW[1], y, colW[2], 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("PESTAÑA / MÓDULO", margin + 3, y + 4.8);
  doc.text("👑 PERFIL GERENCIA", margin + colW[0] + 3, y + 4.8);
  doc.text("👤 PERFIL SOCIO / DISTRIBUIDOR", margin + colW[0] + colW[1] + 3, y + 4.8);
  y += 7;

  const matrixData = [
    ["Dashboard / Inicio", "Analytics general, metas y ranking top", "Resumen de ventas propias y nivel"],
    ["Ventas y Comisiones", "Aprobar o rechazar ventas con adjunto", "Registrar ventas y subir comprobantes"],
    ["Validación Accesos", "Auditoría de correos, roles y claves", "No disponible para perfil socio"],
    ["Planes y Fichas", "Calculadora y especificaciones de software", "Herramientas de demostración comercial"],
    ["Educación Continua", "Crear eventos, cupos y descargar listas", "Inscribirse a talleres y descargar pases"],
    ["Beneficios y Puntos", "Crear premios, autorizar canjes y reglas", "Canjear saldo de puntos acumulados"],
    ["Soporte y Contacto", "Contactos técnicos + Botón Manual PDF", "Contactos directos de soporte"],
  ];

  matrixData.forEach((row, rIdx) => {
    checkPageBreak(8);
    const bg = rIdx % 2 === 0 ? 250 : 241;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, pageWidth - margin * 2, 6.5, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row[0], margin + 3, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(row[1], margin + colW[0] + 3, y + 4.5);
    doc.text(row[2], margin + colW[0] + colW[1] + 3, y + 4.5);
    y += 6.5;
  });
  y += 6;

  // --- SECCIÓN 3: MANUAL DE INSTRUCCIONES - PERFIL GERENCIA ---
  drawSectionHeader("3. GUÍA PASO A PASO: PERFIL DE GERENCIA");

  drawSubHeader("3.1 Pestaña 'Dashboard Gerencial'");
  drawParagraph(
    "Esta pestaña ofrece el control analítico central de la empresa. Muestra los indicadores clave de rendimiento (KPIs) globales de todas las ventas del país."
  );
  drawStepBox("Paso 1", "Filtrar por Período", "Seleccione en el menú superior el mes a consultar (Agosto 2026, Septiembre 2026 o Todos).");
  drawStepBox("Paso 2", "Revisión de Métricas", "Consulte los cuadros principales: Total Venta Bruta ($ USD), Comisiones Totales por Pagar ($), Socios Activos y Puntos Otorgados.");
  drawStepBox("Paso 3", "Ranking de Vendedores", "Examine la gráfica comparativa para identificar a los socios top con mayor volumen de facturación.");

  drawSubHeader("3.2 Pestaña 'Ventas y Comisiones' (Aprobaciones)");
  drawParagraph(
    "Es la mesa de control donde Gerencia valida las transacciones registradas por los socios antes de liberar comisiones o puntos."
  );
  drawStepBox("Paso 1", "Identificar Ventas Pendientes", "Filtre la lista seleccionando la pestaña 'Pendientes'.");
  drawStepBox("Paso 2", "Auditar Comprobante", "Haga clic en 'Ver Comprobante / RUC' para verificar que el pago del cliente sea legítimo.");
  drawStepBox("Paso 3", "Aprobar o Rechazar", "Haga clic en 'Aprobar Venta'. Inmediatamente se calculará la comisión en dólares ($) y se acreditarán los puntos al socio.");
  drawStepBox("Boton Verde", "Abrir Google Sheet Ventas", "Haga clic en el botón verde superior para revisar la pestaña 'VENTAS' en Google Sheets.");

  drawSubHeader("3.3 Pestaña 'Validación Accesos' (Exclusivo Gerencia)");
  drawParagraph(
    "Muestra la tabla maestra de credenciales activas, roles asignados y correos vinculados para garantizar la seguridad de la red."
  );
  drawStepBox("Paso 1", "Consultar Usuarios", "Revise la lista para validar que cada usuario tenga su rol 'gerencia' o 'socio' debidamente configurado.");

  drawSubHeader("3.4 Pestaña 'Educación Continua & Eventos'");
  drawParagraph(
    "Permite programar capacitaciones semanales y convenciones masivas, además de descargar los listados oficiales de ingreso."
  );
  drawStepBox("Paso 1", "Crear Nuevo Evento", "Presione '+ Crear Evento / Capacitación'. Ingrese título, expositor, fecha, hora, ubicación y categoría.");
  drawStepBox("Paso 2", "Configurar Cupos y Pagos", "Fije el número de asientos disponibles y, si aplica, el valor de la reserva pagada ($ USD) y puntos de regalo.");
  drawStepBox("Paso 3", "Descargar Lista de Asistentes", "Haga clic en 'Descargar PDF Asistentes' o 'Exportar CSV Excel' para obtener la nómina impresa con firma de asistencia.");

  drawSubHeader("3.5 Pestaña 'Beneficios & Puntos'");
  drawParagraph(
    "Controla el catálogo de premios de fidelización, aprueba solicitudes de entrega y define la tabla de puntos por plan comercial."
  );
  drawStepBox("Paso 1", "Gestionar Recompensas", "Agregue o edite productos (ej. Licencias extra, Tarjetas Regalo) asignando su costo en puntos.");
  drawStepBox("Paso 2", "Aprobar Canjes", "En la tabla de solicitudes, apruebe o marque como 'Entregado' los premios pedidos por los socios.");
  drawStepBox("Paso 3", "Ajustar Reglas del Plan", "Fije cuántos puntos otorga cada plan (ej. UpConta ERP Pyme = 150 Pts).");

  // --- SECCIÓN 4: MANUAL DE INSTRUCCIONES - PERFIL SOCIO ---
  drawSectionHeader("4. GUÍA PASO A PASO: PERFIL DE SOCIO / DISTRIBUIDOR");

  drawSubHeader("4.1 Registro de Ventas");
  drawParagraph(
    "Módulo para reportar las ventas cerradas con clientes y solicitar la comisión correspondiente."
  );
  drawStepBox("Paso 1", "Datos del Cliente", "Rellene la Cédula/RUC y Nombre o Razón Social del cliente comprador.");
  drawStepBox("Paso 2", "Selección de Plan", "Seleccione el sistema comercial vendido (ej. UpConta ERP, Facturación, Firma Electrónica).");
  drawStepBox("Paso 3", "Subir Comprobante", "Adjunte la foto o PDF del comprobante de depósito o transferencia bancaria.");
  drawStepBox("Paso 4", "Enviar a Revisión", "Presione 'Registrar Venta'. La transacción quedará en estado 'Pendiente' hasta validación de Gerencia.");

  drawSubHeader("4.2 Consulta de Comisiones & PDF");
  drawParagraph(
    "Monitoreo transparente de sus ganancias acumuladas en dólares ($ USD)."
  );
  drawStepBox("Paso 1", "Estado de Cuenta", "Consulte las ventas aprobadas y el monto exacto de comisión a cobrar.");
  drawStepBox("Paso 2", "Descargar PDF", "Haga clic en 'Descargar Estado de Cuenta PDF' para obtener la constancia oficial de respaldo.");

  drawSubHeader("4.3 Puntos y Canje de Beneficios");
  drawParagraph(
    "Canje de su saldo acumulado de puntos por recompensas del catálogo."
  );
  drawStepBox("Paso 1", "Revisar Saldo", "Consulte su saldo de puntos en la cabecera de la pestaña 'Beneficios'.");
  drawStepBox("Paso 2", "Solicitar Premio", "Si su saldo cubre el costo del premio deseado, presione 'Solicitar Canje'. Su solicitud se enviará a Gerencia.");

  drawSubHeader("4.4 Inscripción a Eventos de Educación Continua");
  drawParagraph(
    "Inscripción a talleres semanales los jueves y convenciones nacionales."
  );
  drawStepBox("Paso 1", "Elegir Capacitación", "Examine la cartelera de eventos disponibles.");
  drawStepBox("Paso 2", "Inscribirse Gratis o Pagado", "Para talleres semanales presione 'Inscribirme Gratis'. Para convenciones con reserva pagada, suba el comprobante de reserva.");
  drawStepBox("Paso 3", "Obtener Pase Digital", "El sistema emitirá su pase de entrada digital con código único de reserva.");

  // --- SECCIÓN 5: DIAGRAMAS DE FLUJO Y MAPAS OPERATIVOS ---
  drawSectionHeader("5. DIAGRAMAS DE FLUJO Y MAPAS OPERATIVOS");

  const drawFlowBox = (x: number, yPos: number, w: number, h: number, title: string, subtitle: string, colorHex: string) => {
    doc.setFillColor(colorHex === "navy" ? 11 : colorHex === "amber" ? 245 : colorHex === "emerald" ? 16 : 241, 
                     colorHex === "navy" ? 37 : colorHex === "amber" ? 158 : colorHex === "emerald" ? 185 : 245, 
                     colorHex === "navy" ? 69 : colorHex === "amber" ? 11 : colorHex === "emerald" ? 129 : 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, yPos, w, h, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(colorHex === "navy" ? 255 : 30, colorHex === "navy" ? 255 : 41, colorHex === "navy" ? 255 : 59);
    doc.text(title, x + 3, yPos + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(subtitle, x + 3, yPos + 8.5);
  };

  drawSubHeader("Flujo 1: Registro de Venta, Aprobación y Acreditación Dual ($ + Pts)");
  checkPageBreak(25);
  drawFlowBox(margin, y, 42, 11, "1. Socio Registra Venta", "Ingresa cliente + adjunta pago", "slate");
  doc.setFontSize(10); doc.setTextColor(100); doc.text("➔", margin + 44, y + 7);
  drawFlowBox(margin + 50, y, 52, 11, "2. Gerencia Audita", "Revisa comprobante en 'Ventas'", "amber");
  doc.setFontSize(10); doc.setTextColor(100); doc.text("➔", margin + 104, y + 7);
  drawFlowBox(margin + 110, y, 48, 11, "3. Cierre Aprobado", "Acredita $ Comisión + Pts Recompensa", "emerald");
  y += 18;

  // --- SECCIÓN 6: CANALES DE ATENCIÓN Y SOPORTE ---
  drawSectionHeader("6. UBICACIÓN DEL MANUAL Y CANALES DE SOPORTE");
  drawParagraph(
    "El botón para descargar este Manual de Procesos en PDF se encuentra disponible de forma permanente en la pestaña 'Soporte', accesible para usuarios con perfil de Gerencia. Ante cualquier inquietud técnica o comercial, comuníquese con el equipo de soporte oficial de UpConta Sistemas."
  );

  checkPageBreak(25);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(11, 37, 69);
  doc.text("DIRECCIÓN DE OPERACIONES & TECNOLOGÍA DE LA INFORMACIÓN", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("GODI PLATFORM — UpConta S.A.S. © 2026 | Documento de Control Interno", margin, y + 4.5);

  // Save the PDF
  doc.save("Manual_de_Procesos_Godi.pdf");
}
