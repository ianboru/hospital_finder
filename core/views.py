from django.shortcuts import render
from numpy import sort
import pandas as pd
import os
from hospital_finder.settings import BASE_DIR
import json
data_path = os.path.join(BASE_DIR, './data/hvbp_clinical_outcomes.csv')
# Create your views here.
def index(request, path=None):
    unplanned_visits = pd.read_csv(data_path)
    unplanned_visits.rename(columns={
        "Facility Name" : "hospital",
        "MORT-30-AMI Performance Rate" : "mort_30_ami",
        "MORT-30-COPD Performance Rate" : "mort_30_copd",
    }, inplace=True)

    sort_string = request.GET.get("sort")
    if sort_string and "-" in sort_string:
        sort_string.replace("-","")
        unplanned_visits = unplanned_visits.sort_values(by=[sort_string], ascending=False)
    elif sort_string and  "-" not in sort_string:
        sort_string.replace("-","")
        unplanned_visits = unplanned_visits.sort_values(by=[sort_string], ascending=True)
       
    print(unplanned_visits, sort_string)
    
    print(unplanned_visits)
    json_records = unplanned_visits.reset_index().to_json(orient ='records')
    data = []
    data = json.loads(json_records)
    context = {'d': data}
    return render(request, "index.html", context)