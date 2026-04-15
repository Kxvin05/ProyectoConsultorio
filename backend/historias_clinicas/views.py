from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import HistoriaClinica
from .serializers import HistoriaClinicaSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from pacientes.models import Paciente

from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from PIL import Image as PILImage
from io import BytesIO
import datetime
import os


PURPLE       = colors.HexColor('#7C3AED')
PURPLE_LIGHT = colors.HexColor('#EDE9FE')
PURPLE_MID   = colors.HexColor('#C4B5FD')
PINK         = colors.HexColor('#EC4899')
TEAL         = colors.HexColor('#06B6D4')
GRAY_DARK    = colors.HexColor('#374151')
GRAY_MID     = colors.HexColor('#6B7280')
WHITE        = colors.white


class ConsultorioCanvas(canvas.Canvas):
    def __init__(self, *args, logo_path=None, paciente_nombre='', **kwargs):
        super().__init__(*args, **kwargs)
        self.logo_path = logo_path
        self.paciente_nombre = paciente_nombre
        self._saved_page_states = []
        self._logo_reader = self._cargar_logo()

    def _cargar_logo(self):
        """Pre-carga el logo una sola vez al iniciar el canvas"""
        if self.logo_path and os.path.exists(self.logo_path):
            try:
                pil_img = PILImage.open(self.logo_path).convert('RGBA')
                buf = BytesIO()
                pil_img.save(buf, format='PNG')
                buf.seek(0)
                return ImageReader(buf)
            except Exception as e:
                print(f"Error cargando logo: {e}")
        return None

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def _draw_header_footer(self, page_count):
        self.saveState()
        w, h = letter

        # Header morado
        self.setFillColor(PURPLE)
        self.rect(0, h - 70, w, 70, fill=1, stroke=0)

        # Logo
        if self._logo_reader:
            try:
                self.drawImage(
                    self._logo_reader,
                    18, h - 65, width=55, height=55,
                    preserveAspectRatio=True, mask='auto'
                )
            except Exception as e:
                print(f"Error dibujando logo: {e}")

        # Nombre consultorio
        self.setFillColor(WHITE)
        self.setFont('Helvetica-Bold', 14)
        self.drawString(82, h - 28, 'Consultorio Psicológico')
        self.setFont('Helvetica', 11)
        self.drawString(82, h - 44, 'Alexandra Pérez — Psicóloga Clínica')

        # Fecha
        fecha = datetime.date.today().strftime('%d/%m/%Y')
        self.setFont('Helvetica', 9)
        self.setFillColor(PURPLE_LIGHT)
        self.drawRightString(w - 20, h - 30, f'Fecha: {fecha}')
        self.drawRightString(w - 20, h - 44, 'Documento Confidencial')

        # Línea degradada
        self.setStrokeColor(PINK)
        self.setLineWidth(3)
        self.line(0, h - 72, w / 2, h - 72)
        self.setStrokeColor(TEAL)
        self.line(w / 2, h - 72, w, h - 72)

        # Footer
        self.setFillColor(PURPLE_LIGHT)
        self.rect(0, 0, w, 36, fill=1, stroke=0)
        self.setStrokeColor(PURPLE_MID)
        self.setLineWidth(1)
        self.line(0, 36, w, 36)
        self.setFillColor(PURPLE)
        self.setFont('Helvetica', 8)
        self.drawCentredString(
            w / 2, 14,
            f'Historia Clínica — {self.paciente_nombre} — '
            f'Página {self._pageNumber} de {page_count} — Uso exclusivo del consultorio'
        )

        self.restoreState()


class HistoriaClinicaViewSet(ModelViewSet):
    serializer_class = HistoriaClinicaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.rol in ['recepcion', 'psicologo']:
            return HistoriaClinica.objects.all()
        paciente = Paciente.objects.filter(usuario=user).first()
        if paciente:
            return HistoriaClinica.objects.filter(paciente=paciente)
        return HistoriaClinica.objects.none()

    @action(detail=False, methods=["get"])
    def por_documento(self, request):
        documento = request.query_params.get('documento')
        if not documento:
            return Response({"error": "Documento requerido"}, status=400)
        try:
            paciente = Paciente.objects.get(documento=documento)
            historia = HistoriaClinica.objects.filter(paciente=paciente).order_by('-creada_en')
            serializer = self.get_serializer(historia, many=True)
            return Response(serializer.data)
        except Paciente.DoesNotExist:
            return Response({"error": "Paciente no encontrado"}, status=404)

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        try:
            historia = HistoriaClinica.objects.get(pk=pk)
        except HistoriaClinica.DoesNotExist:
            return Response({"error": "Historia no encontrada"}, status=404)

        paciente = historia.paciente
        nombre_completo = f"{paciente.nombres} {paciente.apellidos}"
        fecha_str = datetime.date.today().strftime('%d/%m/%Y')

        logo_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'logo_consultorio.png'
        )

        buffer = BytesIO()

        def make_canvas(filename, **kwargs):
            return ConsultorioCanvas(
                filename,
                logo_path=logo_path,
                paciente_nombre=nombre_completo,
                pagesize=letter,
            )

        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=50, leftMargin=50,
            topMargin=90, bottomMargin=55,
        )

        styles = getSampleStyleSheet()

        titulo_style = ParagraphStyle(
            'Titulo', fontSize=20, textColor=PURPLE,
            fontName='Helvetica-Bold', spaceAfter=4, spaceBefore=0,
        )
        subtitulo_style = ParagraphStyle(
            'Subtitulo', fontSize=10, textColor=GRAY_MID,
            fontName='Helvetica', spaceAfter=14,
        )
        section_label_style = ParagraphStyle(
            'SectionLabel', fontSize=9, textColor=PURPLE,
            fontName='Helvetica-Bold', spaceBefore=0, spaceAfter=2,
        )
        content_style = ParagraphStyle(
            'Content', fontSize=10, textColor=GRAY_DARK,
            fontName='Helvetica', spaceAfter=4, leading=15,
        )
        footer_note_style = ParagraphStyle(
            'FooterNote', fontSize=8, textColor=GRAY_MID,
            fontName='Helvetica-Oblique', alignment=1, spaceBefore=10,
        )

        elements = []

        elements.append(Spacer(1, 6))
        elements.append(Paragraph('Historia Clínica', titulo_style))
        elements.append(Paragraph('Documento generado por el sistema del consultorio', subtitulo_style))

        paciente_data = [
            [
                Paragraph('<b><font color="#7C3AED">Paciente</font></b>', styles['Normal']),
                Paragraph(nombre_completo, styles['Normal']),
                Paragraph('<b><font color="#7C3AED">Documento</font></b>', styles['Normal']),
                Paragraph(paciente.documento or '—', styles['Normal']),
            ],
            [
                Paragraph('<b><font color="#7C3AED">Teléfono</font></b>', styles['Normal']),
                Paragraph(paciente.telefono or '—', styles['Normal']),
                Paragraph('<b><font color="#7C3AED">Email</font></b>', styles['Normal']),
                Paragraph(
                    paciente.usuario.email if paciente.usuario else (paciente.email or '—'),
                    styles['Normal']
                ),
            ],
            [
                Paragraph('<b><font color="#7C3AED">Fecha registro</font></b>', styles['Normal']),
                Paragraph(
                    historia.creada_en.strftime('%d/%m/%Y') if hasattr(historia, 'creada_en') and historia.creada_en else fecha_str,
                    styles['Normal']
                ),
                Paragraph('', styles['Normal']),
                Paragraph('', styles['Normal']),
            ],
        ]

        paciente_table = Table(paciente_data, colWidths=[1.3*inch, 2.2*inch, 1.3*inch, 2.2*inch])
        paciente_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), PURPLE_LIGHT),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#DDD6FE')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#DDD6FE')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, PURPLE_MID),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(paciente_table)
        elements.append(Spacer(1, 18))

        elements.append(HRFlowable(width='100%', thickness=2, color=PURPLE))
        elements.append(Spacer(1, 14))

        campos_pares = [
            ('Motivo de Consulta',      historia.motivo_consulta,     'Diagnostico',           historia.diagnostico),
            ('Tratamiento Recomendado', historia.tratamiento,          'Antecedentes Medicos',  historia.antecedentes_medicos),
            ('Alergias',                historia.alergias,             'Medicamentos Actuales', historia.medicamentos_actuales),
        ]

        for label1, val1, label2, val2 in campos_pares:
            celda1 = [
                Paragraph(label1, section_label_style),
                Paragraph(val1 or 'No registrado', content_style),
            ]
            celda2 = [
                Paragraph(label2, section_label_style),
                Paragraph(val2 or 'No registrado', content_style),
            ]
            row_table = Table([[celda1, celda2]], colWidths=[3.5*inch, 3.5*inch])
            row_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#FAFAFA')),
                ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#FAFAFA')),
                ('BOX', (0, 0), (0, 0), 0.5, PURPLE_MID),
                ('BOX', (1, 0), (1, 0), 0.5, PURPLE_MID),
                ('PADDING', (0, 0), (-1, -1), 10),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (1, 0), (1, 0), 14),
            ]))
            elements.append(row_table)
            elements.append(Spacer(1, 8))

        if historia.observaciones:
            elements.append(Spacer(1, 4))
            obs_table = Table(
                [[
                    Paragraph('Observaciones Adicionales', section_label_style),
                    Paragraph(historia.observaciones, content_style),
                ]],
                colWidths=[1.8*inch, 5.2*inch]
            )
            obs_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), PURPLE_LIGHT),
                ('BOX', (0, 0), (-1, -1), 0.5, PURPLE_MID),
                ('PADDING', (0, 0), (-1, -1), 10),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(obs_table)

        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width='100%', thickness=1, color=PURPLE_MID))
        elements.append(Paragraph(
            'Este documento es de uso exclusivo del Consultorio Psicológico Alexandra Pérez. '
            'La información contenida es estrictamente confidencial.',
            footer_note_style
        ))

        doc.build(elements, canvasmaker=make_canvas)
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="historia_{paciente.documento}.pdf"'
        )
        return response