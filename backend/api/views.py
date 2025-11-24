from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, Brain!")

def about(request):
    return render(request, 'api/about.html')

def home(request):
    return render(request, 'api/home.html')