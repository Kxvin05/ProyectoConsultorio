from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import random
import string
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from .models import Usuario, RecuperacionPassword
from .serializers import UsuarioSerializer
from .utils import enviar_codigo_verificacion


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            usuario = Usuario.objects.create_user(
                **serializer.validated_data,
                rol='paciente'
            )
            from pacientes.models import Paciente
            Paciente.objects.create(
                usuario=usuario,
                nombres=request.data.get('nombre', ''),
                apellidos=request.data.get('apellidos', ''),
                documento=request.data.get('documento', ''),
                telefono=request.data.get('telefono', '')
            )
            return Response({"ok": "Usuario registrado"}, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"detail": "Credenciales inválidas"}, status=401)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.id,
            'username': user.username,
            'rol': user.rol
        })

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mi_perfil(self, request):
        usuario = request.user
        serializer = self.get_serializer(usuario)
        data = dict(serializer.data)

        from pacientes.models import Paciente
        from psicologos.models import Psicologo

        paciente = Paciente.objects.filter(usuario=usuario).first()
        psicologo = Psicologo.objects.filter(usuario=usuario).first()

        if paciente:
            data['nombres'] = paciente.nombres
            data['apellidos'] = paciente.apellidos
        elif psicologo:
            data['nombres'] = psicologo.nombres
            data['apellidos'] = psicologo.apellidos
        else:
            data['nombres'] = usuario.first_name
            data['apellidos'] = usuario.last_name

        return Response(data)

    @action(detail=False, methods=["post"], url_path="cambiar-contrasena", permission_classes=[IsAuthenticated])  # ← fix
    def cambiar_contraseña(self, request):
        usuario = request.user
        contraseña_actual = request.data.get('contraseña_actual')
        contraseña_nueva = request.data.get('contraseña_nueva')
        if not usuario.check_password(contraseña_actual):
            return Response({"error": "Contraseña actual incorrecta"}, status=400)
        usuario.set_password(contraseña_nueva)
        usuario.save()
        return Response({"ok": "Contraseña cambiada"})

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def recuperar_password(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email es requerido"}, status=400)
        try:
            usuario = Usuario.objects.get(email=email)
            codigo = ''.join(random.choices(string.digits, k=6))
            RecuperacionPassword.objects.filter(usuario=usuario).delete()
            RecuperacionPassword.objects.create(usuario=usuario, codigo=codigo)
            try:
                enviar_codigo_verificacion(email, codigo)
            except Exception as e:
                print(f"Error enviando email: {e}")
            return Response({"ok": "Código enviado"})
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def verificar_codigo(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        if not email or not codigo:
            return Response({"error": "Email y código requeridos"}, status=400)
        try:
            usuario = Usuario.objects.get(email=email)
            recuperacion = RecuperacionPassword.objects.filter(usuario=usuario, usado=False).last()
            if not recuperacion:
                return Response({"error": "No hay código activo para este usuario"}, status=400)
            if recuperacion.codigo != codigo:
                return Response({"error": "Código incorrecto"}, status=400)
            if recuperacion.codigo_expirado():
                return Response({"error": "Código expirado"}, status=400)
            return Response({"ok": "Código verificado correctamente"})
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def restablecer_password(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        contraseña_nueva = request.data.get('password_nueva')
        if not all([email, codigo, contraseña_nueva]):
            return Response({"error": "Email, código y contraseña requeridos"}, status=400)
        try:
            usuario = Usuario.objects.get(email=email)
            recuperacion = RecuperacionPassword.objects.filter(usuario=usuario, usado=False).last()
            if not recuperacion:
                return Response({"error": "No hay código activo"}, status=400)
            if recuperacion.codigo != codigo:
                return Response({"error": "Código incorrecto"}, status=400)
            if recuperacion.codigo_expirado():
                return Response({"error": "Código expirado"}, status=400)
            usuario.set_password(contraseña_nueva)
            usuario.save(update_fields=['password'])
            recuperacion.usado = True
            recuperacion.save(update_fields=['usado'])
            return Response({"ok": "Contraseña restablecida correctamente"})
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def crear_psicologo(self, request):
        user = request.user
        if user.rol != 'recepcion' and not user.is_staff:
            return Response({"error": "Solo recepcionistas pueden crear psicólogos"}, status=403)
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        nombres = request.data.get('nombres', '')
        apellidos = request.data.get('apellidos', '')
        especialidad = request.data.get('especialidad', '')
        documento = request.data.get('documento', '')
        telefono = request.data.get('telefono', '')
        if not all([username, email, password]):
            return Response({"error": "Username, email y password son requeridos"}, status=400)
        if Usuario.objects.filter(username=username).exists():
            return Response({"error": "Este usuario ya existe"}, status=400)
        try:
            usuario = Usuario.objects.create_user(
                username=username,
                email=email,
                password=password,
                rol='psicologo',
                telefono=telefono,
            )
            from psicologos.models import Psicologo
            Psicologo.objects.create(
                usuario=usuario,
                nombres=nombres,
                apellidos=apellidos,
                especialidad=especialidad,
                documento=documento,
                email=email,
                telefono=telefono,
            )
            return Response({"ok": "Psicólogo creado correctamente"}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def registro_paciente(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        nombres = request.data.get('nombres', '')
        apellidos = request.data.get('apellidos', '')
        tipo_documento = request.data.get('tipo_documento', '')
        documento = request.data.get('documento', '')
        telefono = request.data.get('telefono', '')

        if not all([username, email, password]):
            return Response({"error": "Username, email y password son requeridos"}, status=400)
        if Usuario.objects.filter(username=username).exists():
            return Response({"username": ["Este usuario ya existe"]}, status=400)
        if Usuario.objects.filter(email=email).exists():
            return Response({"email": ["Este email ya está registrado"]}, status=400)

        try:
            usuario = Usuario.objects.create_user(
                username=username,
                email=email,
                password=password,
                rol='paciente',
                telefono=telefono,
            )

            from pacientes.models import Paciente
            Paciente.objects.create(
                usuario=usuario,
                nombres=nombres,
                apellidos=apellidos,
                tipo_documento=tipo_documento,
                documento=documento,
                telefono=telefono,
                email=email,
            )

            try:
                print(f"Intentando enviar email de bienvenida a: {email}")
                mensaje_html = f'''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{{margin:0;padding:0;background:#f0f4ff;font-family:Arial,sans-serif;}}
  .wrapper{{max-width:600px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15);}}
  .header{{background:linear-gradient(135deg,#667eea,#764ba2);padding:50px 40px;text-align:center;}}
  .header h1{{color:white;margin:0;font-size:26px;font-weight:700;}}
  .header p{{color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;}}
  .body{{padding:40px;}}
  .greeting{{font-size:20px;font-weight:700;color:#2d3748;margin-bottom:15px;}}
  .subtitle{{color:#718096;font-size:15px;margin-bottom:25px;line-height:1.6;}}
  .badge{{display:inline-block;background:linear-gradient(135deg,#48bb78,#38a169);color:white;padding:6px 16px;border-radius:50px;font-size:12px;font-weight:700;margin-bottom:20px;}}
  .card{{background:#f7f0ff;border:2px solid #c4b5fd;border-radius:16px;padding:20px;margin:20px 0;}}
  .card-title{{font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}}
  .item{{margin:8px 0;color:#374151;font-size:14px;}}
  .item span{{font-weight:700;color:#7c3aed;}}
  .tips{{background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:15px 20px;margin:20px 0;}}
  .tip{{color:#92400e;font-size:13px;margin:6px 0;}}
  .divider{{height:5px;background:linear-gradient(90deg,#667eea,#764ba2,#f093fb);}}
  .footer{{background:linear-gradient(135deg,#1e1b4b,#312e81);padding:25px 40px;text-align:center;}}
  .footer strong{{color:white;font-size:14px;display:block;margin-bottom:5px;}}
  .footer p{{color:rgba(255,255,255,0.6);font-size:12px;margin:4px 0;}}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div style="font-size:50px;margin-bottom:15px">🧠</div>
    <h1>Bienvenido al Consultorio</h1>
    <p>Alexandra Perez - Psicologa Clinica</p>
  </div>
  <div class="divider"></div>
  <div class="body">
    <span class="badge">Cuenta creada exitosamente</span>
    <div class="greeting">Hola, {nombres} {apellidos}!</div>
    <p class="subtitle">Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesion y agendar tus citas con nuestros profesionales.</p>
    <div class="card">
      <div class="card-title">Tus datos de acceso</div>
      <div class="item">Usuario: <span>{username}</span></div>
      <div class="item">Email: <span>{email}</span></div>
      <div class="item">Rol: <span>Paciente</span></div>
    </div>
    <div class="tips">
      <div class="tip">Inicia sesion con tu usuario y contrasena</div>
      <div class="tip">Agenda citas con nuestros psicologos disponibles</div>
      <div class="tip">Tu privacidad y confidencialidad estan garantizadas</div>
    </div>
    <p style="color:#718096;font-size:13px">Si no creaste esta cuenta, por favor ignora este mensaje.</p>
  </div>
  <div class="footer">
    <strong>Consultorio Psicologico Alexandra Perez</strong>
    <p>Tu bienestar mental es nuestra prioridad</p>
  </div>
</div>
</body>
</html>'''
                email_msg = EmailMultiAlternatives(
                    subject='Bienvenido al Consultorio Alexandra Perez - Cuenta creada exitosamente',
                    body=f'Hola {nombres} {apellidos}, tu cuenta ha sido creada exitosamente. Usuario: {username}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email]
                )
                email_msg.attach_alternative(mensaje_html, "text/html")
                email_msg.send(fail_silently=False)
                print(f"Email de bienvenida enviado exitosamente a: {email}")
            except Exception as e:
                print(f"Error enviando email de bienvenida: {e}")

            return Response({"ok": "Usuario registrado correctamente"}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)