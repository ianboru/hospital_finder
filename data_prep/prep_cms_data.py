# %%
import pandas as pd
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import os
import numpy as np
import math
import time

def extract_star_ratings(df):
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

        return base_df.reset_index(drop=True)

def extract_hai_measurements(df, hai_measures):
        # Ensure data is sorted by facility ID and measure ID
        df = df.sort_values(by=['Facility ID', 'Measure ID'])
        # There are 6 measures per facility and 6 rows per measure
        rows_per_facility = sum(df['Facility ID'].iloc[0] == df['Facility ID'])

        num_measures = len(hai_measures)
        facility_columns = ['Facility ID']
        for measure in hai_measures:
            facility_columns += [f"{measure} Compared to National"]

        # Loop through each facility and extract all measures, much faster than using groupby but less readable
        all_facility_data = []
        for i in range(0,len(df),rows_per_facility):
            g = df.iloc[i:i+rows_per_facility].reset_index(drop=True)

            score = g['Score']
            national = g['Compared to National']
            facility_data = [g['Facility ID'].iloc[0]]
            for j in range(0,num_measures):
                facility_data += [
                    national.iloc[5+j*num_measures] # Compared to National
                    ]

            all_facility_data.append(facility_data)
        return pd.DataFrame(all_facility_data, columns=facility_columns)

def load_hai_data(export_path):
    hai_path = os.path.join(export_path, "Healthcare_Associated_Infections-Hospital.csv")
    hai_df = pd.read_csv(hai_path)
    hai_df = hai_df[[
                'Facility ID',
                'Measure ID',
                'Measure Name',
                'Compared to National',
                'Score'
                ]]

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

    hai_df = extract_hai_measurements(hai_df, hai_measures)

    # Map categories to numeric index
    category_map = {"Worse than the National Benchmark":1, "No Different than National Benchmark":2, "Better than the National Benchmark":3}
    for measure in hai_measures:
        col = f"{measure} Compared to National"
        hai_df[col] = hai_df[col].map(category_map).astype(float)

    # Add summary metrics across all measures
    hai_df['Mean Compared to National'] = hai_df[[f"{measure} Compared to National" for measure in hai_measures]].astype(float).mean(axis=1)
    hai_df['Infection Rating'] = pd.cut(hai_df['Mean Compared to National'] - hai_df['Mean Compared to National'].mean(), bins=5, labels=[1,2,3,4,5])
    return hai_df


def merge_hcahps_and_hai(hcahps_df, hai_df, export_path):
    # Merge HCAHPS and HAI data
    df = hcahps_df.merge(hai_df, on=['Facility ID'], how='outer', suffixes=(None,'_y'))
    df_export_path = os.path.join(export_path,'all_summary_metrics.csv')
    df.to_csv(df_export_path, index=False)
    return df

from geopy.geocoders import GoogleV3
geolocator = GoogleV3(api_key="AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o")
def add_lat_long_to_row(row):
    location = geolocator.geocode(f"{row['Address']} {row['State']}")
    index = row.name 
    if index % 10 == 0:
        print(f"geocoding {index}/{row['num_ccn']}")
    lat = location.latitude if location else None
    long = location.longitude if location else None
    return pd.Series([lat, long])

def load_ccn_file(facility_type, facility_id_column):
    #These files have the universal CCN identifier and other metadata like facility name and address
    facility_list_path = os.path.join(export_path, f"CCN - {facility_type}.csv")
    print('current ccn file', facility_list_path)
    facility_df = pd.read_csv(facility_list_path, low_memory=False, encoding='unicode_escape')
    #print(facility_df.columns)
    facility_df = facility_df.drop_duplicates(subset=[facility_id_column]).reset_index()
    name_column = facility_df.columns[facility_df.columns.str.contains('Name', case=False)].values[0]
    address_column = facility_df.columns[facility_df.columns.str.contains('Address', case=False)|facility_df.columns.str.contains('_St', case=False)].values[0]
    city_column = facility_df.columns[facility_df.columns.str.contains('City', case=False)].values[0]
    state_column = facility_df.columns[facility_df.columns.str.contains('State', case=False)].values[0]
    zip_column = facility_df.columns[facility_df.columns.str.contains('Zip', case=False)].values[0]

    facility_df = facility_df[[
             facility_id_column,
             address_column,
             city_column,
             state_column,
             zip_column,
             name_column
            ]]
    facility_df[facility_id_column] = facility_df[facility_id_column].astype(str)
    facility_df[facility_id_column] = facility_df[facility_id_column].str.zfill(6)
    facility_df['Facility Type'] = facility_type
    return facility_df

def add_locations_through_geocoding(facility_df,limit = None):
    if not limit:
        limit = len(facility_df)
    #uncomment to add locations 
    #facility_df[['latitude','longitude']] = facility_df[:limit].apply(add_lat_long_to_row, axis=1)
    return facility_df

def update_provider_data():
    provider_list_path = os.path.join(export_path, f"all_providers_by_CMS.csv")
    provider_df = pd.read_csv(provider_list_path, low_memory=False)
    provider_df["Facility Name"] = ""

    hospital_df = load_ccn_file("Hospital", "Facility ID")
    ed_df = load_ccn_file("ED", "Facility ID")
    
    print(provider_df["Facility ID"].head(20))
    print(ed_df["Facility ID"].head(20))
    print(hospital_df["Facility ID"].head(20))

    home_health_df = load_ccn_file("Home Health", "CMS Certification Number (CCN)")
    print("ED columns " ,provider_df["Facility ID"].isin(ed_df["Facility ID"]).value_counts())
    print("hospital columns " ,provider_df["Facility ID"].isin(hospital_df["Facility ID"]).value_counts())
    print("home health columns " ,provider_df["Facility ID"].isin(home_health_df["CMS Certification Number (CCN)"]).value_counts())
    hospital_id_matches = hospital_df["Facility ID"].isin(provider_df["Facility ID"])
    ed_id_matches = ed_df["Facility ID"].isin(provider_df["Facility ID"])
    home_health_id_matches = home_health_df["CMS Certification Number (CCN)"].isin(provider_df["Facility ID"])
    print("ed caount", ed_id_matches.value_counts())
    provider_df.loc[provider_df["Facility ID"].isin(hospital_df["Facility ID"]),"Facility Name"] = hospital_df[hospital_id_matches]["Facility Name"]
    provider_df.loc[provider_df["Facility ID"].isin(ed_df["Facility ID"]),"Facility Name"] = ed_df[ed_id_matches]["Facility Name"]
    provider_df.loc[provider_df["Facility ID"].isin(home_health_df["CMS Certification Number (CCN)"]),"Facility Name"] = home_health_df[home_health_id_matches]["Provider Name"]
    all_providers_export_path = os.path.join(export_path,'all_providers_by_CMS_with_name.csv')
    provider_df.to_csv(all_providers_export_path, index=False)
    
    print(provider_df)

def load_provider_cms_list():
    hospital_df = load_ccn_file("Hospital", "Facility ID")
    ed_df = load_ccn_file("ED", "Facility ID")
    home_health_df = load_ccn_file("Home Health", "CMS Certification Number (CCN)")
    home_health_df.rename(columns={
        "CMS Certification Number (CCN)" : "Facility ID",
        "Provider Name" : "Facility Name"
    }, inplace=True)
    hospice_df = load_ccn_file("Hospice", "CMS Certification Number (CCN)")
    hospice_df.rename(columns={
        "CMS Certification Number (CCN)" : "Facility ID",
        "Address Line 1" : "Address",
    }, inplace=True)
    outpatient_df = load_ccn_file("Outpatient", "Rndrng_Prvdr_CCN")
    outpatient_df.rename(columns={
        "Rndrng_Prvdr_CCN" : "Facility ID",
         "Rndrng_Prvdr_Org_Name" : "Facility Name",
         "Rndrng_Prvdr_St" : "Address",
         "Rndrng_Prvdr_City" : "City/Town",
         "Rndrng_Prvdr_State_Abrvtn" : "State",
         "Rndrng_Prvdr_Zip5" : "ZIP Code"
    }, inplace=True)
    all_providers_df = pd.concat([hospital_df, ed_df, home_health_df, hospice_df, outpatient_df], axis=0)
    all_providers_df['num_ccn'] = len(all_providers_df)

    return all_providers_df

def extract_questions_as_columns(df, care_type):
    measure_columns_by_care_type = {
        "Home Health" : [
            "HHCAHPS Survey Summary Star Rating",
            # "Star Rating for health team gave care in a professional way",
            # "Star Rating for health team communicated well with them",
            # "Star Rating team discussed medicines, pain, and home safety",
            # "Star Rating for how patients rated overall care from agency"
        ],
        "Outpatient Ambulatory Services" : [
            "Facilities and staff linear mean score",
            "Patients who reported that staff definitely communicated about what to expect during and after the procedure",
            # "Communication about your procedure linear mean score",
            # "Patients' rating of the facility linear mean score",
            # "Patients recommending the facility linear mean score"
        ],
        "In-Center Hemodialysis" : [
            "Patient Hospital Readmission Category",
            # "Patient Transfusion category text",
            # "SWR category text",
            # "PPPW category text",
            # "SEDR category text",
            # "ED30 Category text",
            # "Patient Infection category text",
            # "Fistula Category Text"
        ],
        "Nursing Homes" : [
            "Overall Rating",
            # "Health Inspection Rating",
            # "QM Rating",
            # "Long-Stay QM Rating",
            # "Short-Stay QM Rating",
            # "Staffing Rating"
        ],
        "Hospice" : [
            "Family caregiver survey rating",
        ]
    }   

    df = df[measure_columns_by_care_type[care_type] + ["Facility ID"]]
    
    return df 

def extract_questions_as_rows(df, care_type):    
    measure_name_column_by_care_type = {
        "Hospitals" : "HCAHPS Question",
        "Hospice" : "Measure Name",
        "ED + Others" : "Measure Name",
    }   
    measure_value_column_by_care_type = {
        "Hospitals" : "Patient Survey Star Rating",
        "Hospice" : "Score",
        "ED + Others" : "Score",
    }
    allowed_columns = [
        "Family caregiver survey rating",
        "Ambulatory Quality Measures - Mean Linear Scores",
        "Emergency department volume",
        "Summary star rating",
        "Staff responsiveness - star rating",
        "Discharge information - star raing",
        "Care transition - star rating",
        "Cleanliness - star rating",
        "Quietness - star rating" 
        "Patients who reported that staff definitely communicated about what to expect during and after the procedure",
    ]
    measure_name_column = measure_name_column_by_care_type[care_type]
    measure_value_column = measure_value_column_by_care_type[care_type]
    individual_measures = df[measure_name_column].unique()
    individual_measures = list(set(allowed_columns).intersection(set(individual_measures)))
    print("# unique measures ", len(individual_measures))
    print("remaining measures", care_type, individual_measures)
    measures_per_facility = pd.DataFrame()
    for measure in individual_measures:
        #print(measure)
        measure_values = df[[measure_value_column, "Facility ID"]].loc[df[measure_name_column] == measure]
        #measure_values = measure_values.reset_index()
        column_map = {}
        column_map[measure_value_column] = measure
        measure_values = measure_values.rename(columns=column_map)
        if measures_per_facility.empty:
            print("was empty")
            measures_per_facility = measure_values
        else:
            #print(measure_values.columns)
            #print("Adding measure pre ", measures_per_facility.columns)
            measures_per_facility = pd.merge(measures_per_facility, measure_values, on="Facility ID")
            #print("Adding measure post", measures_per_facility.columns)
    measures_per_facility = measures_per_facility.reset_index(drop=True)
    return measures_per_facility

def load_cahps_data(export_path, care_type, files_with_measures_as_columns):
    print("loading cahps care type", care_type)
    cahps_path = os.path.join(export_path, f"CAHPS - {care_type}.csv")
    cahps_df = pd.read_csv(cahps_path, low_memory=False)
    facility_id_column = "Facility ID" if "Facility ID" in cahps_df.columns else "CMS Certification Number (CCN)"
    column_map = {}
    column_map[facility_id_column] = 'Facility ID'
    #print("current care type", care_type,cahps_df.columns)
    cahps_df = cahps_df.rename(columns=column_map)
    #print("after care type", care_type,cahps_df.columns)
    if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
        cahps_df = extract_questions_as_columns(cahps_df, care_type)
    else:
        cahps_df = extract_questions_as_rows(cahps_df, care_type)
    print("finishing cahps load")
    return cahps_df

export_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),"data")
current_date = today = time.strftime("%m-%d-%Y")
care_types = ["ED + Others", "Home Health", "Hospice", "Hospitals", "In-Center Hemodialysis", "Nursing Homes"]
regenerate_ccn_list = False
all_providers_df = load_provider_cms_list()
all_cahps_df = pd.DataFrame()
files_with_measures_as_columns = ["Home Health", "Outpatient", "Nursing Homes", "In-Center Hemodialysis"]
for care_type in care_types:
    cur_hcahps_df = load_cahps_data(export_path, care_type, files_with_measures_as_columns)
    if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
        print("pre concatening to all cahps df", cur_hcahps_df.shape, all_cahps_df.shape)
        all_cahps_df = pd.concat([all_cahps_df, cur_hcahps_df])
        print("post concatening to all cahps df", cur_hcahps_df.shape, all_cahps_df.shape)

    else:
        if all_cahps_df.empty:
            all_cahps_df = cur_hcahps_df
        else:
            #print("merge columns",care_type, cur_hcahps_df.columns)
            print("pre merging to all cahps df", cur_hcahps_df.shape, all_cahps_df.shape)
            all_cahps_df = pd.merge(all_cahps_df, cur_hcahps_df, how="outer", on="Facility ID")
            print("post merging to all cahps df", cur_hcahps_df.shape, all_cahps_df.shape)
    #print(all_cahps_df.columns)
all_cahps_df = all_cahps_df.reset_index(drop=True)
hai_df = load_hai_data(export_path)
all_cahps_df = merge_hcahps_and_hai(all_cahps_df, hai_df, export_path)
print("final shape", all_cahps_df.columns)
all_cahps_export_path = os.path.join(export_path,f'all_cahps_summary_metrics {current_date}.csv')
print(all_cahps_df[all_cahps_df["HHCAHPS Survey Summary Star Rating"].notna()].head(10))
all_cahps_df.to_csv(all_cahps_export_path, index=False)
if regenerate_ccn_list:
    chunks = 1000
    chunk_limit = None 
    total_rows = len(all_providers_df)

    for chunk in range(chunks):
        chunk_size = math.ceil(total_rows/chunks)
        lower_index = chunk_size * chunk 
        upper_index = min(chunk_size * (chunk + 1), total_rows - 1)
        current_providers_df = all_providers_df[lower_index:upper_index]
        #add_locations_through_geocoding can only be run once for free tier of geocode api
        #current_providers_df = add_locations_through_geocoding(all_providers_df[lower_index:upper_index])
        all_providers_export_path = os.path.join(export_path,f'all_providers_by_CMS_{current_date}.csv')
        print(f"chunk {chunk}/{chunks}, size {chunk_size}, indices {lower_index} : {upper_index}")
        if chunk == 0:
            print("initialize")
            current_providers_df.to_csv(all_providers_export_path, index=False)
        else:
            current_providers_df.to_csv(all_providers_export_path, index=False, mode='a',header=False)
        if chunk_limit and chunk == chunk_limit:
            break
    #update_provider_data()


# %%
