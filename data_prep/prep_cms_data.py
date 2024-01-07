import pandas as pd
import os
import matplotlib.pyplot as plt

def load_hcahps_data():
    cwd = os.getcwd()
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
    # hai_path = os.path.join(BASE_DIR, './data/Healthcare_Associated_Infections-Hospital.csv')

    
load_hcahps_data()