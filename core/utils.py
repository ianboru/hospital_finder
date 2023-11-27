import pandas as pd
import os
from hospital_finder.settings import BASE_DIR

data_path = os.path.join(BASE_DIR, './data/hvbp_clinical_outcomes.csv')
#need to rename this variable
data_path_mrsa_file = os.path.join(BASE_DIR, './data/mrsa_bsi_odp_2022.csv')

def load_hospital_data():
    quality_metrics = pd.read_csv(data_path)
    quality_metrics.rename(columns={
        "Facility Name" : "hospital",
        "MORT-30-AMI Performance Rate" : "mort_30_ami",
        "MORT-30-COPD Performance Rate" : "mort_30_copd",
    }, inplace=True)
    quality_metrics = quality_metrics.drop_duplicates(subset=['hospital'])
    return quality_metrics

def load_mrsa_data():
    mrsa_metrics = pd.read_csv(data_path_mrsa_file, encoding='latin1')
    mrsa_metrics = mrsa_metrics.drop_duplicates(subset=['Facility_Name'])
    return mrsa_metrics