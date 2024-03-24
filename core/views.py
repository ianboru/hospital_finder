import json
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views import generic
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.urls import reverse_lazy
from googlemaps import Client as GoogleMapsClient
import pandas as pd
import plotly.graph_objects as go
from core.models import Favorite
from core.utils import timeit, load_summary_metrics, load_provider_list, get_places, filter_place_results, update_place_results
pd.set_option('display.max_rows', None,)
from geopy import distance
from rapidfuzz import fuzz
import math
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

# Initialize the data for the app
gmaps = GoogleMapsClient(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
summary_metrics = load_summary_metrics()
provider_list = load_provider_list()

def find_providers_in_radius(search_location, radius, care_type, provider_list):
    search_location_tuple = (search_location[0], search_location[1])
    
    # provider_list = provider_list.merge(summary_metrics, left_on="Facility ID", right_on="Facility ID")
    provider_list = provider_list.merge(summary_metrics, left_on="Facility ID", right_on="Facility ID",
                 how='outer', suffixes=('', '_y'))

    provider_list.drop(provider_list.filter(regex='_y$').columns, axis=1, inplace=True)
    #provider_list.dropna(inplace=True)
    # print('provider_list.rows ', provider_list[""])
    
    print("search loca ", search_location, radius, care_type)
    filtered_provider_list = []
    if care_type and care_type != "All":
        provider_list = provider_list[provider_list["Facility Type"] == care_type]
    for index,row in provider_list.iterrows():
        provider_location_tuple = (row['latitude'],row['longitude'])
        if provider_location_tuple[0] == float('nan'):
            continue
        try:
            provider_distance = distance.distance(search_location_tuple, provider_location_tuple)
        except:
            continue
        if provider_distance.km < radius:
            cur_provider = {}
            row.fillna('',inplace=True)
            cols = row.index
            for col in cols:
                if row[col] == None:
                    row[col] = ""
                else:
                    cur_provider[col] = row[col]
                
            cur_provider["name"] = row["Facility Name"]
            cur_provider["location"] = {
                "latitude" : row['latitude'],
                "longitude" : row['longitude'],
            }
            filtered_provider_list.append(cur_provider)
    return filtered_provider_list

@timeit
def index(request, path=None):
    """ The main landing route for the app"""
    # Parse request params to get google query args
    search_string = request.GET.get("search")
    location_string = request.GET.get("location")
    radius = request.GET.get("radius") # in meters
    print("current location",location_string)
    care_type = request.GET.get("careType")
    print('careType backend', care_type)

    # Query google maps for places
    places_data = {}
    if not location_string or 'Na' in location_string:
        location_string = "32.7853263,-117.2407347"
    if not radius:
        radius = 100
    split_location_string = location_string.strip().split(",")
    # print('provider_list ', provider_list)
    search_match_threshold = 70
    filtered_providers = find_providers_in_radius(split_location_string, radius, care_type, provider_list)
    print(search_string)
    name_filtered_providers = []
    if search_string:
        # filter base on fuzzy match on facility name base on search string
        for provider in filtered_providers:
            if fuzz.partial_ratio(provider['Facility Name'].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
                
        filtered_providers = name_filtered_providers 
    #print(filtered_providers[1:10])
    filtered_providers = name_filtered_providers
    #update_place_results(valid_results, gmaps, summary_metrics) # Updates in place
    
    places_data['results'] = filtered_providers
    # Context for the front end
    context = {
        'google_places_data' : places_data,
        'metric_ranges' : {
            'max_hai' : 5,
            'min_hai' : 1,
            'max_hcahps' : 5,
            'min_hcahps' : 1
        }
    }
    return render(request, "index.html", context)


