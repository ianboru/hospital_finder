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
# from core.models.favorite import Favorite
from core.utils import timeit, load_summary_metrics, load_provider_list, get_places, filter_place_results, update_place_results
pd.set_option('display.max_rows', None,)
from geopy import distance
from rapidfuzz import fuzz
import math
import pprint
pd.set_option('display.max_columns', None)
from core.models.facility import Facility, Address
from core.models.facility_data import HAIMetrics, CAPHSMetrics
from django.db.models.fields.json import KeyTextTransform

class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

# Initialize the data for the app
gmaps = GoogleMapsClient(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
# Replace CSV loading with database queries below
summary_metrics = load_summary_metrics() #delete
provider_list = load_provider_list() #delete
#facilities = Facility.objects.all()
#hai_metrics = HAIMetrics.objects.all()
#caphs_metrics = CAPHSMetrics.objects.all()

def find_providers_in_radius(search_location, radius, care_type):
    search_location_tuple = (search_location[0], search_location[1])
    print("search loca ", search_location, radius, care_type)
    filtered_provider_list = []
    nan_lat_long_count = 0

    if care_type and care_type != "All":
        provider_list = Facility.objects.filter(care_types__contains=[care_type])
        print("post filter", care_type)
    else:
        provider_list = Facility.objects.all()
    print(provider_list)

    for facility in provider_list:
        address = facility.address 
        #print(f"Facility: {facility.facility_name}, Latitude: {address.latitude}, Longitude: {address.longitude}")
        provider_location_tuple = (address.latitude, address.longitude) 
        if provider_location_tuple[0] is None or provider_location_tuple[1] is None:
            # If lat or lon is None, skip this facility
            nan_lat_long_count += 1
            continue
        if math.isnan(provider_location_tuple[0]):
            continue
        try:
            provider_distance = distance.distance(search_location_tuple, provider_location_tuple)
        except:
            continue
        if provider_distance.km < radius:
            cur_provider = {
                "name": facility.facility_name, 
                "location": {
                    "latitude": address.latitude, 
                    "longitude": address.longitude,
                },
                "address": f"{address.street}, {address.city}, {address.zip}" 
            }

            filtered_provider_list.append(cur_provider)
    print(f"Number of facilities with None/NaN latitude or longitude: {nan_lat_long_count}")
    return filtered_provider_list, provider_list

#first part landing page
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
    print("location string", location_string)
    if not location_string or 'Na' in location_string:
        location_string = "32.7853263,-117.2407347"
    if not radius:
        radius = 80
    split_location_string = location_string.strip().split(",")
    search_location = (float(split_location_string[0]), float(split_location_string[1]))
    print('parsed location', split_location_string)
    search_match_threshold = 70
#replace the pandas dataframe here
#provider_list = provider_list[provider_list["Facility Type"] == care_type] #facilities = facilities.filter(care_types__contains=[care_type])
    filtered_providers = find_providers_in_radius(search_location, radius, care_type)
    print("search string", search_string)
#replace pandas quantile calculations here
    upper_quantile = .9
    lower_quantile = .5
#replace pandas infection quantile calulations here
    all_hai_metrics = HAIMetrics.objects.all()
    all_infection_ratings = [metric.hai_metric_json.get('Infection Rating') for metric in all_hai_metrics if metric.hai_metric_json.get('Infection Rating') is not None]
    if all_infection_ratings:
        sorted_ratings = sorted(all_infection_ratings)
        hai_top_quantile = sorted_ratings[int(upper_quantile * len(sorted_ratings)) - 1]
        hai_bottom_quantile = sorted_ratings[int(lower_quantile * len(sorted_ratings)) - 1]
    else:
        hai_top_quantile = hai_bottom_quantile = None

    print("HAI Metrics Quantiles")
    print(f"Top Quantile: {hai_top_quantile}")
    print(f"Bottom Quantile: {hai_bottom_quantile}")
        
#replace pandas operations to calculate quantiles for summary star rating, filter not avaialble, and convert to integers
    all_summary_star_ratings = CAPHSMetrics.objects.annotate(
        summary_star_rating=KeyTextTransform('Summary star rating', 'caphs_metric_json')
    ).values_list('summary_star_rating', flat=True)
    
    all_summary_star_ratings = [int(rating) for rating in all_summary_star_ratings if rating and rating.isdigit()]
    
    if all_summary_star_ratings:
        sorted_summary_ratings = sorted(all_summary_star_ratings)
        hcahps_top_quantile = sorted_summary_ratings[int(upper_quantile * len(sorted_summary_ratings)) - 1]
        hcahps_bottom_quantile = sorted_summary_ratings[int(lower_quantile * len(sorted_summary_ratings)) - 1]
    else:
        hcahps_top_quantile = hcahps_bottom_quantile = None

    print("Summary Star Ratings Quantiles")
    print(f"Top Quantile: {hcahps_top_quantile}")
    print(f"Bottom Quantile: {hcahps_bottom_quantile}")
    
    name_filtered_providers = []
    if search_string:
        # filter base on fuzzy match on facility name base on search string
        for provider in filtered_providers:
            if fuzz.partial_ratio(provider['Facility Name'].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
                
            if fuzz.partial_ratio(provider['Address'].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
        filtered_providers = name_filtered_providers 
    print("NAMEFILTEREDPROVIDERS")
    print(name_filtered_providers)
    
    places_data['results'] = filtered_providers
    # Context for the front end
    context = {
        'google_places_data' : places_data,
        'metric_quantiles' : {
            'hai_top_quantile' : hai_top_quantile,
            'hai_bottom_quantile' : hai_bottom_quantile,
            'hcahps_top_quantile' : hcahps_top_quantile,
            'hcahps_bottom_quantile' : hcahps_bottom_quantile
        }
    }
    print("context", context["metric_quantiles"])
    print(filtered_providers)
    return render(request, "index.html", context)