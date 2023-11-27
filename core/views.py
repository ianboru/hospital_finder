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

#https://learndjango.com/tutorials/django-signup-tutorial   
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

def index(request, path=None):
    hospital_quality_metrics = utils.load_hospital_data()
    mrsa_hospital_metrics = utils.load_mrsa_data()
    #sort dataframe based on query param
    search_string = request.GET.get("search")
    if search_string:
        #find hospitals matching string
        search_hit_indexes = hospital_quality_metrics["hospital"].str.contains(search_string, regex=True, flags=re.IGNORECASE)
        #trim dataframe to matching subset
        hospital_quality_metrics = hospital_quality_metrics[search_hit_indexes]
    else:
        search_string = ''
    gmaps = googlemaps.Client(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
    
    places_result = []
    if search_string:    
        places_result = gmaps.places(query=search_string)
        for result in places_result['results']:
            facility_filtered_result = mrsa_hospital_metrics[mrsa_hospital_metrics['Facility_Name'] == search_string]
            print('facility_filtered_result - ',facility_filtered_result)
            if not facility_filtered_result.empty: 
                hospital_name_matching_row = facility_filtered_result.iloc[0]
                print("hospital_name_matching_row", hospital_name_matching_row)
                result['SIR_2015'] = hospital_name_matching_row['SIR_2015']
                print("result after adding SIR_2015", result)
            
    #sort dataframe based on query param
    sort_string = request.GET.get("sort")
    if sort_string and "-" in sort_string:
        hospital_quality_metrics = hospital_quality_metrics.sort_values(by=[sort_string.replace("-","")], ascending=False)
    elif sort_string and  "-" not in sort_string:
        hospital_quality_metrics = hospital_quality_metrics.sort_values(by=[sort_string], ascending=True)
           
    #convert dataframe to json
    #data needs to be sent to front end as json 
    json_records = hospital_quality_metrics.reset_index().to_json(orient ='records')
    hospital_data = json.loads(json_records)

    #set href sort string for sorting in opposite direction
    #this needs to be sent to the front end for the sort state
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
    print('places_result before sending to front end', places_result)
    context = {
        'google_places_data' : places_result,
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

