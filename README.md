Dataset catalogue

https://data.cms.gov/provider-data/search?theme=Hospitals

Initialize django project 

https://docs.djangoproject.com/en/4.0/intro/tutorial01/
mkdir <project_name_env>
cd <project_name_env>
python3 -m venv ./
source ./bin/activate
./bin/python3  -m pip install django
./bin/python3  -m pip install django-admin
./bin/python3  -m pip install --upgrade pip
./bin/python3  -m pip install numpy
./bin/python3  -m pip install pandas
./bin/django-admin startproject hospital_finder

python3 -m django-admin startproject <project_name>
cd <project_name>
python manage.py startapp core 
python manage.py migrate 

add .gitignore
create remote repo
add remote 

mkdir data

add "" url to hospital_finder 
add "" url to core and point to index view which points to index html template
add core app to settings installed app

