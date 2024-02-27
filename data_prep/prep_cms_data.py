# %%
import pandas as pd
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import os
import numpy as np

def load_hcahps_data(export_path, **kwargs):
    hcahps_path = os.path.join(export_path, "HCAHPS-Hospital.csv")
    hcahps_df = pd.read_csv(hcahps_path, low_memory=False)
    hcahps_df = hcahps_df[[
             'Facility ID',
             'Address',
             'City/Town',
             'State',
             'ZIP Code',
             'Facility Name',
             'Patient Survey Star Rating',
             'HCAHPS Question',
             ]]

    # Combine address columns

    hcahps_df["Address"] = hcahps_df["Address"] + ", " + hcahps_df["City/Town"] + ", " + hcahps_df["State"] + " " + hcahps_df["ZIP Code"].astype(str)
    hcahps_df = hcahps_df.drop(columns=['City/Town', 'State', 'ZIP Code'])

    def extract_star_ratings(df, show_plots=True):
        questions = df['HCAHPS Question'].unique()
        questions_with_star_ratings = []
        rating_counts = []
        base_df = None
        for q in questions:
            if 'star rating' in q.lower():
                # Only the question data changes, so we can just append to a base dataframe
                if base_df is None:
                    base_df = df[df['HCAHPS Question'] == q].drop(columns=['HCAHPS Question','Patient Survey Star Rating'])
                df_ratings = df[df['HCAHPS Question'] == q]['Patient Survey Star Rating']
                # Summary statistics
                # q = q.replace('star rating',"").replace('-','').strip()
                questions_with_star_ratings.append((
                    q,
                    df_ratings.mean(),
                    df_ratings.std()
                    ))
                rating_counts.append(df_ratings.value_counts(normalize=True).sort_index()*100)
                base_df[q] = df_ratings.values
        if show_plots:
            titles = [f"{q} ({m:.2f}/5)" for q, m, _ in questions_with_star_ratings]
            fig = make_subplots(rows=len(rating_counts),
                                cols=1,
                                shared_xaxes=True,
                                vertical_spacing=0.025,
                                x_title="Patient Survey Star Rating",
                                y_title="Percent of Ratings [%]",
                                subplot_titles=titles)
            for i,r in enumerate(rating_counts):
                fig.append_trace(go.Bar(x=r.index, y=r.values),row=i+1,col=1)
            fig.update_layout(height=1000, width=600, showlegend=False)
            fig.show()
            df_summary = pd.DataFrame(questions_with_star_ratings, columns=['Question', 'Mean Rating', 'Standard Deviation']).set_index('Question')
            print(df_summary)

        return base_df.reset_index(drop=True)


    # For now remove questions wihtout star ratings
    hcahps_df = hcahps_df[hcahps_df['Patient Survey Star Rating'] != 'Not Applicable']
    # Remove the 32% of facilities (1556/4812) which are missing star ratings
    hcahps_df = hcahps_df[hcahps_df['Patient Survey Star Rating'] != 'Not Available']
    hcahps_df['Patient Survey Star Rating'] = hcahps_df['Patient Survey Star Rating'].astype(int)
    # Extract star ratings
    hcahps_df = extract_star_ratings(hcahps_df,**kwargs)
    # Export
    hcahps_export_path = os.path.join(export_path,'hcahps_summary_metrics.csv')
    hcahps_df.to_csv(hcahps_export_path, index=False)
    return hcahps_df

def load_hai_data(export_path):
    hai_path = os.path.join(export_path, "Healthcare_Associated_Infections-Hospital.csv")
    hai_df = pd.read_csv(hai_path)
    hai_df = hai_df[[
                'Facility ID',
                'Address',
                'City/Town',
                'State',
                'ZIP Code',
                'Facility Name',
                'Measure ID',
                'Measure Name',
                'Compared to National',
                'Score'
                ]]

    # Combine address columns
    hai_df["Address"] = hai_df["Address"] + ", " + hai_df["City/Town"] + ", " + hai_df["State"] + " " + hai_df["ZIP Code"].astype(str)
    hai_df = hai_df.drop(columns=['City/Town', 'State', 'ZIP Code'])
    # Replace Not Available with NaN
    hai_df['Compared to National'] = hai_df['Compared to National'].replace('Not Available', np.nan)
    hai_df['Score'] = hai_df['Score'].replace('Not Available', np.nan)
    hai_measures = [
        "Central Line Associated Bloodstream Infection (ICU + select Wards)",
        "Catheter Associated Urinary Tract Infections (ICU + select Wards)",
        "SSI - Colon Surgery",
        "SSI - Abdominal Hysterectomy",
        "MRSA Bacteremia",
        "Clostridium Difficile (C.Diff)"
        ]

    def extract_hai_measurements(df, hai_measures=hai_measures):
        # Ensure data is sorted by facility ID and measure ID
        df = df.sort_values(by=['Facility ID', 'Measure ID'])
        # There are 6 measures per facility and 6 rows per measure
        rows_per_facility = sum(df['Facility ID'].iloc[0] == df['Facility ID'])

        num_measures = len(hai_measures)
        facility_columns = ['Facility ID', 'Facility Name', 'Address']
        for measure in hai_measures:
            facility_columns += [f"{measure} Lower CI", f"{measure} Upper CI", f"{measure} SIR", f"{measure} Compared to National"]

        # Loop through each facility and extract all measures, much faster than using groupby but less readable
        all_facility_data = []
        for i in range(0,len(df),rows_per_facility):
            g = df.iloc[i:i+rows_per_facility].reset_index(drop=True)

            score = g['Score']
            national = g['Compared to National']
            facility_data = [g['Facility ID'].iloc[0], g['Facility Name'].iloc[0], g['Address'].iloc[0]]
            for j in range(0,num_measures):
                facility_data += [
                    score.iloc[0+j*num_measures], # Lower CI
                    score.iloc[1+j*num_measures], # Upper CI
                    score.iloc[5+j*num_measures], # SIR
                    national.iloc[5+j*num_measures] # Compared to National
                    ]

            all_facility_data.append(facility_data)
        return pd.DataFrame(all_facility_data, columns=facility_columns)

    hai_df = extract_hai_measurements(hai_df)

    # Map categories to numeric index
    category_map = {"Worse than the National Benchmark":1, "No Different than National Benchmark":2, "Better than the National Benchmark":3}
    for measure in hai_measures:
        col = f"{measure} Compared to National"
        hai_df[col] = hai_df[col].map(category_map).astype(float)

    # Add summary metrics across all measures
    hai_df['Mean SIR'] = hai_df[[f"{measure} SIR" for measure in hai_measures]].astype(float).mean(axis=1)
    hai_df['Mean Compared to National'] = hai_df[[f"{measure} Compared to National" for measure in hai_measures]].astype(float).mean(axis=1)
    # TODO: Determine the best way to convert this to a 5 star rating
    # bins = hai_df['Mean Compared to National'].describe(percentiles=[0.2,0.4,0.6,0.8,1]).loc[['0%','20%','40%','60%','80%', '100%']]
    # hai_df["Infection Rating"] = pd.cut(hai_df['Mean Compared to National'], bins=5, labels=[1,2,3,4,5])
    hai_df['Infection Rating'] = pd.cut(hai_df['Mean Compared to National'] - hai_df['Mean Compared to National'].mean(), bins=5, labels=[1,2,3,4,5])
    hai_export_path = os.path.join(export_path,'hai_summary_metrics.csv')
    hai_df.to_csv(hai_export_path, index=False)
    return hai_df


def merge_hcahps_and_hai(hcahps_df, hai_df, export_path):
    # Merge HCAHPS and HAI data
    df = hcahps_df.merge(hai_df, on=['Facility ID'], how='outer', suffixes=(None,'_y'))
    df['Facility Name'] = df['Facility Name'].fillna(df['Facility Name_y'])
    df['Address'] = df['Address'].fillna(df['Address_y'])
    df = df.drop(['Facility Name_y', 'Address_y'], axis=1)
    df_export_path = os.path.join(export_path,'all_summary_metrics.csv')
    df.to_csv(df_export_path, index=False)
    return df

from geopy.geocoders import GoogleV3
geolocator = GoogleV3(api_key="AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o")
def add_lat_long_to_row(row):
    location = geolocator.geocode(f"{row['Address']} {row['State']}")
    index = row.name 
    print(f"geocoding {index}/{row['num_ccn']}")
    lat = location.latitude if location else None
    long = location.longitude if location else None
    return pd.Series([lat, long])

def load_ccn_file(facility_type, facility_id_column):
    facility_list_path = os.path.join(export_path, f"CCN - {facility_type}.csv")
    facility_df = pd.read_csv(facility_list_path, low_memory=False)
    facility_df = facility_df.drop_duplicates(subset=[facility_id_column]).reset_index()
    #facility_df = facility_df[1:5]
    facility_df = facility_df[[
             facility_id_column,
             'Address',
             'City/Town',
             'State',
             'ZIP Code',
             ]]
    facility_df['Facility Type'] = facility_type
    facility_df['num_ccn'] = len(facility_df)
    print("file length",len(facility_df))
    facility_df[['latitude','longitude']] = facility_df.apply(add_lat_long_to_row, axis=1)
    return facility_df

def load_provider_cms_list():
    hospital_df = load_ccn_file("Hospital", "Facility ID")
    ed_df = load_ccn_file("ED", "Facility ID")
    home_health_df = load_ccn_file("Home Health", "CMS Certification Number (CCN)")
    home_health_df.rename(columns={
        "CMS Certification Number (CCN)" : "Facility ID",
    }, inplace=True)
    all_providers_df = pd.concat([hospital_df, ed_df, home_health_df], axis=0)
    all_providers_export_path = os.path.join(export_path,'all_providers_by_CMS.csv')
    all_providers_df.to_csv(all_providers_export_path, index=False)
    print(all_providers_df)
    return all_providers_df

export_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),"data")
#hcahps_df = load_hcahps_data(export_path)
#hai_df = load_hai_data(export_path)
#df_final = merge_hcahps_and_hai(hcahps_df, hai_df, export_path)
hospital_df = load_provider_cms_list()
# %%

