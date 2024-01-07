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
import pandas as pd

from core.models import (
    Favorite,
)
import googlemaps
from datetime import datetime
import pprint
#https://learndjango.com/tutorials/django-signup-tutorial   
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

def index(request, path=None):
    hai_summary_metrics = utils.load_summary_metric('hai')
    hcahps_summary_metrics = utils.load_summary_metric('hcahps')
    
    #sort dataframe based on query param
    search_string = request.GET.get("search")
    
    gmaps = googlemaps.Client(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
    
    places_results = []
    if search_string:    
        places_results = gmaps.places(query=search_string)
        for place_result in places_results['results']:
            place_detail = gmaps.place(place_id=place_result["reference"])
            pprint.pprint(place_detail["result"].keys())
            place_detail = place_detail["result"]
            if "formatted_phone_number" in place_detail:
                place_result["phone_number"] = place_detail["formatted_phone_number"]
                
            place_result = add_metric_to_place_result('hai', hai_summary_metrics, place_result)
            place_result = add_metric_to_place_result('hcahps', hcahps_summary_metrics, place_result)
            
    context = {
        'google_places_data' : places_results,
    }
    return render(request, "index.html", context)

def add_metric_to_place_result(metric_name, metric_df, place_result):
    facility_filtered_result = metric_df[metric_df['Facility Name'] == place_result['name']]
    facility_filtered_result = facility_filtered_result[facility_filtered_result['relative mean'].notna()]
    if not facility_filtered_result.empty: 
        facility_filtered_result = facility_filtered_result.iloc[0]
        place_result[f'{metric_name} relative mean'] = facility_filtered_result['relative mean']
    else:
        place_result[f'{metric_name} relative mean'] = ""
    return place_result

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

