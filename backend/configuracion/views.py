from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "api": "Sistema Clínico",
        "status": "ok"
    })
