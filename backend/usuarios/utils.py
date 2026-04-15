from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def enviar_codigo_verificacion(correo, codigo):
    asunto = '🔐 Código de Verificación - Consultorio Alexandra Pérez'
    mensaje_texto = f'Tu código de verificación es: {codigo}. Expira en 5 minutos.'

    mensaje_html = f'''
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ margin: 0; padding: 0; background: #f0f4ff; font-family: Arial, sans-serif; }}
    .wrapper {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }}
    .header {{ background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); padding: 50px 40px; text-align: center; position: relative; overflow: hidden; }}
    .header::before {{ content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 60%); }}
    .header-icon {{ font-size: 70px; margin-bottom: 15px; position: relative; z-index: 1; }}
    .header h1 {{ color: white; margin: 0; font-size: 26px; font-weight: 700; position: relative; z-index: 1; }}
    .header p {{ color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px; position: relative; z-index: 1; }}
    .body {{ padding: 40px; }}
    .greeting {{ font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 8px; }}
    .subtitle {{ color: #718096; font-size: 15px; margin-bottom: 30px; line-height: 1.6; }}
    .code-container {{ text-align: center; margin: 35px 0; }}
    .code-label {{ font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }}
    .code-box {{ display: inline-block; background: linear-gradient(135deg, #0f0c29, #302b63); border-radius: 16px; padding: 25px 50px; box-shadow: 0 10px 40px rgba(48,43,99,0.4); }}
    .code {{ font-size: 48px; font-weight: 900; color: white; letter-spacing: 12px; text-shadow: 0 0 20px rgba(102,126,234,0.8); font-family: 'Courier New', monospace; }}
    .timer {{ display: inline-block; background: linear-gradient(135deg, #fed7aa, #fdba74); color: #92400e; padding: 8px 20px; border-radius: 50px; font-size: 13px; font-weight: 700; margin-top: 15px; }}
    .steps {{ background: linear-gradient(135deg, #f8faff, #eef2ff); border-radius: 16px; padding: 25px; margin: 25px 0; }}
    .steps-title {{ font-size: 13px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }}
    .step {{ display: flex; align-items: center; margin: 10px 0; }}
    .step-num {{ background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-right: 12px; text-align: center; line-height: 28px; }}
    .step-text {{ color: #374151; font-size: 14px; }}
    .warning {{ background: linear-gradient(135deg, #fef9c3, #fef08a); border-left: 4px solid #eab308; border-radius: 8px; padding: 15px 20px; margin: 20px 0; }}
    .warning p {{ color: #713f12; font-size: 13px; margin: 0; line-height: 1.5; }}
    .divider {{ height: 5px; background: linear-gradient(90deg, #0f0c29, #302b63, #667eea, #f093fb); }}
    .footer {{ background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 30px 40px; text-align: center; }}
    .footer-icon {{ font-size: 30px; margin-bottom: 10px; }}
    .footer strong {{ color: white; font-size: 15px; display: block; margin-bottom: 5px; }}
    .footer p {{ color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">🔐</div>
      <h1>Verificación de Identidad</h1>
      <p>Consultorio Psicológico Alexandra Pérez</p>
    </div>
    <div class="divider"></div>
    <div class="body">
      <div class="greeting">Hola 👋</div>
      <p class="subtitle">
        Recibimos una solicitud para restablecer tu contraseña. 
        Usa el siguiente código para verificar tu identidad:
      </p>

      <div class="code-container">
        <div class="code-label">Tu código de verificación</div>
        <div class="code-box">
          <div class="code">{codigo}</div>
        </div>
        <br>
        <span class="timer">⏱️ Expira en 5 minutos</span>
      </div>

      <div class="steps">
        <div class="steps-title">📋 Pasos a seguir</div>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">Copia el código de verificación de arriba</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Ingrésalo en la pantalla de verificación</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">Crea tu nueva contraseña segura</div>
        </div>
      </div>

      <div class="warning">
        <p>⚠️ <strong>Importante:</strong> Si no solicitaste este código, ignora este mensaje. Tu cuenta permanece segura. Nunca compartas este código con nadie.</p>
      </div>
    </div>
    <div class="footer">
      <div class="footer-icon">💜</div>
      <strong>Consultorio Psicológico Alexandra Pérez</strong>
      <p>Tu seguridad es nuestra prioridad</p>
      <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  </div>
</body>
</html>
    '''

    email = EmailMultiAlternatives(
        subject=asunto,
        body=mensaje_texto,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[correo]
    )
    email.attach_alternative(mensaje_html, "text/html")
    email.send(fail_silently=False)
