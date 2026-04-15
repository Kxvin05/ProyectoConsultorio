from django.db import models
from usuarios.models import Usuario
from django.core.exceptions import ValidationError

class Notificacion(models.Model):

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    titulo = models.CharField(max_length=150)
    mensaje = models.TextField()

    leida = models.BooleanField(default=False)
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
    
    #validacion
    def clean(self):
        if len(self.mensaje.strip()) < 5:
            raise ValidationError(
                "El mensaje es demasiado corto."
            )

class Mensaje(models.Model):
    remitente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensajes_enviados')
    destinatario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensajes_recibidos')
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    leido = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.remitente.username} → {self.destinatario.username}: {self.contenido[:30]}"


class Conversacion(models.Model):
    participante1 = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='conversaciones_como_p1')
    participante2 = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='conversaciones_como_p2')
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('participante1', 'participante2')
    
    def __str__(self):
        return f"Chat: {self.participante1.username} - {self.participante2.username}"