import pandas as pd
import os
import matplotlib.pyplot as plt
cwd = os.getcwd()

def load_hcahps_data(export_path):
    hcahps_path = os.path.join(cwd, "data/HCAHPS-Hospital.csv")
    hcahps_df = pd.read_csv(hcahps_path)
    hcahps_df = hcahps_df[[
             'Facility ID', 
             'Facility Name', 
             'ZIP Code', 
             'HCAHPS Measure ID',
             'HCAHPS Question',
             'HCAHPS Linear Mean Value'
             ]]
    
    hcahps_df = hcahps_df[hcahps_df['HCAHPS Question'].str.contains('mean', na = False)]
    hcahps_df = hcahps_df[~hcahps_df['HCAHPS Linear Mean Value'].str.contains('Not Available', na = False)]
    hcahps_df['HCAHPS Linear Mean Value'] = hcahps_df['HCAHPS Linear Mean Value'].astype(int)

    #print(hcahps_df[hcahps_df['HCAHPS Linear Mean Value'].apply(lambda x: isinstance(x, int))])
    
    hcahps_mean_df = hcahps_df[['Facility Name', 'HCAHPS Linear Mean Value']].groupby('Facility Name').mean()
    hcahps_mean_df.rename(columns={"HCAHPS Linear Mean Value":"summary score"}, inplace=True)
    hcahps_mean_df['relative mean'] = hcahps_mean_df["summary score"] - hcahps_mean_df["summary score"].mean()
   
    hcahps_export_path = os.path.join(export_path,'hcahps_summary_metrics.csv')
    hcahps_mean_df.to_csv(hcahps_export_path) 
    # hai_path = os.path.join(BASE_DIR, './data/Healthcare_Associated_Infections-Hospital.csv')

def load_hai_data(export_path):
    hai_path = os.path.join(cwd, "data/Healthcare_Associated_Infections-Hospital.csv")
    hai_df = pd.read_csv(hai_path)
    hai_df = hai_df[[
             'Facility ID', 
             'Facility Name', 
             'ZIP Code', 
             'Measure ID',
             'Measure Name',
             'Compared to National'
             ]]
    hai_df = hai_df[hai_df['Measure ID'].str.contains('SIR', na = False)]
    hai_df = hai_df[~hai_df['Compared to National'].str.contains('Not Available', na = False)]
    hai_df['Compared to National']  = hai_df[['Compared to National']].apply(lambda col:pd.Categorical(col).codes)
    hai_mean_df = hai_df[['Facility Name', 'Compared to National']].groupby('Facility Name').mean()
    hai_mean_df['relative mean'] = hai_mean_df["Compared to National"] - hai_mean_df["Compared to National"].mean()
    hai_export_path = os.path.join(export_path,'hai_summary_metrics.csv')
    hai_mean_df.to_csv(hai_export_path) 

export_path =  os.path.join(cwd, "data")
load_hcahps_data(export_path)
load_hai_data(export_path)