from django.core.management.base import BaseCommand
import os, time, json, sys
import pandas as pd
from core.models.caphs_metrics import CAPHSMetrics
from hospital_finder.settings import DATA_DIR
# facility_id_column = "Facility ID" if "Facility ID" in df.columns else "CMS Certification Number (CCN)"
    
#     measure_column_by_care_type = {
#         "Hospital" : "HCAHPS Question",
#         "Hospice" : "Measure Name",
#         "Emergency" : "Measure Name",
#     }   


class Command(BaseCommand):
    help = 'Import HCAHPS CSV Data'

    def filter_columns_and_convert_to_df(self, df, care_type):
        facility_id_column = "Facility ID" if "Facility ID" in df.columns else "CMS Certification Number (CCN)"
        measure_columns_by_care_type = {
            "Home Health" : [
                "HHCAHPS Survey Summary Star Rating",
                "Star Rating for health team gave care in a professional way",
                "Star Rating for health team communicated well with them",
                "Star Rating team discussed medicines, pain, and home safety",
                "Star Rating for how patients rated overall care from agency"
            ],
            "Outpatient Ambulatory Services" : [
                "Facilities and staff linear mean score",
                "Communication about your procedure linear mean score",
                "Patients' rating of the facility linear mean score",
                "Patients recommending the facility linear mean score"
            ]
        }   

        measure_columns = measure_columns_by_care_type.get(care_type, [])
        selected_columns = [facility_id_column] + measure_columns
        return df[selected_columns]

    def load_hcahps_data_to_db(self, export_path, care_type): 
        hcahps_path = os.path.join(export_path, f"CAHPS - {care_type}.csv")
        hcahps_df = pd.read_csv(hcahps_path, low_memory=False)
        # only using these two care types for now because other care types are not metrics are not properly defined
        files_with_measures_as_columns = ["Home Health", "Outpatient Ambulatory Services"]
        
        if any(file_substring in care_type for file_substring in files_with_measures_as_columns):
            hcahps_df = self.filter_columns_and_convert_to_df(hcahps_df, care_type)
        
        for index, row in hcahps_df.iterrows():
            # Convert the row to a dictionary
            hospital = row.to_dict()  
            # changing dict to json we need json type to save in the instance
            hospital = json.dumps(hospital) 
            caphs_metrics = CAPHSMetrics(caphs_metric_json=hospital)
            caphs_metrics.save()
            
        return hcahps_df

    def create_instance_for_each_hcaphs(self, export_path, care_types):
        export_path = DATA_DIR
        care_types = ["Outpatient Ambulatory Services", "Home Health", "Hospice", "Hospitals", "Nursing Homes"]
        
        for care_type in care_types:
            self.load_hcahps_data_to_db(export_path, care_type)
            
    def handle(self, *args, **options):
        export_path = DATA_DIR
        care_types = ["Outpatient Ambulatory Services", "Home Health", "Hospice", "Hospitals", "Nursing Homes"]
        self.create_instance_for_each_hcaphs(export_path, care_types)
        
    