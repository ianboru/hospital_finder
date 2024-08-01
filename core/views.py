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
from core.models.facility import Facility
#add from core.models.facility_data import HAIMetrics, CAPHSMetrics

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

    if care_type and care_type != "All":
        provider_list = Facility.objects.filter(care_types__contains=[care_type])
        print("post filter", care_type)
    else:
        provider_list = Facility.objects.all()
    print(provider_list)

    for index,row in provider_list.iterrows(): #for facility in facilities:
        provider_location_tuple = (row['latitude'],row['longitude']) # = (facility.latitude, facility.longitude)
        if provider_location_tuple[0] == float('nan'):
            continue
        try:
            provider_distance = distance.distance(search_location_tuple, provider_location_tuple)
        except:
            continue
        if provider_distance.km < radius:
            cur_provider = {} #put content for provider name, adress, and location containing latitude and longitude
            row.fillna('',inplace=True) #delete
            cols = row.index #delete
            for col in cols: #delete
                if row[col] == None: #delete
                    row[col] = "" #delete
                else: #delete
                    cur_provider[col] = row[col] #delete
                
            cur_provider["name"] = row["Facility Name"] #delete
            cur_provider["location"] = { #delete
                "latitude" : row['latitude'], #delete
                "longitude" : row['longitude'], #delete
            }
            cur_provider["address"] = row["Address"] #delete

            #attach hai and caphs metrics

            filtered_provider_list.append(cur_provider)
    
    return filtered_provider_list, total_provider_list

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
    print('parsed location', split_location_string)
    search_match_threshold = 70
#replace the pandas dataframe here
#provider_list = provider_list[provider_list["Facility Type"] == care_type] #facilities = facilities.filter(care_types__contains=[care_type])
    filtered_providers, providers_with_metrics_df = find_providers_in_radius(split_location_string, radius, care_type)
    print("search string", search_string)
#replace pandas quantile calculations here
    upper_quantile = .9
    lower_quantile = .5
#replace pandas infection quantile calulations here
    hai_top_quantile = providers_with_metrics_df["Infection Rating"].quantile(upper_quantile)
    hai_bottom_quantile = providers_with_metrics_df["Infection Rating"].quantile(lower_quantile)
#replace pandas operations to calculate quantiles for summary star rating, filter not avaialble, and convert to integers
    summary_star_for_quantile = providers_with_metrics_df["Summary star rating"][providers_with_metrics_df["Summary star rating"].notna()]
    quantile_rows = providers_with_metrics_df[providers_with_metrics_df["Summary star rating"].notna()][1:10]
    print(quantile_rows[["Facility Name", "Facility Type", "Summary star rating"]]) #delete
    print("unique 1",summary_star_for_quantile.unique()) #delete
    summary_star_for_quantile = summary_star_for_quantile[summary_star_for_quantile != "Not Available"]
    summary_star_for_quantile = summary_star_for_quantile.astype(int)
    print("unique",summary_star_for_quantile.unique()) #delete
#calculate upper and lower quantiles for summary star using pandas (Series)
    hcahps_top_quantile = summary_star_for_quantile.quantile(upper_quantile)
    hcahps_bottom_quantile = summary_star_for_quantile.quantile(lower_quantile)
    
    name_filtered_providers = []
    if search_string:
        # filter base on fuzzy match on facility name base on search string
        for provider in filtered_providers:
            if fuzz.partial_ratio(provider['Facility Name'].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
                
            if fuzz.partial_ratio(provider['Address'].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
        filtered_providers = name_filtered_providers 

    places_data['results'] = filtered_providers
    # Context for the front end
    context = {
        'google_places_data' : places_data,
        #replace the quantile values with those computed using ORM 
        'metric_quantiles' : {
            'hai_top_quantile' : hai_top_quantile,
            'hai_bottom_quantile' : hai_bottom_quantile,
            'hcahps_top_quantile' : hcahps_top_quantile,
            'hcahps_bottom_quantile' : hcahps_bottom_quantile

        }
    }
    print("context", context["metric_quantiles"])
    return render(request, "index.html", context)