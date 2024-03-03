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
from core.utils import timeit, load_summary_metrics, load_provider_list, get_places, filter_place_results, update_place_results, add_metric_to_provider
pd.set_option('display.max_rows', None,)
from geopy import distance
#https://learndjango.com/tutorials/django-signup-tutorial
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
    provider_list.dropna(inplace=True)
    # print('provider_list.rows ', provider_list[""])
    
    print("search loca ", search_location, radius, care_type)
    filtered_provider_list = []
    if care_type and care_type != "All":
        provider_list = provider_list[provider_list["Facility Type"] == care_type]
    for index,row in provider_list.iterrows():
        provider_location_tuple = (row['latitude'],row['longitude'])
        print('provider row ', row)
        provider_distance = distance.distance(search_location_tuple, provider_location_tuple)
        if provider_distance.km < radius:
             for col in row.index:
                filtered_provider_list = {
                    
                }
                print('col ', col)
                provider_list[col] = summary_metrics[col] 
            # filtered_provider_list.append({
            #     "location" : {
            #         "latitude" : row['latitude'],
            #         "longitude" : row['longitude'],
            #     },
            #     "address" : row['Address'],
            #     "name" : row['Facility Name']
            # })
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
    filtered_providers = find_providers_in_radius(split_location_string, radius, care_type, provider_list)
    # print('filtered_providers, ', filtered_providers)
    #update_place_results(valid_results, gmaps, summary_metrics) # Updates in place
    filtered_providers = add_metric_to_provider(provider_list, summary_metrics)
    
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


