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
from number_parser import parse_ordinal

import pandas as pd
pd.set_option('display.max_rows', None,)

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

def standardize_cms_name(cms_name_df):
    cms_name_df = cms_name_df.str.lower()
    cms_name_df = cms_name_df.str.replace('-', " ")
    cms_name_df = cms_name_df.str.replace('/', " ")
    return cms_name_df

def index(request, path=None):
    hai_summary_metrics = utils.load_summary_metric('hai')
    hai_summary_metrics["Address"] = hai_summary_metrics["Address"].str.lower()
    hai_summary_metrics["Facility Name"] = standardize_cms_name(hai_summary_metrics["Facility Name"])
    hcahps_summary_metrics = utils.load_summary_metric('hcahps')
    hcahps_summary_metrics["Facility Name"] = standardize_cms_name(hcahps_summary_metrics["Facility Name"])
    hcahps_summary_metrics["Address"] = hcahps_summary_metrics["Address"].str.lower()
    search_string = request.GET.get("search")
    
    gmaps = googlemaps.Client(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
    places_results = []
    if search_string:    
        places_results = gmaps.places(query=search_string)
        for place_result in places_results['results']:
            place_detail = gmaps.place(place_id=place_result["reference"])
            place_detail = place_detail["result"]
            if "formatted_phone_number" in place_detail:
                place_result["phone_number"] = place_detail["formatted_phone_number"]
            place_result = add_metric_to_place_result('hai', hai_summary_metrics, place_result)
            place_result = add_metric_to_place_result('hcahps', hcahps_summary_metrics, place_result)
    context = {
        'google_places_data' : places_results,
        'metric_ranges' : {
            'max_hai' : float(hai_summary_metrics["relative mean"].max()),
            'min_hai' :float(hai_summary_metrics["relative mean"].min()),
            'max_hcahps' : float(hcahps_summary_metrics["relative mean"].max()),
            'min_hcahps' : float(hcahps_summary_metrics["relative mean"].min())
        }
    }
    print(context['metric_ranges'])
    return render(request, "index.html", context)

def add_metric_to_place_result(metric_name, metric_df, place_result):
    
    facility_filtered_result = metric_df[metric_df['Facility Name'].str.contains(place_result['name'],case=False)]
    facility_filtered_result = facility_filtered_result[facility_filtered_result['relative mean'].notna()]
    if not facility_filtered_result.empty: 
        print("name match")
        facility_filtered_result = facility_filtered_result.iloc[0]
        if metric_name == "hai":
            #this is continuous value 
            place_result[f'{metric_name} relative mean'] = round(facility_filtered_result['relative mean'],1)
        else:
            #this is star value as int
            place_result[f'{metric_name} relative mean'] = int(facility_filtered_result['relative mean'])
    else:
        #now try to match by address
        cms_partial_address_match = find_address_match(metric_df, place_result["formatted_address"])
        
        if not cms_partial_address_match.empty:
            print("CMS address match")
            if metric_name == "hai":
                place_result[f'{metric_name} relative mean'] = round(cms_partial_address_match['relative mean'],1)
            else:
                place_result[f'{metric_name} relative mean'] = int(cms_partial_address_match['relative mean'])
        else:
            place_result[f'{metric_name} relative mean'] = ""
    return place_result


def find_address_match(cms_metric_df, place_address): 
    place_address = place_address.lower()
    place_address = place_address.replace("-", " ")
    place_address = place_address.replace("/", " ")
    place_address = expand_address_abbreviations(place_address)
    print("address",place_address)
    for index, row in cms_metric_df.iterrows():
        print(row["Address"])
        if row["Address"] in place_address: 
            return row
    #return empty df if no hits
    return pd.DataFrame()

def expand_address_abbreviations(place_address):
    place_address = place_address.replace(' ave', ' avenue')
    place_address = place_address.replace(' rd', ' road')
    place_address = place_address.replace(' st', ' street')
    place_address = place_address.replace(' dr', ' drive')
    place_address = place_address.replace(' ct', ' court')
    place_address = place_address.replace(' e ', ' east')
    place_address = place_address.replace(' w ', ' west')
    place_address = place_address.replace(' n ', ' north')
    place_address = place_address.replace(' s ', ' south')

    split_address = place_address.split(" ")
    final_address = []
    for word in split_address:
        n = parse_ordinal(word)
        if n and not word.isnumeric():
            word = ordinal(n)
        final_address.append(word)
        
    place_address = " ".join(final_address)
    return place_address
    
def ordinal(n: int):
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    else:
        suffix = ['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]
    return str(n) + suffix

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

