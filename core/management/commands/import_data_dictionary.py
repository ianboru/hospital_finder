from django.core.management.base import BaseCommand
import os, json
import pandas as pd
from core.models.data_dictionary import DataDictionaryModel  
from django.core.management.base import BaseCommand, CommandError 
from core.models.data_type import CARE_TYPE_CHOICES 
from hospital_finder.settings import DATA_DIR

class Command(BaseCommand):
    help = 'Import HealthcareMetrics from a CSV file using pandas'

    def handle(self, *args, **kwargs):
        export_path = DATA_DIR
        
        try:
            # Use pandas to read the CSV file into a DataFrame
            data_dictionary_path = os.path.join(export_path, f"data_dictionary.csv")
            #skipping 2 rows because current csv file doesn't have any value in them
            data_dictionary_df = pd.read_csv(data_dictionary_path, low_memory=False, encoding='unicode_escape', skiprows=2)
 
            # List of columns to keep (only include the columns that map to your DataDictionaryModel)
            columns_to_keep = ['CMS Term', 'Term', 'Source (File)', 'Care Type', 'Definition', 'Definition Confidence', 'Location in website']

            # Drop unwanted columns by keeping only those that are in `columns_to_keep`
            data_dictionary_df = data_dictionary_df[columns_to_keep]

            for index, row in data_dictionary_df.iterrows():
                cms_term = row['CMS Term']
                term = row['Term']
                source_file = row.get('Source (File)', None)
                care_types = row['Care Type'].split(',')
                definition = row['Definition']
                definition_confidence = row.get('Definition Confidence', None)
                location_in_website = row.get('Location in website', None)

                # Create or update the DataDictionaryModel object
                metric, created = DataDictionaryModel.objects.update_or_create(
                    term=term,
                    defaults={
                        'cms_term': cms_term,
                        'source_file': source_file,
                        'care_types': care_types,
                        'definition': definition,
                        'definition_confidence': definition_confidence,
                        'location_in_website': location_in_website,
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created DataDictionaryModel: {term}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Updated DataDictionaryModel: {term}'))

        except FileNotFoundError:
            raise CommandError(f"File data_dictionary does not exist")
        except pd.errors.EmptyDataError:
            raise CommandError(f"File data_dictionary is empty")
        except Exception as e:
            raise CommandError(f"Error occurred: {str(e)}")

        self.stdout.write(self.style.SUCCESS('CSV import process completed!'))