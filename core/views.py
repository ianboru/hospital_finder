from django.shortcuts import render
import json
import re

import plotly.graph_objects as go
import plotly
from . import utils
# Create your views here.
def index(request, path=None):
    unplanned_visits = utils.load_hospital_data()
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
    hospital_data = utils.load_hospital_data()
    ## columns for reference  "hospital","mort_30_ami","mort_30_copd"
    '''
        
    '''
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