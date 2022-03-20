Dataset catalogue

https://data.cms.gov/provider-data/search?theme=Hospitals

Initialize django project 

https://docs.djangoproject.com/en/4.0/intro/tutorial01/
mkdir <project_name_env>
cd <project_name_env>
python3 -m venv ./
source ./bin/activate
python3 -m pip install django
python3 -m pip install django-admin
./bin/django-admin startproject hospital_finder

python3 -m django-admin startproject <project_name>
cd <project_name>
python manage.py startapp core 
python manage.py migrate 

mkdir data

add "" url to hospital_finder 
add "" url to core and point to index view which points to index html template
add core app to settings installed app