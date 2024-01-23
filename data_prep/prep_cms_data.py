import pandas as pd
import os
import matplotlib.pyplot as plt
cwd = os.getcwd()

def load_hcahps_data(export_path):
    hcahps_path = os.path.join(cwd, "data/HCAHPS-Hospital.csv")
    hcahps_df = pd.read_csv(hcahps_path, low_memory=False)
    hcahps_df = hcahps_df[[
             'Address',
             'Facility ID', 
             'Facility Name', 
             'ZIP Code', 
             'Patient Survey Star Rating',
             'HCAHPS Measure ID',
             'HCAHPS Question',
             ]]
    
    hcahps_df = hcahps_df[hcahps_df['HCAHPS Question'].str.contains('Summary star rating', na = False)]
    hcahps_df = hcahps_df[~hcahps_df['Patient Survey Star Rating'].str.contains('Not Available', na = False)]
    hcahps_df['Patient Survey Star Rating'] = hcahps_df['Patient Survey Star Rating'].astype(int)
    hcahps_df.rename(columns={"Patient Survey Star Rating":"relative mean"}, inplace=True)
    
    hcahps_export_path = os.path.join(export_path,'hcahps_summary_metrics.csv')
    hcahps_df.to_csv(hcahps_export_path) 
    # hai_path = os.path.join(BASE_DIR, './data/Healthcare_Associated_Infections-Hospital.csv')

def load_hai_data(export_path):
    hai_path = os.path.join(cwd, "data/Healthcare_Associated_Infections-Hospital.csv")
    hai_df = pd.read_csv(hai_path)
    hai_df = hai_df[[
             'Address',
             'Facility ID', 
             'Facility Name', 
             'ZIP Code', 
             'Measure ID',
             'Measure Name',
             'Compared to National',
             ]]
    pd.set_option('display.max_columns', None)
    #Drop dupes for unique facility address combo
    address_df = hai_df[['Facility Name', 'Address']].drop_duplicates()
    hai_df = hai_df[hai_df['Measure ID'].str.contains('SIR', na = False)]
    hai_df = hai_df[~hai_df['Compared to National'].str.contains('Not Available', na = False)]
    category_map = {"Worse than the National Benchmark":1, "No Different than National Benchmark":2, "Better than the National Benchmark":3}
    #map hai compared to national to numeric index for relative metric
    hai_df['Compared to National'] = hai_df['Compared to National'].map(category_map)
    hai_mean_df = hai_df[['Facility Name', 'Compared to National']].groupby('Facility Name').mean()
    hai_mean_df['relative mean'] = hai_mean_df["Compared to National"] - hai_mean_df["Compared to National"].mean()

    hai_final_df = hai_mean_df.merge(address_df, on='Facility Name')
    #uncomment to show histogram of data
    #hai_final_df[['Facility Name', 'relative mean']].hist()
    #plt.show()
    hai_export_path = os.path.join(export_path,'hai_summary_metrics.csv')
    hai_final_df.to_csv(hai_export_path) 

export_path =  os.path.join(cwd, "data")
load_hcahps_data(export_path)
load_hai_data(export_path)