from django.shortcuts import render
from numpy import sort
import pandas as pd
import os
from hospital_finder.settings import BASE_DIR
import json
import re
data_path = os.path.join(BASE_DIR, './data/hvbp_clinical_outcomes.csv')
# Create your views here.
def index(request, path=None):
    print("SETTINGS", BASE_DIR)
    unplanned_visits = pd.read_csv(data_path)
    unplanned_visits.rename(columns={
        "Facility Name" : "hospital",
        "MORT-30-AMI Performance Rate" : "mort_30_ami",
        "MORT-30-COPD Performance Rate" : "mort_30_copd",
    }, inplace=True)
    #sort dataframe based on query param
    search_string = request.GET.get("search")
    if search_string:
        unplanned_visits = unplanned_visits[
            unplanned_visits["hospital"].str.contains(search_string, regex=True, flags=re.IGNORECASE)
        ]
    #sort dataframe based on query param
    sort_string = request.GET.get("sort")
    if sort_string and "-" in sort_string:
        unplanned_visits = unplanned_visits.sort_values(by=[sort_string.replace("-","")], ascending=False)
    elif sort_string and  "-" not in sort_string:
        unplanned_visits = unplanned_visits.sort_values(by=[sort_string], ascending=True)
           
    #convert dataframe to json
    json_records = unplanned_visits.reset_index().to_json(orient ='records')
    hospital_data = json.loads(json_records)

    #set href sort string for sorting in opposite direction
    if sort_string and "-" in sort_string:
        sort_string = sort_string.replace("-","")
    elif sort_string and  "-" not in sort_string:
        sort_string = f"-{sort_string}"
    else:
        sort_string = ""
    context = {
        'hospital_data': hospital_data,
        'sort_string' : sort_string
    }
    return render(request, "index.html", context)

def graph(request, path=None):
    return render(request, "graph.html")