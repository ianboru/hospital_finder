import pandas as pd
import os
from functools import wraps
from time import time
from hospital_finder.settings import DATA_DIR
import numpy as np


def load_hospital_data():
    data_path = os.path.join(DATA_DIR, 'hvbp_clinical_outcomes.csv')
    quality_metrics = pd.read_csv(data_path)
    quality_metrics.rename(columns={
        "Facility Name" : "hospital",
        "MORT-30-AMI Performance Rate" : "mort_30_ami",
        "MORT-30-COPD Performance Rate" : "mort_30_copd",
    }, inplace=True)
    quality_metrics = quality_metrics.drop_duplicates(subset=['hospital'])
    return quality_metrics

def load_mrsa_data():
    #need to rename this variable
    data_path_mrsa_file = os.path.join(DATA_DIR, 'mrsa_bsi_odp_2022.csv')
    mrsa_metrics = pd.read_csv(data_path_mrsa_file, encoding='latin1')
    mrsa_metrics = mrsa_metrics.drop_duplicates(subset=['Facility_Name'])
    return mrsa_metrics

def load_summary_metric(metric_name):
    data_path = os.path.join(DATA_DIR, f'{metric_name}_summary_metrics.csv')
    metric = pd.read_csv(data_path).replace(np.nan, None)
    return metric

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