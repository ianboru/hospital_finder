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
from core.utils import timeit, load_summary_metrics, load_hospital_list, load_hospital_data, get_places, filter_place_results, update_place_results
pd.set_option('display.max_rows', None,)

#https://learndjango.com/tutorials/django-signup-tutorial
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

# Initialize the data for the app
gmaps = GoogleMapsClient(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
summary_metrics = load_summary_metrics()
hospital_list = load_hospital_list()

@timeit
def index(request, path=None):
    """ The main landing route for the app"""
    # Parse request params to get google query args
    search_string = request.GET.get("search")
    location_string = request.GET.get("location")
    radius = request.GET.get("radius") # in meters

    # Query google maps for places
    places_data = {}
    if search_string:
        # Google maps query args
        # Example query: curl -L -X GET 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=t&location=42.3675294%2C-71.186966&radius=10000&key=AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o'
        gmaps_places_args = {}
        gmaps_places_args["query"] = search_string.strip()
        if location_string:
            split_location_string = location_string.strip().split(",")
            gmaps_places_args["location"] = [float(split_location_string[1]),float(split_location_string[0])]

        print("search args", gmaps_places_args)
        places_data = get_places(gmaps, gmaps_places_args, radius= int(float(radius)) if radius else 10000)
        valid_results = filter_place_results(places_data["results"]) # Query args only support 1 type filter, so we filter results aftwards
        update_place_results(valid_results, gmaps, summary_metrics) # Updates in place
        places_data['results'] = valid_results

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


