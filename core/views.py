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
from core.utils import timeit, load_summary_metrics, load_hospital_data, get_places, filter_place_results, update_place_results
pd.set_option('display.max_rows', None,)

#https://learndjango.com/tutorials/django-signup-tutorial
class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

# Initialize the data for the app
gmaps = GoogleMapsClient(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
summary_metrics = load_summary_metrics()

@timeit
def index(request, path=None):
    """ The main landing route for the app"""
    # Parse request params to get google query args
    search_string = request.GET.get("search")
    location_string = request.GET.get("location")
    radius = request.GET.get("radius") # in meters
    
    care_types = [
        { 'id': 1, 'name': 'Home Health' },
        { 'id': 2, 'name': 'Hospital' },
        { 'id': 3, 'name': 'Emergency Department (ED or ER)' },
        { 'id': 4, 'name': 'Nursing Home' },
        { 'id': 5, 'name': 'Dialysis' },
        { 'id': 6, 'name': 'Long-Term Care' },
        { 'id': 7, 'name': 'In-Patient Rehabilitation' }
    ]

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
        },
        'care_types': care_types
    }
    return render(request, "index.html", context)

def graph(request, path=None):
    hospital_data = load_hospital_data()
    ## columns for reference  "hospital","mort_30_ami","mort_30_copd"
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

