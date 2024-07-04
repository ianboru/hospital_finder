from django.core.management.base import BaseCommand
import os, time, json, sys, hashlib
import pandas as pd
from core.models.facility_data import CAPHSMetrics
from core.models.facility import Facility, Address
from hospital_finder.settings import DATA_DIR

class Command(BaseCommand):
    help = 'Import Patient Data'

    def filter_columns_and_convert_to_df(self, care_type, facility_type, facility_df):
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
        
        ccn_facility_df = self.filter_columns_and_convert_to_df(care_type, facility_type, provider_df)
        for index, row in ccn_facility_df.iterrows():
            facility_id = "Facility ID" if "Facility ID" in ccn_facility_df.columns else "CMS Certification Number (CCN)"
            # create_address_instance = Address.objects.create(
            #     zip=row['ZIP Code'],
            #     street=row['Address'],
            #     city=row['City/Town'],
            # )
            if Facility.objects.filter(facility_id=row[facility_id]):
                pass
            else: 
                create_facility_instance = Facility.objects.create(
                    facility_name = row['Facility Name'],
                    facility_id = row[facility_id],
                    care_type = care_type,
                    address = Address.objects.create(
                        zip=row['ZIP Code'],
                        street=row['Address'],
                        city=row['City/Town'],
                        )
                )
                create_facility_instance.save()
    
    def create_instance_for_each_provider(self, export_path, ccn_care_types):
        for care_type in ccn_care_types:
            print('care_type', care_type)
            self.load_ccn_data_to_facility_model(export_path, care_type)
            
    def handle(self, *args, **options):
        export_path = DATA_DIR
        # only using these two care types for now because other care types metrics are not properly defined
        caphs_care_types = ["Home Health", "Outpatient Ambulatory Services"]
        ccn_care_types = ["ED", "Home Health", "Hospice", "Hospital", "Outpatient"]
        # care_types = ["Outpatient Ambulatory Services", "Home Health", "Hospice", "Hospitals", "Nursing Homes"]
        # self.create_instance_for_each_hcaphs(export_path, care_types)
        self.create_instance_for_each_provider(export_path, ccn_care_types)
        
    