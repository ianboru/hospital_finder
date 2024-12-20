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
from core.models.data_dictionary import DataDictionaryModel
from django.db.models.fields.json import KeyTextTransform
import math
from django.db.models import F
from django.template.loader import render_to_string
import numpy as np
from django.db.models import Q
from django.forms.models import model_to_dict
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

# Initialize the data for the app
gmaps = GoogleMapsClient(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
# Replace CSV loading with database queries below
#summary_metrics = load_summary_metrics() #delete
#provider_list = load_provider_list() #delete
def calculate_metric_quantiles(metric_name):
    from django_pandas.io import read_frame
    import numpy as np
    import math
    #return 3, 2
    print(metric_name)
    if metric_name == "hai":
        all_metric_objects = HAIMetrics.objects.all()
    else:
        print("got cahps")
        all_metric_objects = CAPHSMetrics.objects.all()

    upper_quantile_percent = .9
    lower_quantile_percent = .75
    all_metric_values = []
    for object in all_metric_objects:
        if metric_name == "hai" and object.hai_metric_json["Infection Rating"] != None:
            all_metric_values.append(object.hai_metric_json["Infection Rating"])
        elif metric_name == "caphs":
            #temporary fix because cahps data is string not json
            if object.caphs_metric_json:
                if type(object.caphs_metric_json) == list:
                    caphs_json = json.loads(object.caphs_metric_json[0])
                else:
                    caphs_json = json.loads(object.caphs_metric_json)
                if "Summary star rating" in caphs_json:
                    if type(caphs_json["Summary star rating"]) != str and not math.isnan(caphs_json["Summary star rating"]):
                        all_metric_values.append(caphs_json["Summary star rating"])
        else:
            continue
    if len(all_metric_values) > 0:
        top_quantile = np.quantile(all_metric_values,upper_quantile_percent)
        bottom_quantile = np.quantile(all_metric_values,lower_quantile_percent)
    else:
        top_quantile = 3.5
        bottom_quantile = 2
    print(top_quantile, bottom_quantile)

    return top_quantile, bottom_quantile

#comment out for first migration 
hai_top_quantile, hai_bottom_quantile = calculate_metric_quantiles('hai')
hcahps_top_quantile, hcahps_bottom_quantile = calculate_metric_quantiles('caphs')

def find_providers_in_radius(search_location, radius, care_type):
    search_location_tuple = (search_location[0], search_location[1])
    print("Search Location with care type: ", search_location, radius, care_type)
    filtered_provider_list = []
    nan_lat_long_count = 0
    if not care_type:
        care_type = ["Hospital"]

    if care_type == "ED":
        #currently these are not consistently loading in pipeline 
        #so we keep both till its fixed
        provider_list = Facility.objects.filter(Q(care_types__contains=["ED"])| Q(care_types__contains=["ED + Others"]))
    else:
        provider_list = Facility.objects.filter(care_types__contains = [care_type]).prefetch_related("address")

    print("iterating through hits")
    for facility in provider_list:
        address = facility.address
        if not address:
            print("no address", facility)
        provider_location_tuple = (address.latitude, address.longitude)
        facility.facility_name = facility.facility_name.replace("'","")

        # Check for NaN or None lat/lng and skip invalid entries
        if provider_location_tuple[0] is None or provider_location_tuple[1] is None or math.isnan(provider_location_tuple[0]) or math.isnan(provider_location_tuple[1]):
            nan_lat_long_count += 1
            continue
        try:
            provider_distance = distance.distance(search_location_tuple, provider_location_tuple)
        except:
            print(f"Error calculating distance for facility: {facility.facility_name}")
            continue

        if provider_distance.km < radius:
            hai_metrics = HAIMetrics.objects.filter(facility_id=facility.id)
            if len(hai_metrics) > 0:
                hai_metrics = hai_metrics[0].hai_metric_json if hai_metrics[0] else {}

            caphs_metrics  = CAPHSMetrics.objects.filter(facility=facility)        
            if len(caphs_metrics) > 0:
                caphs_metrics = json.loads(caphs_metrics[0].caphs_metric_json) if caphs_metrics[0] else {}
            care_types_str = ', '.join(facility.care_types)
        
            cur_provider = {
                "name": facility.facility_name,
                "caretype": care_types_str
            }
            if address:
                cur_provider["location"] ={
                    "latitude": getattr(address,'latitude', None),
                    "longitude":  getattr(address,'longitude', None)
                },
                cur_provider["address"] = f"{address.street}, {address.city}, {address.zip}",
            for key in hai_metrics:
                cur_provider[key] = hai_metrics[key]
                cur_value = cur_provider[key]

                if type(cur_value) == dict:
                    if "Compared to National" in cur_value:
                        cur_value = cur_value["Compared to National"]
                    else:
                        continue
                elif type(cur_value) != str and cur_value is not None and math.isnan(cur_value) :
                    cur_value = ""
                else:
                    continue
                cur_provider[key] = cur_value
            
            for key in caphs_metrics:
                cur_provider[key] = caphs_metrics[key]
                if type(cur_provider[key]) != str and cur_provider[key] is not None and math.isnan(cur_provider[key]):
                    cur_provider[key] = ''
            
            filtered_provider_list.append(cur_provider)
    print(f"Number of facilities with None/NaN latitude or longitude: {nan_lat_long_count}") #for absent long and lat values
    return filtered_provider_list, provider_list

#first part landing page
@timeit
def index(request, path=None):
    """ The main landing route for the app"""
    # Parse request params to get google query args
    search_string = request.GET.get("search")
    location_string = request.GET.get("location")
    radius = request.GET.get("radius") # in meters
    print("Current Location: ",location_string)
    care_type = request.GET.get("careType")
    print("CareType Backend: ", care_type)
    

    # Query google maps for places
    places_data = {}
    print("Location String :", location_string)
    if not location_string or 'Na' in location_string:
        location_string = "32.7853263,-117.2407347"
    if not radius:
        radius = 80
    split_location_string = location_string.strip().split(",")
    search_location = (float(split_location_string[0]), float(split_location_string[1]))
    print('Parsed Location: ', split_location_string)
    search_match_threshold = 70
    #replace the pandas dataframe here
    #provider_list = provider_list[provider_list["Facility Type"] == care_type] #facilities = facilities.filter(care_types__contains=[care_type])
    filtered_providers, provider_list = find_providers_in_radius(search_location, radius, care_type)
    print("Search String: ", search_string)

    print("HAI Metrics Quantiles")
    print(f"Top Quantile: {hai_top_quantile}")
    print(f"Bottom Quantile: {hai_bottom_quantile}")
        
    print("Summary Star Ratings Quantiles")
    print(f"Top Quantile: {hcahps_top_quantile}")
    print(f"Bottom Quantile: {hcahps_bottom_quantile}")
    
    name_filtered_providers = []
    if search_string:
        # filter base on fuzzy match on facility name base on search string
        for provider in filtered_providers:
            if fuzz.partial_ratio(provider['name'].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
                
            if fuzz.partial_ratio(provider['address'][0].lower(), search_string) > search_match_threshold:
                name_filtered_providers.append(provider)
        filtered_providers = name_filtered_providers 
    
    places_data = filtered_providers
    #print("final filtered providers", places_data)
    # Context for the front end
    data_dictionary_terms = DataDictionaryModel.objects.all()
    data_dictionary_lookup = {}
    for term in data_dictionary_terms:
        data_dictionary_lookup[term.cms_term.lower()] = model_to_dict(term) 

    context = {
        'google_places_data' : places_data,
        "data_dictionary" : data_dictionary_lookup,
        'metric_quantiles' : {
            'hai_top_quantile' : hai_top_quantile,
            'hai_bottom_quantile' : hai_bottom_quantile,
            'hcahps_top_quantile' : hcahps_top_quantile,
            'hcahps_bottom_quantile' : hcahps_bottom_quantile
        }
    }
    
    return render(request, "index.html", context)