from django.core.management.base import BaseCommand
import os, json
import pandas as pd
import numpy as np
from core.models.facility_data import CAPHSMetrics, HAIMetrics 
from core.models.facility import Facility, Address
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
            
        cur_columns = provider_df.columns
        rename_address_map = None
        if "Address Line 1" in cur_columns:
            rename_address_map = {"Address Line 1" : "Address"}    
        if "Provider Address" in cur_columns:
            rename_address_map = {"Provider Address" : "Address"}   
        if rename_address_map:
            provider_df.rename(columns=rename_address_map, inplace=True)
          
        ccn_facility_df = self.filter_columns(facility_type, provider_df)

        percentage = 0
        for index, row in ccn_facility_df.iterrows():
            facility_id_column = "Facility ID" if "Facility ID" in ccn_facility_df.columns else "CMS Certification Number (CCN)"
            ccn_facility_df[facility_id_column] = ccn_facility_df[facility_id_column].str.replace('"',"")
            ccn_facility_df[facility_id_column] = ccn_facility_df[facility_id_column].str.lstrip('0')
            #print(ccn_facility_df[facility_id])
            facility_id = ccn_facility_df[facility_id_column][index]
            current_facility = None
            if Facility.objects.filter(facility_id=facility_id, care_types__contains=[care_type]):
                # we don't want to create duplicate facility data so if facility exists then go to the next row
                pass
            elif Facility.objects.filter(facility_id=facility_id):
                # if one facility has more than one care type we want to add it to the care types list 
                current_facility = Facility.objects.filter(facility_id=facility_id).first()
                current_facility.care_types.append(care_type)
                current_facility.save()
            else:
                current_facility = Facility.objects.create(
                    facility_name = row['Facility Name'],
                    facility_id = row[facility_id],
                    care_types = [care_type]
                )
                address = Address.objects.create(
                        zip=row['ZIP Code'],
                        street=row['Address'],  
                        city=row['City/Town'],
                        )
                current_facility.address = address
                current_facility.save()

            percentage = round(100 * index / len(ccn_facility_df))
            if index % 500 == 0:
                print(f"Current CCN loading Percentage: {percentage}, {index} / {len(ccn_facility_df)}")
                
    def extract_questions_as_rows(self, df, care_type): 
        measure_name_column_by_care_type = {
        "Hospitals" : "HCAHPS Question",
        "Hospice" : "Measure Name",
        "ED + Others" : "Measure Name",
        "Outpatient" : "Measure Name"
        }   
         
        measure_value_column_by_care_type = {
            "Hospitals" : "Patient Survey Star Rating",
            "Hospice" : "Score",
            "ED + Others" : "Score",
            "Outpatient" : "Score"
        }
        column_name_from_values = [
            #"Family caregiver survey rating",
            "Ambulatory Quality Measures - Mean Linear Scores",
            "Emergency department volume",
            "Staff responsiveness - star rating",
            "Care transition - star rating",
            "Cleanliness - star rating",
            "Quietness - star rating",
            "Facilities and staff linear mean score",
            "Patients who reported that staff definitely communicated about what to expect during and after the procedure",
            "The hospice team provided the right amount of emotional and spiritual support",
            "YES, they would definitely recommend the hospice",
            "The hospice team always treated the patient with respect",
            "The patient always got the help they needed for pain and symptoms",
            "The hospice team always communicated well",
            "The hospice team always provided timely help",
            "They definitely received the training they needed",
            "Family caregiver survey rating",
            "Nurse communication - star rating",
            "Doctor communication - star rating",
            "Staff responsiveness - star rating",
            "Communication about medicines - star rating",
            "Discharge information - star rating",
            "Summary star rating",
            "Average (median) time patients spent in the emergency department before leaving from the visit A lower number of minutes is better",
            "Left before being seen",
            "Head CT results",
            "Emergency department volume",
        ]
        
        # measure_name_column value is a column name 
        measure_name_column = measure_name_column_by_care_type[care_type]
        measure_value_column = measure_value_column_by_care_type[care_type]
        individual_measures = df[measure_name_column].unique()
        individual_measures = list(set(column_name_from_values).intersection(set(individual_measures)))
        measures_per_facility = pd.DataFrame()
        for measure in individual_measures:
            measure_values = df[[measure_value_column, "Facility ID","Address"]].loc[df[measure_name_column] == measure]
            column_map = {}
            column_map[measure_value_column] = measure
            measure_values = measure_values.rename(columns=column_map)
            if measures_per_facility.empty:
                print("was empty")
                measures_per_facility = measure_values
            else:
                cols_to_use = measure_values.columns.difference(measures_per_facility.columns)
                measures_per_facility = pd.merge(measures_per_facility, measure_values[cols_to_use], left_index=True, right_index=True, how='outer')

                #measures_per_facility = pd.merge(measures_per_facility, measure_values, on="Facility ID")
        measures_per_facility = measures_per_facility.reset_index(drop=True)
        return measures_per_facility
        
    def load_caphs_data(self, export_path, care_type):
        provider_path = os.path.join(export_path, f"CAHPS - {care_type}.csv")
        files_with_measures_as_columns = ["Home Health", "Outpatient Ambulatory Services", "Nursing Homes", "In-Center Hemodialysis"]

        caphs_df = pd.read_csv(provider_path, low_memory=False, encoding='unicode_escape')
        print('Starting Extraction')
        if "CMS Certification Number (CCN)" in caphs_df.columns:
            caphs_df = caphs_df.rename(columns={"CMS Certification Number (CCN)": "Facility ID"})

        rename_address_map = None
        cur_columns = caphs_df.columns
        if "Address Line 1" in cur_columns:
            rename_address_map = {"Address Line 1" : "Address"}    
        if "Provider Address" in cur_columns:
            rename_address_map = {"Provider Address" : "Address"}   
        if rename_address_map:
            caphs_df.rename(columns=rename_address_map, inplace=True)

        
        if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
            # filter column
            print("measures as columns")
            measure_columns_by_care_type = {
                "Home Health" : [
                    "HHCAHPS Survey Summary Star Rating",
                ],
                "Outpatient Ambulatory Services" : [
                    "Patients' rating of the facility linear mean score",
                    "Patients who reported YES they would DEFINITELY recommend the facility to family or friends",
                    "Facilities and staff linear mean score",
                    "Patients who reported that staff definitely communicated about what to expect during and after the procedure",
                    "Patients who reported that staff definitely gave care in a professional way and the facility was clean",
                ],
                "Nursing Homes" : [
                    "Overall Rating",
                    "Health Inspection Rating",
                    "QM Rating",
                    "Long-Stay QM Rating",
                    "Short-Stay QM Rating",
                    "Staffing Rating",
                    "Abuse Icon",
                ],
                "In-Center Hemodialysis" : [
                    "Five Star",
                    "Patient Infection category text",
                    "Patient Survival Category Text",
                    "Patient hospitalization category text",
                    "Patient Hospital Readmission Category",
                    "Patient Transfusion category text",
                    "Fistula Category Text",
                ]

            }   

            final_caphs_df = caphs_df[measure_columns_by_care_type[care_type] + ["Facility ID"]]
            if 'Address' in caphs_df.columns and 'Facility Name' in caphs_df.columns:
                print('Merging Metadata to caphs_df')
                facility_metadata_df = caphs_df[["Address", "Facility Name", "City/Town", "State", "ZIP Code", "Facility ID"]]
                facility_metadata_df = facility_metadata_df.drop_duplicates()
                final_caphs_df = pd.merge(final_caphs_df, facility_metadata_df, on="Facility ID") 
            else:
                print('No Existing Address Metric for caretype') 
                print(care_type)
        else:
            final_caphs_df = self.extract_questions_as_rows(caphs_df, care_type)
        
        final_caphs_df = final_caphs_df.drop_duplicates()
        print('Measure Extraction Complete')
        
        final_caphs_df['Care Type'] = care_type
        return final_caphs_df
        
    def create_caphs_json_by_row_of_all_caphs_df(self, all_cahps_df):
        num_rows = len(all_cahps_df)
        last_progress_percent = 0
        for index, row in all_cahps_df.iterrows():
            # Convert the row to a dictionary
            cur_facility_id = str(row["Facility ID"])
            if "Outpatient" in row["Care Type"]:
                row["Care Type"] = "Outpatient"
            hospital = row.to_dict()  
            # changing dict to json we need json type to save in the instance
            hospital = json.dumps(hospital) 
            facility = None
            print("json facility creator", cur_facility_id)
            if "12500" in cur_facility_id:
                print("LOOKING HERE FOR 12500")
                print(row)
            if Facility.objects.filter(facility_id=cur_facility_id):
                
                facility = Facility.objects.filter(facility_id=cur_facility_id).first()
                if "12500" in cur_facility_id:
                    print("condition 1")
                    print(facility)
                caphs_metrics = CAPHSMetrics(
                    caphs_metric_json=hospital,
                    facility=facility
                )
                caphs_metrics.save()
                if not facility.address and 'Address' in row and 'ZIP Code' in row:
                    
                    address = Address.objects.create(street=row["Address"], city=row["City/Town"], zip=row['ZIP Code'])
                    facility.address = address
                if not facility.facility_name:
                    facility.facility_name = row["Facility Name"]
                print(facility.care_types, row["Care Type"])
                if facility.care_types:
                    facility.care_types = [row["Care Type"]]
                facility.save()
            else:
                print(row)
                if 'Address' in row and 'ZIP Code' in row:
                    address = Address.objects.create(street=row["Address"], city=row["City/Town"], zip=row['ZIP Code'])
                    facility = Facility.objects.create(facility_name=row["Facility Name"], facility_id=cur_facility_id, care_types=[row["Care Type"]], address=address)
            if facility:
                caphs_metrics = CAPHSMetrics(
                    caphs_metric_json=hospital,
                    facility=facility
                )
                caphs_metrics.save()
            progress_percent = round(100*index/num_rows)
            if progress_percent % 5 == 0 and progress_percent != last_progress_percent:
                print("progress ", progress_percent)
                last_progress_percent = progress_percent



    def load_hai_data_to_facility_model(self, export_path):
        print("loading HAI data")
        hai_path = os.path.join(export_path, "hai_summary_metrics.csv")
        hai_df = pd.read_csv(hai_path, low_memory=False, encoding='unicode_escape')
        hai_df["Facility ID"] = hai_df["Facility ID"].str.lstrip('0')
            
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
        print("Adding Latitude and Longitude :\n")
        lat_long_df = lat_long_df[['Facility ID', 'latitude', 'longitude']]

        for index, row in lat_long_df.iterrows():
            facility_id = row['Facility ID']
            latitude = row['latitude']
            longitude = row['longitude']
            

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
                #print(f"Facility with ID {facility_id} not found or has no address.")
                pass
            percentage = round(100 * facility_num / length_df)
            if facility_num % 500 == 0:
                print(f"Current Lat/Long Percentage: {percentage}, {facility_num} / {length_df}")
            
        
    

    def handle(self, *args, **options):
        run_start_of_pipeline = True
        run_load_ccn_data = False
        run_load_hai_data = False
        run_load_caphs_data = True
        run_load_lat_long_data = False 
        export_path = DATA_DIR
        # load all ccn data into df and create facility for each row

        if run_start_of_pipeline == True:
            if run_load_ccn_data == True:
                ccn_care_types = ["ED", "Home Health", "Hospice", "Hospital", "Outpatient"]
                for care_type in ccn_care_types:
                    print('ccn care_type', care_type)
                    self.load_ccn_data_to_facility_model(export_path, care_type)


            if run_load_hai_data == True:
                # load_hai must be after the facility has already loaded
                self.load_hai_data_to_facility_model(export_path)
            
            if run_load_caphs_data == True:
                caphs_care_types = [ "Outpatient Ambulatory Services","ED + Others", "Home Health", "Hospice", "Hospitals", "In-Center Hemodialysis", "Nursing Homes"]  # Updated list
                files_with_measures_as_columns = ["Home Health", "Outpatient", "Nursing Homes", "In-Center Hemodialysis"]
                all_cahps_df = pd.DataFrame()
                #load all caphs data and merge them into one df
                for care_type in caphs_care_types:
                    print('caphs care_type', care_type)
                    cur_cahps_df = self.load_caphs_data(export_path, care_type)
                    cur_cahps_df = cur_cahps_df.reset_index(drop=True)
                    all_cahps_df = all_cahps_df.reset_index(drop=True)
                    #combine caph df into all_caphs_df
                    #cols_to_use = all_cahps_df.columns.difference(cur_cahps_df.columns)

                    if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
                        all_cahps_df = pd.concat([all_cahps_df, cur_cahps_df])
                        #all_cahps_df = pd.merge(all_cahps_df, cur_cahps_df[cols_to_use], how="outer", on="Facility ID")

                    else:
                        if all_cahps_df.empty:
                            all_cahps_df = cur_cahps_df
                        else:
                            all_cahps_df = pd.merge(all_cahps_df, cur_cahps_df, how="outer", on="Facility ID")
                all_cahps_df = all_cahps_df.reset_index(drop=True)
                print("starting caphs db loading")
                self.create_caphs_json_by_row_of_all_caphs_df(all_cahps_df)
        if run_load_lat_long_data:
            self.load_lat_long_to_address_model(export_path)

