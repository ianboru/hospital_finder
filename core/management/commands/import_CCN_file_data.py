from django.core.management.base import BaseCommand

class ImportCCNFileData(BaseCommand):
    help = 'Import CCN File Data'

    def handle(self, *args, **kwargs):
        self.stdout.write('This is my custom command')
        