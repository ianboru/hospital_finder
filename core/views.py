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
def calculate_HAI_metric_quantiles():
    all_metric_objects = HAIMetrics.objects.all()
    upper_quantile_percent = .9
    lower_quantile_percent = .75
    all_metric_values = []
    for object in all_metric_objects:
        if object.hai_metric_json["Infection Rating"] != None:
            all_metric_values.append(object.hai_metric_json["Infection Rating"])
        else:
            continue
    if len(all_metric_values) > 0:
        top_quantile = np.quantile(all_metric_values,upper_quantile_percent)
        bottom_quantile = np.quantile(all_metric_values,lower_quantile_percent)
    else:
        #if db not initialized with data?
        top_quantile = 3.5
        bottom_quantile = 2
    print(top_quantile, bottom_quantile)

    return top_quantile, bottom_quantile

def calculate_CAHPS_metric_quantiles(data_dictionary):
    from django_pandas.io import read_frame
    import numpy as np
    import math

    print("got cahps")
    all_metric_objects = CAPHSMetrics.objects.all()

    upper_quantile_percent = .9
    lower_quantile_percent = .3
    all_metric_values = {}
    all_metric_quantiles = {}
    rejected_keys = []
    for object in all_metric_objects:
        
        #temporary fix because cahps data is string not json
        if object.caphs_metric_json:
            if type(object.caphs_metric_json) == list:
                caphs_json = json.loads(object.caphs_metric_json[0])
            else:
                caphs_json = json.loads(object.caphs_metric_json)

            for key, value in caphs_json.items():
                #print("cahps keys", key)
                lower_key = key.lower()
                #if lower_key in data_dictionary:
                    #print(lower_key, data_dictionary[lower_key]['unit'])
                if "minutes" not in key:
                    if value is not None and type(value) != str and not math.isnan(value):
                        if key not in all_metric_values:
                            print("constructing", key)
                            all_metric_values[key] = []
                        else:
                            all_metric_values[key].append(value)
                else:
                    if key not in rejected_keys:
                        rejected_keys.append(key)
    print("rejected", rejected_keys)
    for key, value in all_metric_values.items():
        print(key, len(value))
        if len(all_metric_values) > 0:
            top_quantile = np.quantile(value,upper_quantile_percent)
            bottom_quantile = np.quantile(value,lower_quantile_percent)
        else:
            top_quantile = 3.5
            bottom_quantile = 2
        all_metric_quantiles[key] = {
            "top_quantile" : top_quantile,
            "bottom_quantile" : bottom_quantile
        }
        print(top_quantile, bottom_quantile)
    return all_metric_quantiles

#comment out for first migration 
data_dictionary_terms = DataDictionaryModel.objects.all()
data_dictionary_lookup = {}
print("initial dictionary")
for term in data_dictionary_terms:
    data_dictionary_lookup[term.cms_term.lower()] = model_to_dict(term) 

hai_top_quantile, hai_bottom_quantile = calculate_HAI_metric_quantiles()
metric_quantiles = calculate_CAHPS_metric_quantiles(data_dictionary_lookup)
metric_quantiles["hai"] = {"top_quantile" : hai_top_quantile, "bottom_quantile" : hai_bottom_quantile }
print("HAI METRICS", metric_quantiles)
def sanitize_json_list(json_list):
    if type(json_list) == list:
        #fix exceptions from old data load
        json_list = str(json_list)
        json_list = json_list.replace("['","") 
        json_list = json_list.replace("\\","") 
        json_list = json_list.caphs_metric_json.replace("']","") 
    return json.loads(json_list) if json_list else {}

def add_metrics_to_providers(filtered_provider_json):
    providers_with_metrics = []
    print("adding metrics")
    for cur_provider in filtered_provider_json:
        hai_metrics = HAIMetrics.objects.filter(facility_id=cur_provider['id'])
        if len(hai_metrics) > 0:
            hai_metrics = hai_metrics[0].hai_metric_json if hai_metrics[0] else {}

        caphs_metrics  = CAPHSMetrics.objects.filter(facility=cur_provider['id'])   
             
        if len(caphs_metrics) > 0:
            try:
                # Handle both list and string formats for backward compatibility
                caphs_data = caphs_metrics[0].caphs_metric_json
                if isinstance(caphs_data, list):
                    # Old format: list with JSON string
                    cur_cahps_metrics_json = json.loads(caphs_data[0])
                elif isinstance(caphs_data, str):
                    # New format: JSON string
                    cur_cahps_metrics_json = json.loads(caphs_data)
                else:
                    # Already a dict
                    cur_cahps_metrics_json = caphs_data
            except Exception as e:
                print(e)
                print("error parsing metrics:", json.dumps(list(caphs_metrics.values()), default=str))
                print(f"Skipping facility {cur_provider.get('name', 'unknown')} due to malformed CAPHS metrics")
                continue

            if len(caphs_metrics) == 2:
                
                second_cahps_metrics_json = sanitize_json_list(caphs_metrics[1].caphs_metric_json)
        
                #for duplicates (until i clean up)
                if len(cur_cahps_metrics_json.keys()) < len(second_cahps_metrics_json.keys()):
                    cur_cahps_metrics_json = second_cahps_metrics_json
                if "merid" in cur_provider["name"].lower():
                    print("found a second", caphs_metrics.values())
                    print(len(cur_cahps_metrics_json.keys()), len(second_cahps_metrics_json.keys()))
                    print(cur_cahps_metrics_json)
            for key in cur_cahps_metrics_json:
                cur_provider[key] = cur_cahps_metrics_json[key]
                if type(cur_provider[key]) != str and cur_provider[key] is not None and math.isnan(cur_provider[key]):
                    cur_provider[key] = ''

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
        
       
        providers_with_metrics.append(cur_provider)
    return providers_with_metrics
         
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
    elif care_type == "Hospital":
        provider_list = Facility.objects.filter(Q(care_types__contains=["Hospitals"])| Q(care_types__contains=["Hospital"]))
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
        if "scripps" in facility.facility_name.lower():
            print(facility.facility_name, provider_distance.km )
        if provider_distance.km < radius:
            care_types_str = ', '.join(facility.care_types)
        
            cur_provider = {
                "name": facility.facility_name,
                "caretype": care_types_str,
                "id" : facility.id,
                "phone_number" :   facility.phone_number
            }
            if address:
                cur_provider["location"] ={
                    "latitude": getattr(address,'latitude', None),
                    "longitude":  getattr(address,'longitude', None)
                },
                cur_provider["address"] = f"{address.street}, {address.city}, {address.zip}",
            cur_provider["distance"] = str(round(provider_distance.km / 0.62137119,1)) + " mi"
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
        radius = 150
    split_location_string = location_string.strip().split(",")
    search_location = (float(split_location_string[0]), float(split_location_string[1]))
    print('Parsed Location: ', split_location_string)
    search_match_threshold = 70
    #replace the pandas dataframe here
    #provider_list = provider_list[provider_list["Facility Type"] == care_type] #facilities = facilities.filter(care_types__contains=[care_type])
    filtered_providers, provider_list = find_providers_in_radius(search_location, radius, care_type)
    filtered_providers = add_metrics_to_providers(filtered_providers)
    print("Search String: ", search_string)
    
    providers_after_name_filter = []
    if search_string:
        # filter base on fuzzy match on facility name base on search string
        for provider in filtered_providers:
            if fuzz.partial_ratio(provider['name'].lower(), search_string) > search_match_threshold:
                providers_after_name_filter.append(provider)
                
            if fuzz.partial_ratio(provider['address'][0].lower(), search_string) > search_match_threshold:
                providers_after_name_filter.append(provider)
        filtered_providers = providers_after_name_filter 
    
    places_data = filtered_providers
    #print("final filtered providers", places_data)
    # Context for the front end
    
    
    context = {
        'google_places_data' : places_data,
        "data_dictionary" : data_dictionary_lookup,
        'metric_quantiles' : metric_quantiles
    }

    return render(request, "index.html", context)

@timeit
def debug_places_data(request):
    """API endpoint that returns the same data as index view for debugging"""
    # Parse request params to get google query args
    search_string = request.GET.get("search")
    location_string = request.GET.get("location")
    radius = request.GET.get("radius") # in meters
    care_type = request.GET.get("careType")

    # Query google maps for places
    places_data = {}
    if not location_string or 'Na' in location_string:
        location_string = "32.7853263,-117.2407347"
    if not radius:
        radius = 150
    split_location_string = location_string.strip().split(",")
    search_location = (float(split_location_string[0]), float(split_location_string[1]))
    search_match_threshold = 70

    filtered_providers, provider_list = find_providers_in_radius(search_location, radius, care_type)
    filtered_providers = add_metrics_to_providers(filtered_providers)

    providers_after_name_filter = []
    if search_string:
        # filter base on fuzzy match on facility name base on search string
        for provider in filtered_providers:
            if fuzz.partial_ratio(provider['name'].lower(), search_string) > search_match_threshold:
                providers_after_name_filter.append(provider)

            if fuzz.partial_ratio(provider['address'][0].lower(), search_string) > search_match_threshold:
                providers_after_name_filter.append(provider)
        filtered_providers = providers_after_name_filter

    places_data = filtered_providers

    # Return as JSON
    response_data = {
        'google_places_data': places_data,
        'data_dictionary': data_dictionary_lookup,
        'metric_quantiles': metric_quantiles,
        'params': {
            'search': search_string,
            'location': location_string,
            'radius': radius,
            'careType': care_type,
        }
    }

    return JsonResponse(response_data, safe=False)