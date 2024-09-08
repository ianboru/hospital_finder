from django.core.management.base import BaseCommand
import os, json
import pandas as pd
import numpy as np
from core.models.facility_data import CAPHSMetrics
from core.models.facility import Facility, Address
from core.models.facility_data import HAIMetrics
from hospital_finder.settings import DATA_DIR


class Command(BaseCommand):
    help = 'Import Patient Data'

    def filter_columns(self, facility_type, facility_df):
        facility_id_column = "Facility ID" if "Facility ID" in facility_df.columns else "CMS Certification Number (CCN)"
        facility_df = facility_df.drop_duplicates()
        if facility_type == 'CCN':
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
            return facility_df
        
            
    def load_ccn_data_to_facility_model(self, export_path, care_type):
        facility_type = 'CCN'
        provider_path = os.path.join(export_path, f"CCN - {care_type}.csv")
            
        provider_df = pd.read_csv(provider_path, low_memory=False, encoding='unicode_escape')
        
        if care_type == "Outpatient":
            provider_df.rename(columns={
                "Rndrng_Prvdr_CCN" : "Facility ID",
                "Rndrng_Prvdr_Org_Name" : "Facility Name",
                "Rndrng_Prvdr_St" : "Address",
                "Rndrng_Prvdr_City" : "City/Town",
                "Rndrng_Prvdr_State_Abrvtn" : "State",
                "Rndrng_Prvdr_Zip5" : "ZIP Code"
            }, inplace=True)
            
        if care_type == "Hospice":
            provider_df.rename(columns={"Address Line 1" : "Address"}, inplace=True)
            
        if care_type == "Home Health":
            provider_df.rename(columns={"Provider Name" : "Facility Name"}, inplace=True)
        
        ccn_facility_df = self.filter_columns(facility_type, provider_df)
        for index, row in ccn_facility_df.iterrows():
            facility_id = "Facility ID" if "Facility ID" in ccn_facility_df.columns else "CMS Certification Number (CCN)"
            if Facility.objects.filter(facility_id=row[facility_id], care_types__contains=[care_type]):
                # we don't want to create duplicate facility data so if facility exists then go to the next row
                pass
            elif Facility.objects.filter(facility_id=row[facility_id]):
                # if one facility has more than one care type we want to add it to the care types list 
                facility = Facility.objects.filter(facility_id=row[facility_id]).first()
                facility.care_types.append(care_type)
                facility.save()
            else:
                current_facility = Facility.objects.create(
                    facility_name = row['Facility Name'],
                    facility_id = row[facility_id],
                    care_types = [care_type],
                )
                address = Address.objects.create(
                        zip=row['ZIP Code'],
                        street=row['Address'],  
                        city=row['City/Town'],
                        )
                current_facility.address = address
                current_facility.save()
    
    def extract_questions_as_rows(self, df, care_type): 
        measure_name_column_by_care_type = {
        "Hospitals" : "HCAHPS Question",
        "Hospice" : "Measure Name",
        "ED + Others" : "Measure Name",
        "Outpatient Ambulatory Services" : "Measure Name"
        }   
         
        measure_value_column_by_care_type = {
                "Hospitals" : "Patient Survey Star Rating",
                "Hospice" : "Score",
                "ED + Others" : "Score",
        }
        column_name_from_values = [
            "Family caregiver survey rating",
            "Ambulatory Quality Measures - Mean Linear Scores",
            "Emergency department volume",
            "Summary star rating",
            "Staff responsiveness - star rating",
            "Discharge information - star rating",
            "Care transition - star rating",
            "Cleanliness - star rating",
            "Quietness - star rating",
            "Patients who reported that staff definitely communicated about what to expect during and after the procedure",
        ]
        
        # measure_name_column value is a column name 
        measure_name_column = measure_name_column_by_care_type[care_type]
        measure_value_column = measure_value_column_by_care_type[care_type]
        individual_measures = df[measure_name_column].unique()
        individual_measures = list(set(column_name_from_values).intersection(set(individual_measures)))
        measures_per_facility = pd.DataFrame()
        for measure in individual_measures:
            measure_values = df[[measure_value_column, "Facility ID"]].loc[df[measure_name_column] == measure]
            column_map = {}
            column_map[measure_value_column] = measure
            measure_values = measure_values.rename(columns=column_map)
            if measures_per_facility.empty:
                print("was empty")
                measures_per_facility = measure_values
            else:
                measures_per_facility = pd.merge(measures_per_facility, measure_values, on="Facility ID")
        measures_per_facility = measures_per_facility.reset_index(drop=True)
        return measures_per_facility
        
    def load_caphs_data(self, export_path, care_type):
        provider_path = os.path.join(export_path, f"CAHPS - {care_type}.csv")
        files_with_measures_as_columns = ["Home Health", "Outpatient Ambulatory Services", "Nursing Homes", "In-Center Hemodialysis"]
        
        caphs_df = pd.read_csv(provider_path, low_memory=False, encoding='unicode_escape')
        
        if "CMS Certification Number (CCN)" in caphs_df.columns:
            caphs_df = caphs_df.rename(columns={"CMS Certification Number (CCN)": "Facility ID"})

        
        if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
            # filter column
            measure_columns_by_care_type = {
                "Home Health" : [
                    "HHCAHPS Survey Summary Star Rating",
                ],
                "Outpatient Ambulatory Services" : [
                    "Facilities and staff linear mean score",
                    "Patients who reported that staff definitely communicated about what to expect during and after the procedure",
                ],
                "In-Center Hemodialysis" : [
                    "Patient Hospital Readmission Category",
                ],
                "Nursing Homes" : [
                    "Overall Rating",
                ],
                "Hospice" : [
                    "Family caregiver survey rating",
                ]
            }   
            caphs_df = caphs_df[measure_columns_by_care_type[care_type] + ["Facility ID"]]
        else:
            caphs_df = self.extract_questions_as_rows(caphs_df, care_type)
        
        caphs_df = caphs_df.drop_duplicates()
        return caphs_df
        
    def create_caphs_json_by_row_of_all_caphs_df(self, all_cahps_df):
        for index, row in all_cahps_df.iterrows():
            # Convert the row to a dictionary
            hospital = row.to_dict()  
            # changing dict to json we need json type to save in the instance
            hospital = json.dumps(hospital) 
            if Facility.objects.filter(facility_id=row["Facility ID"]):
                facility = Facility.objects.filter(facility_id=row["Facility ID"]).first()
                caphs_metrics = CAPHSMetrics(
                                    caphs_metric_json=hospital,
                                    facility=facility
                                    )
                caphs_metrics.save()
            else:
                pass
        


    def load_hai_data_to_facility_model(self, export_path):
        hai_path = os.path.join(export_path, "hai_summary_metrics.csv")
        hai_df = pd.read_csv(hai_path, low_memory=False, encoding='unicode_escape')

        # Replace NaN values
        hai_df = hai_df.replace({np.nan: None})

        for index, row in hai_df.iterrows():
            facility_id = row['Facility ID']
            #facility_name = row['Facility Name']
            metrics = {
                "Central Line Associated Bloodstream Infection": {
                    "Lower CI": row['Central Line Associated Bloodstream Infection (ICU + select Wards) Lower CI'],
                    "Upper CI": row['Central Line Associated Bloodstream Infection (ICU + select Wards) Upper CI'],
                    "SIR": row['Central Line Associated Bloodstream Infection (ICU + select Wards) SIR'],
                    "Compared to National": row['Central Line Associated Bloodstream Infection (ICU + select Wards) Compared to National']
                },
                "Catheter Associated Urinary Tract Infections": {
                    "Lower CI": row['Catheter Associated Urinary Tract Infections (ICU + select Wards) Lower CI'],
                    "Upper CI": row['Catheter Associated Urinary Tract Infections (ICU + select Wards) Upper CI'],
                    "SIR": row['Catheter Associated Urinary Tract Infections (ICU + select Wards) SIR'],
                    "Compared to National": row['Catheter Associated Urinary Tract Infections (ICU + select Wards) Compared to National']
                },
                "SSI - Colon Surgery": {
                    "Lower CI": row['SSI - Colon Surgery Lower CI'],
                    "Upper CI": row['SSI - Colon Surgery Upper CI'],
                    "SIR": row['SSI - Colon Surgery SIR'],
                    "Compared to National": row['SSI - Colon Surgery Compared to National']
                },
                "SSI - Abdominal Hysterectomy": {
                    "Lower CI": row['SSI - Abdominal Hysterectomy Lower CI'],
                    "Upper CI": row['SSI - Abdominal Hysterectomy Upper CI'],
                    "SIR": row['SSI - Abdominal Hysterectomy SIR'],
                    "Compared to National": row['SSI - Abdominal Hysterectomy Compared to National']
                },
                "MRSA Bacteremia": {
                    "Lower CI": row['MRSA Bacteremia Lower CI'],
                    "Upper CI": row['MRSA Bacteremia Upper CI'],
                    "SIR": row['MRSA Bacteremia SIR'],
                    "Compared to National": row['MRSA Bacteremia Compared to National']
                },
                "Clostridium Difficile (C.Diff)": {
                    "Lower CI": row['Clostridium Difficile (C.Diff) Lower CI'],
                    "Upper CI": row['Clostridium Difficile (C.Diff) Upper CI'],
                    "SIR": row['Clostridium Difficile (C.Diff) SIR'],
                    "Compared to National": row['Clostridium Difficile (C.Diff) Compared to National']
                },
                "Mean SIR": row['Mean SIR'],
                "Mean Compared to National": row['Mean Compared to National'],
                "Infection Rating": row['Infection Rating']
            }

            facility = Facility.objects.filter(facility_id=facility_id).first()
            if facility:
                hai_metrics, created = HAIMetrics.objects.get_or_create(
                    facility=facility,
                    defaults={'hai_metric_json': []}
                )
                if not created:
                    # Update existing metrics
                    hai_metrics.hai_metric_json = metrics
                else:
                    # Add new metrics
                    hai_metrics.hai_metric_json = metrics

                hai_metrics.save()

    def load_lat_long_to_address_model(self, export_path):
        lat_long_path = os.path.join(export_path, "all_providers_by_CMS_with_name.csv")
        lat_long_df = pd.read_csv(lat_long_path, low_memory=False, encoding='unicode_escape')
        length_df = len(lat_long_df.index)
        facility_num = 0
        print("Latitude and Longitude DataFrame:\n", lat_long_df.head())
        lat_long_df = lat_long_df[['Facility ID', 'latitude', 'longitude']]

        for index, row in lat_long_df.iterrows():
            facility_id = row['Facility ID']
            latitude = row['latitude']
            longitude = row['longitude']
            percentage = round(100 * facility_num / length_df)

            # Print the data being processed
            #print(f"Processing Facility ID: {facility_id}, Latitude: {latitude}, Longitude: {longitude}")

            facility = Facility.objects.filter(facility_id=facility_id).first()
            if facility and facility.address:

                # Print before updating
                #print(f"Updating Facility ID: {facility_id} - Old Latitude: {facility.address.latitude}, Old Longitude: {facility.address.longitude}")

                facility.address.latitude = latitude
                facility.address.longitude = longitude
                facility.address.save()
                facility_num = facility_num + 1


                # Print after updating
                #print(f"Updated Facility ID: {facility_id} - New Latitude: {facility.address.latitude}, New Longitude: {facility.address.longitude}")

            
            else:
                print(f"Facility with ID {facility_id} not found or has no address.")

            if facility_num % 500 == 0:
                print(f"Current Percentage: {percentage}, {facility_num} / {length_df}")
            
        
    

    def handle(self, *args, **options):
        run_start_of_pipeline = True
        export_path = DATA_DIR
        # load all ccn data into df and create facility for each row
        if run_start_of_pipeline == True:
            ccn_care_types = ["ED", "Home Health", "Hospice", "Hospital", "Outpatient"]
            for care_type in ccn_care_types:
                print('ccn care_type', care_type)
                self.load_ccn_data_to_facility_model(export_path, care_type)

            #load_hai must be after the facility has already loaded
            self.load_hai_data_to_facility_model(export_path)
            
            caphs_care_types = ["ED + Others", "Home Health", "Hospice", "Hospitals", "In-Center Hemodialysis", "Nursing Homes", "Outpatient Ambulatory Services"]  # Updated list
            files_with_measures_as_columns = ["Home Health", "Outpatient Ambulatory Services", "Nursing Homes", "In-Center Hemodialysis"]
            all_cahps_df = pd.DataFrame()
            #load all caphs data and merge them into one df
            for care_type in caphs_care_types:
                print('caphs care_type', care_type)
                cur_cahps_df = self.load_caphs_data(export_path, care_type)
                
                #combine caph df into all_caphs_df
                if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
                    all_cahps_df = pd.concat([all_cahps_df, cur_cahps_df])
                else:
                    if all_cahps_df.empty:
                        all_cahps_df = cur_cahps_df
                    else:
                        all_cahps_df = pd.merge(all_cahps_df, cur_cahps_df, how="outer", on="Facility ID")
                        
            all_cahps_df = all_cahps_df.reset_index(drop=True)

            self.create_caphs_json_by_row_of_all_caphs_df(all_cahps_df)
        self.load_lat_long_to_address_model(export_path)