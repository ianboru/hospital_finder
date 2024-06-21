import os
from functools import wraps
from time import time
from typing import Dict
from difflib import get_close_matches
from googlemaps import Client as GoogleMapsClient
import pandas as pd
import numpy as np
from number_parser import parse_ordinal
from hospital_finder.settings import DATA_DIR


### Testing utils
def timeit(f, print_=True):
    """ Decorator to time a function"""
    @wraps(f)
    def wrap(*args, **kw):
        ts = time()
        result = f(*args, **kw)
        te = time()
        if print_:
            print(f'{f.__name__}: {te-ts:2.4f} sec')
        return result
    return wrap

def load_summary_metric(metric_name: str) -> pd.DataFrame:
    """ Loads a DataFrame from a csv file in the data directory"""
    data_path = os.path.join(DATA_DIR, f'{metric_name}_summary_metrics.csv')
    metric = pd.read_csv(data_path).replace(np.nan, None)
    return metric

def standardize_cms_name(cms_name_df: pd.DataFrame) -> pd.DataFrame:
    return cms_name_df.str.lower().replace('-', " ").replace('/', " ")

def load_provider_list():
    data_path = os.path.join(DATA_DIR, f'all_providers_by_CMS_3_24.csv')
    provider_list = pd.read_csv(data_path).replace(np.nan, None)
    provider_list["Facility ID"] = provider_list["Facility ID"].str.zfill(6)
    return provider_list

@timeit
def load_summary_metrics() -> pd.DataFrame:
    """ Initialize the data for the app"""
    all_metrics = load_summary_metric('all')
    all_metrics = all_metrics[1:10000]
    print("loading summary",all_metrics.columns)
    return all_metrics

### Formatting and parsing
@timeit
def find_name_match(df: pd.DataFrame, name: str) -> pd.DataFrame:
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
def find_address_match(cms_metric_df: pd.DataFrame, place_address: str) -> pd.DataFrame:
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
def format_address(place_address: str) -> str:
    """ Formats the address to match the data set"""
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

def ordinal(n: int) -> str:
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    else:
        suffix = ['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]
    return str(n) + suffix

### Google Maps API
@timeit
def get_places(google_maps: GoogleMapsClient, gmaps_places_args: Dict, radius: int = 10000) -> Dict:
    """ Gets places from the google maps api.
        Broken into ints own function for performance testing"""
    return google_maps.places(**gmaps_places_args, radius=radius)

def filter_place_results(results:Dict) -> Dict:
    """ Filters out places that are don't have the types of interest"""
    valid_types = {"hospital", "health", "doctor", "pharmacy"}
    valid_results = []
    for place_result in results.copy():
        place_types = set(place_result['types'])
        valid_result = any((t in valid_types for t in place_types))
        if valid_result:
            valid_results.append(place_result)
    return valid_results

@timeit
def add_metrics_to_place(metric_df: pd.DataFrame, place_result: Dict) -> Dict:
    """Tries to match a place result and adds metrics to it if a match is found."""
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
def update_place_results(results: Dict, google_maps: GoogleMapsClient, metrics: pd.DataFrame) -> None:
    """Updates the place results in place with metrics and additional data"""
    for place_result in results:
        place_detail = google_maps.place(place_id=place_result["reference"])
        place_detail = place_detail["result"]
        if "formatted_phone_number" in place_detail:
            place_result["phone_number"] = place_detail["formatted_phone_number"]
        place_result = add_metrics_to_place(metrics, place_result)

