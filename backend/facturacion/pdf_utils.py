from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime


def generar_pdf_factura(factura):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    COLOR_PRIMARIO = (0.4, 0.49, 0.92)
    COLOR_PRIMARIO_OSCURO = (0.29, 0.18, 0.64)
    COLOR_BLANCO = (1, 1, 1)
    COLOR_GRIS_OSCURO = (0.2, 0.2, 0.2)
    COLOR_GRIS_MEDIO = (0.4, 0.4, 0.4)
    COLOR_FONDO_CLARO = (0.97, 0.97, 1)
    COLOR_VERDE = (0.2, 0.8, 0.4)
    COLOR_AMARILLO = (1, 0.7, 0.1)
    COLOR_ROJO = (0.9, 0.3, 0.3)

    # HEADER
    p.setFillColorRGB(*COLOR_PRIMARIO)
    p.rect(0, height - 180, width, 180, fill=1, stroke=0)
    p.setFillColorRGB(*COLOR_PRIMARIO_OSCURO)
    p.rect(0, height - 185, width, 10, fill=1, stroke=0)

    # NOMBRE CONSULTORIO
    p.setFillColorRGB(*COLOR_BLANCO)
    p.setFont("Helvetica-Bold", 28)
    p.drawString(50, height - 70, "Alexandra Perez")
    p.setFont("Helvetica", 13)
    p.setFillColorRGB(0.85, 0.85, 1)
    p.drawString(50, height - 95, "Consultorio Psicologico")
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(0.75, 0.75, 0.95)
    p.drawString(50, height - 115, "Psicologa Clinica - Especialista en Salud Mental")
    p.drawString(50, height - 132, "Email: consultorioalexandra.perez@gmail.com")

    # NÚMERO FACTURA
    p.setFillColorRGB(*COLOR_BLANCO)
    p.setFont("Helvetica-Bold", 14)
    p.drawRightString(width - 50, height - 65, f"FACTURA #{factura.id}")
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(0.85, 0.85, 1)
    fecha_str = str(factura.creada_en)[:10] if factura.creada_en else "N/A"
    p.drawRightString(width - 50, height - 85, f"Fecha: {fecha_str}")

    # ESTADO BADGE
    estado = (factura.estado or "").upper()
    if estado == "PAGADA":
        p.setFillColorRGB(*COLOR_VERDE)
    elif estado == "PENDIENTE":
        p.setFillColorRGB(*COLOR_AMARILLO)
    else:
        p.setFillColorRGB(*COLOR_ROJO)
    p.roundRect(width - 130, height - 115, 80, 22, 5, fill=1, stroke=0)
    p.setFillColorRGB(*COLOR_BLANCO)
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width - 90, height - 107, estado)

    # SECCIÓN PACIENTE
    y = height - 220
    p.setFillColorRGB(*COLOR_FONDO_CLARO)
    p.roundRect(40, y - 70, width - 80, 80, 8, fill=1, stroke=0)
    p.setStrokeColorRGB(*COLOR_PRIMARIO)
    p.setLineWidth(1.5)
    p.roundRect(40, y - 70, width - 80, 80, 8, fill=0, stroke=1)
    p.setFillColorRGB(*COLOR_PRIMARIO)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(55, y + 2, "INFORMACION DEL PACIENTE")
    p.setFillColorRGB(*COLOR_GRIS_OSCURO)
    p.setFont("Helvetica", 10)
    paciente_nombre = str(factura.paciente) if factura.paciente else "N/A"
    p.drawString(55, y - 18, f"Paciente: {paciente_nombre}")
    p.drawString(300, y - 18, f"Metodo de pago: {(factura.metodo_pago or 'N/A').capitalize()}")
    if factura.cita:
        p.drawString(55, y - 35, f"Cita: {factura.cita.fecha} - {factura.cita.hora}")
        p.drawString(300, y - 35, f"Psicologo: {factura.cita.psicologo}")

    # TABLA DE DETALLES
    y -= 110
    p.setFillColorRGB(*COLOR_PRIMARIO)
    p.roundRect(40, y, width - 80, 30, 5, fill=1, stroke=0)
    p.setFillColorRGB(*COLOR_BLANCO)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(55, y + 9, "DESCRIPCION")
    p.drawRightString(width - 55, y + 9, "MONTO")
    y -= 5
    p.setFillColorRGB(*COLOR_FONDO_CLARO)
    p.rect(40, y - 55, width - 80, 55, fill=1, stroke=0)
    p.setStrokeColorRGB(0.85, 0.85, 0.95)
    p.setLineWidth(0.5)
    p.rect(40, y - 55, width - 80, 55, fill=0, stroke=1)
    p.setFillColorRGB(*COLOR_GRIS_OSCURO)
    p.setFont("Helvetica", 10)
    descripcion = str(factura.descripcion or "Servicio psicologico")
    if len(descripcion) > 80:
        descripcion = descripcion[:80] + "..."
    p.drawString(55, y - 20, descripcion)
    p.setStrokeColorRGB(0.85, 0.85, 0.95)
    p.setLineWidth(0.5)
    p.line(40, y - 35, width - 40, y - 35)
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(*COLOR_GRIS_MEDIO)
    p.drawString(55, y - 48, "Sesion de consulta psicologica")
    p.drawRightString(width - 55, y - 22, f"$ {formatear_pesos(factura.valor)}")

    # RESUMEN FINANCIERO
    y -= 80
    p.setFillColorRGB(*COLOR_FONDO_CLARO)
    p.rect(width - 240, y, 200, 85, fill=1, stroke=0)
    p.setStrokeColorRGB(0.85, 0.85, 0.95)
    p.setLineWidth(0.5)
    p.rect(width - 240, y, 200, 85, fill=0, stroke=1)
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(*COLOR_GRIS_MEDIO)
    p.drawString(width - 230, y + 65, "Subtotal:")
    p.drawRightString(width - 55, y + 65, f"$ {formatear_pesos(factura.valor)}")
    p.drawString(width - 230, y + 45, "Descuento:")
    p.drawRightString(width - 55, y + 45, f"$ {formatear_pesos(factura.descuento)}")
    p.setStrokeColorRGB(*COLOR_PRIMARIO)
    p.setLineWidth(1)
    p.line(width - 230, y + 33, width - 55, y + 33)
    p.setFillColorRGB(*COLOR_PRIMARIO)
    p.setFont("Helvetica-Bold", 13)
    p.drawString(width - 230, y + 15, "TOTAL:")
    p.drawRightString(width - 55, y + 15, f"$ {formatear_pesos(factura.total)}")

    # NOTA
    y -= 50
    p.setFillColorRGB(1, 0.97, 0.87)
    p.roundRect(40, y - 35, width - 80, 45, 6, fill=1, stroke=0)
    p.setStrokeColorRGB(0.95, 0.75, 0.2)
    p.setLineWidth(1)
    p.roundRect(40, y - 35, width - 80, 45, 6, fill=0, stroke=1)
    p.setFillColorRGB(0.5, 0.35, 0.0)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(55, y + 3, "Nota:")
    p.setFont("Helvetica", 9)
    p.drawString(85, y + 3, "Conserve este documento como comprobante de pago de su consulta.")
    p.drawString(55, y - 18, "Para cualquier consulta sobre esta factura, contactenos al correo registrado.")

    # FOOTER
    p.setFillColorRGB(*COLOR_PRIMARIO)
    p.rect(0, 0, width, 45, fill=1, stroke=0)
    p.setFillColorRGB(*COLOR_BLANCO)
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width / 2, 26, "Consultorio Psicologico Alexandra Perez")
    p.setFont("Helvetica", 8)
    p.setFillColorRGB(0.85, 0.85, 1)
    p.drawCentredString(width / 2, 12, "Tu bienestar mental es nuestra prioridad")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer


def formatear_pesos(valor):
    """Formatea correctamente sin eliminar el punto decimal"""
    # ✅ Convertir Decimal/float a int correctamente
    valor_int = int(float(valor))
    return "{:,}".format(valor_int).replace(',', '.')
