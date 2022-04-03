from http.client import HTTPResponse
from django.shortcuts import render
import json
import re
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import plotly.graph_objects as go
import plotly
from . import utils
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views import generic
from django.contrib.auth.models import User

from core.models import (
    Favorite,
)

#https://learndjango.com/tutorials/django-signup-tutorial   
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

def index(request, path=None):
    unplanned_visits = utils.load_hospital_data()
    #sort dataframe based on query param
    search_string = request.GET.get("search")
    if search_string:
        unplanned_visits = unplanned_visits[
            unplanned_visits["hospital"].str.contains(search_string, regex=True, flags=re.IGNORECASE)
        ]
    #sort dataframe based on query param
    sort_string = request.GET.get("sort")
    if sort_string and "-" in sort_string:
        unplanned_visits = unplanned_visits.sort_values(by=[sort_string.replace("-","")], ascending=False)
    elif sort_string and  "-" not in sort_string:
        unplanned_visits = unplanned_visits.sort_values(by=[sort_string], ascending=True)
           
    #convert dataframe to json
    json_records = unplanned_visits.reset_index().to_json(orient ='records')
    hospital_data = json.loads(json_records)

    #set href sort string for sorting in opposite direction
    if sort_string and "-" in sort_string:
        sort_string = sort_string.replace("-","")
    elif sort_string and  "-" not in sort_string:
        sort_string = f"-{sort_string}"
    else:
        sort_string = ""

    if request.user.is_authenticated:
        favorites = Favorite.objects.filter(user=request.user).values_list('hospital',flat=True)
    else:
        favorites = []
    print(favorites)
    context = {
        'hospital_data': hospital_data,
        'sort_string' : sort_string,
        'favorites' : favorites
    }
    return render(request, "index.html", context)


def graph(request, path=None):
    hospital_data = utils.load_hospital_data()
    ## columns for reference  "hospital","mort_30_ami","mort_30_copd"
    '''
        
    '''
    layout = go.Layout(
        paper_bgcolor='rgba(255,255,255,1)',
        plot_bgcolor='rgba(255,255,255,1)'
    )
    fig = go.Figure(
        data=[  
            go.Bar(
                name="mort_30_copd",
                x=hospital_data["hospital"],
                y=hospital_data["mort_30_copd"],
                marker = dict(color = "green")
            ),
            go.Bar(
                name="mort_30_ami",
                x=hospital_data["hospital"],
                y=hospital_data["mort_30_ami"],
                marker = dict(color = "red")
            )
        ],
        layout_title_text="Hospital Quality Metrics",
        layout=layout
    )

    
    graph_div = fig.to_html()
    context = {
        "graph_div": graph_div
    }
    print(graph_div)
    return render(request, "graph.html",context)

from django.views.decorators.csrf import csrf_exempt


@require_POST
@csrf_exempt
def favorite(request):
    request_data = json.loads(request.body)
    hospital_name = request_data.get("hospital_name")
    print(request_data)
    print("hospital",hospital_name)
    user_id = request_data.get("user_id")
    print(user_id)  
    user_id = int(user_id)
    user = User.objects.get(id=user_id)
    favorite_instance, created = Favorite.objects.get_or_create(user=user, hospital=hospital_name)
    if not created:
        favorite_instance.delete()
    return JsonResponse({"success": True})

