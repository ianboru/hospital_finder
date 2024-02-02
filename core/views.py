from http.client import HTTPResponse
from django.shortcuts import render
import json
import re
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import plotly.graph_objects as go
import plotly
from .utils import timeit, load_hospital_data, load_summary_metric
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views import generic
from django.contrib.auth.models import User
from number_parser import parse_ordinal
from difflib import get_close_matches
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
    return cms_name_df.str.lower().replace('-', " ").replace('/', " ")

@timeit
def load_summary_metrics():
    """ Initialize the data for the app"""
    all_metrics = load_summary_metric('all')
    all_metrics["Facility Name"] = standardize_cms_name(all_metrics["Facility Name"])
    all_metrics["Address"] = all_metrics["Address"].str.lower()
    return all_metrics

summary_metrics = load_summary_metrics()

@timeit
def index(request, path=None):
    search_string = request.GET.get("search")
    location_string = request.GET.get("location")
    radius_string = request.GET.get("radius")
    gmaps_places_args = {}
    if search_string:
        gmaps_places_args["query"] = search_string.strip()
    if location_string:
        split_location_string = location_string.strip().split(",")
        gmaps_places_args["location"] = [float(split_location_string[1]),float(split_location_string[0])]
    #curl -L -X GET 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=t&location=42.3675294%2C-71.186966&radius=10000&key=AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o'

    gmaps = googlemaps.Client(key='AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o')
    places_results = []
    if search_string:
        print("search args", gmaps_places_args)
        places_results = gmaps.places(**gmaps_places_args, radius=radius_string or 10000)
        for place_result in places_results['results']:
            place_detail = gmaps.place(place_id=place_result["reference"])
            place_detail = place_detail["result"]
            if "formatted_phone_number" in place_detail:
                place_result["phone_number"] = place_detail["formatted_phone_number"]
            place_result = add_metrics_to_place(summary_metrics, place_result)
    context = {
        'google_places_data' : places_results,
        'metric_ranges' : {
            'max_hai' : 5,
            'min_hai' : 1,
            'max_hcahps' : 5,
            'min_hcahps' : 1
        }
    }
    return render(request, "index.html", context)

@timeit
def add_metrics_to_place(metric_df, place_result):
    # Try to match by name
    name_match = find_name_match(metric_df, place_result['name'])
    if not name_match.empty:
        for col in name_match.index:
            place_result[col] = name_match[col]
    else:
        # Try to match by address
        address_match = find_address_match(metric_df, place_result["formatted_address"])
        if not address_match.empty:
            for col in address_match.index:
                place_result[col] = address_match[col]
    return place_result


@timeit
def find_name_match(df, name):
    """ Tries to find matching data for a place by facility name """
    name = name.lower().strip()
    res = df[df['Facility Name'].str.contains(name,case=False)]
    if not res.empty:
        match_ = res.iloc[0]
        print(f"name match: '{name}' with '{match_['Facility Name']}'")
        return match_
    else:
        # Try to find a close match if there was no exact match
        names = dict(zip(df['Facility Name'].values,df['Facility Name'].index))
        matches = get_close_matches(name, names.keys(), n=1, cutoff=0.9)
        if matches:
            match_  = df.loc[names[matches[0]],:]
            print(f"name match: '{name}' with '{match_['Facility Name']}'")
            return match_
    return pd.DataFrame()

@timeit
def find_address_match(cms_metric_df, place_address):
    """ Tries to find matching data for a place by address """
    place_address = format_address(place_address)

    # Dict look ups are faster than iterating through the df
    addresses = dict(zip(cms_metric_df['Address'].values,cms_metric_df['Address'].index))

    if place_address in addresses:
        match_ = cms_metric_df.loc[addresses[place_address],:]
        print(f"address match: '{place_address}' with '{match_['Address']}'")
        return match_
    else:
        # Try to find a close match if there was no exact match
        matches = get_close_matches(place_address, addresses.keys(), n=1, cutoff=0.9)
        if matches:
            match_ = cms_metric_df.loc[addresses[matches[0]],:]
            print(f"address match: '{place_address}' with '{match_['Address']}'")
            return match_

    #return empty df if no hits
    return pd.DataFrame()

@timeit
def format_address(place_address):
    print("place_address preformat: ", place_address)
    # Google map returns addresses with abbreviations, the data set has full names
    place_address = place_address.lower().replace("-", " ").replace("/", " ")
    place_address = place_address.replace(' ave ', ' avenue ')
    place_address = place_address.replace(' rd ', ' road ')
    place_address = place_address.replace(' st ', ' street ')
    place_address = place_address.replace(' dr ', ' drive ')
    place_address = place_address.replace(' ct ', ' court ')
    place_address = place_address.replace(' e ', ' east ')
    place_address = place_address.replace(' w ', ' west ')
    place_address = place_address.replace(' n ', ' north ')
    place_address = place_address.replace(' s ', ' south ')
    place_address = place_address.replace(' ne ', ' northeast ')
    place_address = place_address.replace(' nw ', ' northwest ')
    place_address = place_address.replace(' se ', ' southeast ')
    place_address = place_address.replace(' sw ', ' southwest ')
    place_address = place_address.replace(' blvd ', ' boulevard ')
    place_address = place_address.replace(' pkwy ', ' parkway ')
    place_address = place_address.replace(' pl ', ' place ')
    place_address = place_address.replace(' ln ', ' lane ')
    place_address = place_address.replace(' hwy ', ' highway ')
    place_address = place_address.strip()
    place_address = place_address.replace(", united states", "")

    split_address = place_address.split(" ")
    final_address = []
    for word in split_address:
        n = parse_ordinal(word)
        if n and not word.isnumeric():
            word = ordinal(n)
        final_address.append(word)

    place_address = " ".join(final_address)
    print("place_address formatted: ", place_address)
    return place_address

def ordinal(n: int):
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    else:
        suffix = ['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]
    return str(n) + suffix

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

