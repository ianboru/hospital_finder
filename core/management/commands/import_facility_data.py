from django.core.management.base import BaseCommand
import os
import pandas as pd
from core.models.facility_data import CAPHSMetrics
from core.models.facility import Facility, Address
from core.models.facility_data import HAIMetrics
from hospital_finder.settings import DATA_DIR

class Command(BaseCommand):
    help = 'Import Patient Data'

    def filter_columns(self, care_type, facility_type, facility_df):
        facility_id_column = "Facility ID" if "Facility ID" in facility_df.columns else "CMS Certification Number (CCN)"
        facility_df = facility_df.drop_duplicates()
        print("facility_id_column", facility_id_column)
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
        
        ccn_facility_df = self.filter_columns(care_type, facility_type, provider_df)
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

    def load_hai_data_to_facility_model(self, export_path):
        hai_path = os.path.join(export_path, "HAI.csv")
        hai_df = pd.read_csv(hai_path, low_memory=False, encoding='unicode_escape')

        for index, row in hai_df.iterrows():
            facility_id = row['Facility ID']
            facility = Facility.objects.filter(facility_id=facility_id).first()
            if facility:
                measure_id = row['Measure ID']
                measure_name = row['Measure Name']
                compared_to_national = row['Compared to National']
                score = row['Score']

                hai_metrics, created = HAIMetrics.objects.get_or_create(
                    facility = facility,
                    defaults={
                        'measure_id' : measure_id,
                        'measure_name': measure_name,
                        'compared_to_national': compared_to_national,
                        'score': score,
                    }
                )
                hai_metrics.save()

            
    def handle(self, *args, **options):
        export_path = DATA_DIR
        # only using these two care types for now because other care types metrics are not properly defined
        caphs_care_types = ["Home Health", "Outpatient Ambulatory Services"]
        ccn_care_types = ["ED", "Home Health", "Hospice", "Hospital", "Outpatient"]
        # care_types = ["Outpatient Ambulatory Services", "Home Health", "Hospice", "Hospitals", "Nursing Homes"]
        # self.create_instance_for_each_hcaphs(export_path, care_types)
        for care_type in ccn_care_types:
            print('care_type', care_type)
            self.load_ccn_data_to_facility_model(export_path, care_type)

        #load_hai must be after the facility has already loaded
        self.load_hai_data_to_facility_model(export_path)
        
    