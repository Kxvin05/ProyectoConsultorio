import jsPDF from 'jspdf';
import logoImage from '../assets/images/logo.png';

export const descargarFacturaPDF = async (factura) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // ========== HEADER CON LOGO ==========
    doc.addImage(logoImage, 'PNG', 15, 10, 25, 25);

    // Nombre del consultorio
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Consultorio Alexandra Pérez', 50, 18);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Psicóloga Clínica - Especialista en Salud Mental', 50, 25);

    // Línea decorativa
    doc.setDrawColor(179, 136, 209);
    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);

    yPosition = 52;

    // ========== SECCIÓN FACTURA ==========
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURA', 15, yPosition);

    // ID y Fecha a la derecha - CORREGIDO
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`No. Factura: #${factura.id || factura.factura_id}`, pageWidth - 70, yPosition);
    yPosition += 6;
    doc.text(`Fecha: ${new Date(factura.creada_en).toLocaleDateString('es-CO')}`, pageWidth - 70, yPosition);

    yPosition += 15;

    // ========== INFO PACIENTE ==========
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', 20, yPosition);

    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    yPosition += 7;
    //Mostrar nombre del paciente
    doc.text(`Paciente: ${factura.paciente_nombre || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    // CORREGIDO - Mostrar documento real
    doc.text(`Documento: ${factura.paciente_documento || 'N/A'}`, 20, yPosition);

    yPosition += 15;

    // ========== TABLA DE DETALLES ==========
    doc.setFillColor(179, 136, 209);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Concepto', 20, yPosition);
    doc.text('Forma de Pago', 100, yPosition);
    doc.text('Monto', pageWidth - 50, yPosition);

    yPosition += 10;

    // Contenido tabla
    doc.setFillColor(255, 255, 255);
    doc.rect(15, yPosition - 5, pageWidth - 30, 20, 'F');

    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(factura.descripcion, 20, yPosition);
    
    const formaPago = factura.metodo_pago 
      ? factura.metodo_pago.charAt(0).toUpperCase() + factura.metodo_pago.slice(1) 
      : 'No especificada';
    doc.text(formaPago, 100, yPosition);
    // CORREGIDO - Formato COP con 3 decimales
    doc.text(`COP ${formatearPesos(factura.valor)}`, pageWidth - 50, yPosition);

    yPosition += 25;

    // ========== RESUMEN FINANCIERO ==========
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 80, yPosition - 10, 65, 35, 'F');

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN', pageWidth - 75, yPosition);

    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    yPosition += 7;
    // CORREGIDO - Formato pesos colombiano con 3 decimales
    doc.text(`Subtotal: COP ${formatearPesos(factura.valor)}`, pageWidth - 75, yPosition);
    yPosition += 5;
    doc.text(`Descuento: COP ${formatearPesos(factura.descuento)}`, pageWidth - 75, yPosition);

    // Línea separadora
    yPosition += 5;
    doc.setDrawColor(179, 136, 209);
    doc.line(pageWidth - 75, yPosition, pageWidth - 15, yPosition);

    yPosition += 6;
    doc.setTextColor(179, 136, 209);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    // CORREGIDO - Total con 3 decimales
    doc.text(`Total: COP ${formatearPesos(factura.total)}`, pageWidth - 75, yPosition);

    yPosition = pageHeight - 40;

    // ========== ESTADO ==========
    const estadoColor = 
      factura.estado === 'pagada' 
        ? [76, 205, 196]
        : factura.estado === 'pendiente'
        ? [255, 179, 71]
        : [231, 76, 60];

    doc.setFillColor(...estadoColor);
    doc.rect(15, yPosition - 5, 60, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text(`ESTADO: ${factura.estado.toUpperCase()}`, 20, yPosition);

    // ========== PIE DE PÁGINA ==========
    yPosition = pageHeight - 15;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.line(15, yPosition - 5, pageWidth - 15, yPosition - 5);
    doc.text('Gracias por confiar en nuestros servicios', 15, yPosition);
    doc.text(`Descargado: ${new Date().toLocaleDateString('es-CO')} - ${new Date().toLocaleTimeString('es-CO')}`, pageWidth - 70, yPosition);

    // Descargar
    doc.save(`Factura_${factura.id || factura.factura_id}.pdf`);
  } catch (err) {
    console.error('Error generando PDF:', err);
    alert('Error al descargar factura');
  }
};

// ========== FUNCIÓN AUXILIAR PARA FORMATEAR PESOS ==========
const formatearPesos = (valor) => {
  const numero = parseFloat(valor || 0);
  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const descargarHistoriaPDF = async (historia) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // ========== HEADER CON LOGO ==========
    doc.addImage(logoImage, 'PNG', 15, 10, 25, 25);

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Consultorio Alexandra Pérez', 50, 18);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Psicóloga Clínica - Especialista en Salud Mental', 50, 25);

    // Línea decorativa
    doc.setDrawColor(179, 136, 209);
    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);

    yPosition = 52;

    // ========== TÍTULO ==========
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIA CLÍNICA', 15, yPosition);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${new Date(historia.fecha_creacion).toLocaleDateString('es-CO')}`, pageWidth - 50, yPosition);

    yPosition += 15;

    // ========== FUNCIÓN PARA AGREGAR SECCIONES ==========
    const agregarSeccion = (titulo, contenido) => {
      if (!contenido || contenido.trim() === '') return;

      // Verificar si necesita nueva página
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Encabezado de sección
      doc.setFillColor(179, 136, 209);
      doc.rect(15, yPosition - 4, pageWidth - 30, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(titulo, 20, yPosition);

      yPosition += 12;

      // Contenido
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const textoEnvuelto = doc.splitTextToSize(contenido, pageWidth - 30);
      doc.text(textoEnvuelto, 20, yPosition);
      yPosition += textoEnvuelto.length * 5 + 5;
    };

    // ========== AGREGAR SECCIONES ==========
    agregarSeccion('📋 Motivo de Consulta', historia.motivo_consulta);
    agregarSeccion('🔍 Diagnóstico', historia.diagnostico);
    agregarSeccion('💊 Tratamiento Recomendado', historia.tratamiento);
    agregarSeccion('📜 Antecedentes Médicos', historia.antecedentes_medicos);
    agregarSeccion('⚠️ Alergias', historia.alergias);
    agregarSeccion('💉 Medicamentos Actuales', historia.medicamentos_actuales);
    agregarSeccion('📝 Observaciones Adicionales', historia.observaciones);

    // ========== PIE DE PÁGINA ==========
    yPosition = pageHeight - 15;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.line(15, yPosition - 5, pageWidth - 15, yPosition - 5);
    doc.text('DOCUMENTO CONFIDENCIAL - Uso exclusivo del paciente y profesional de salud', 15, yPosition);
    doc.text(`Descargado: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - 70, yPosition);

    // Descargar
    doc.save(`Historia_Clinica_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error('Error generando PDF:', err);
    alert('Error al descargar historia clínica');
  }
};