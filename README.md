# Hi Welcome and thanks for checking out our project!

The following documnet will guide you through setting up the system.

Before we get started you're gonna need a couple things.

## Software needed for development

### Python 
- https://www.python.org/downloads/

### Virtual Env
```
brew install viritualenv
```

### Node
- https://nodejs.org/en/download/
we use version v21.2.0

## Install dependencies
Navigate to the root of the project and beging running the following commands:

For the Django project run anytime you open a new terminal 
```
python3 -m venv env // creates vm for project
source ./bin/activate
```

```
python3  -m pip install django
python3  -m pip install django-admin
python3  -m pip install --upgrade pip
python3  -m pip install numpy
python3  -m pip install pandas
python3  -m pip install plotly

```
## Running the project

```
source ./bin/activate
python3 manage.py runserver        
npm start
```

the app runs on http://localhost:8000/

## Intializing Data for project

navigate to this link

 - https://drive.google.com/drive/folders/1ifsqVr1YtBeILiAwf38hdpl8DtNlGdL1

python manage.py startapp core 
python manage.py migrate 
python manage.py createsuperuser
