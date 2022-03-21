from django.shortcuts import render
import pandas as pd
import os
from hospital_finder.settings import BASE_DIR
import json
data_path = os.path.join(BASE_DIR, './data/unplanned_visits.csv')
# Create your views here.
def index(request, path=None):
    unplanned_visits = pd.read_csv(data_path)
    print(unplanned_visits)
    json_records = unplanned_visits.reset_index().to_json(orient ='records')
    data = []
    data = json.loads(json_records)
    context = {'d': data}
    return render(request, "index.html", context)