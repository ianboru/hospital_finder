from django.shortcuts import render
import pandas as pd
import os
from hospital_finder.settings import BASE_DIR
data_path = os.path.join(BASE_DIR, './data/unplanned_visits.csv')
# Create your views here.
def index(request, path=None):
    unplanned_visits = pd.read_csv(data_path)
    print(unplanned_visits)
    return render(request, "index.html")