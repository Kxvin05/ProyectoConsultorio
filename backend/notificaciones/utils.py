from .models import Notificacion
from .email_utils import enviar_email
from datetime import date, timedelta
from citas.models import Cita

def crear_notificacion(usuario, titulo, mensaje, enviar_mail=True):
    Notificacion.objects.create(
        usuario=usuario,
        titulo=titulo,
        mensaje=mensaje
    )

    if enviar_mail:
        enviar_email(usuario, titulo, mensaje)

def enviar_recordatorios_citas():

    #envia recordatorios de mañana

    manana = date.today() + timedelta(days=1)

    citas = Cita.objects.select_related(
        "psicologo__usuario",
        "paciente"
    ).filter(fecha=manana)

    enviados = 0

    for cita in citas:
        usuario = cita.psicologo.usuario

        titulo = "Recordatorio de cita"
        mensaje = (
            f"Tiene cita mañana con {cita.paciente}"
            f"a las {cita.hora}"
        )

        crear_notificacion(usuario, titulo, mensaje)
        enviados +=1
    
    return enviados