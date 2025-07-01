# Hi Welcome and thanks for checking out our project!

The following documnet will guide you through setting up the system.

Before we get started you're gonna need a couple things.

## Software needed for development

### Python (3.11+)
- https://www.python.org/downloads/

### Virtual Env
```
brew install viritualenv
```

### Node
- https://nodejs.org/en/download/
we use version v21.2.0

Check the node version is v21.2.0, and install packages
```
node --version
npm install
```

On linux if you get SSL errors you may need to enable legacy OpenSSL

```
export NODE_OPTIONS=--openssl-legacy-provider
```
## Install dependencies
Navigate to the root of the project and beging running the following commands:

For the Django project run anytime you open a new terminal
```
python3 -m venv env // creates vm for project
source env/bin/activate
```

Inside the virtual environment (env), install dependancies
```
pip install -r requirements.txt
```
## Running the project

```
source env/bin/activate
python3 manage.py runserver
# In a seperate terminal run npm start
npm start
```

the app runs on http://localhost:8000/

## Intializing Data for project

navigate to this link, copy the csvs to the data directory

 - https://drive.google.com/drive/folders/1ifsqVr1YtBeILiAwf38hdpl8DtNlGdL1

```
python manage.py migrate
```


// DATABASE AND PGSQL INSTRUCTIONS

brew install postgresql
pip install psycopg2
brew list postgresql@14

// start postgresql
brew services start postgresql
// If the above doesn't work use this command
brew services restart postgresql

// 
export DYLD_LIBRARY_PATH="/opt/homebrew/Cellar/postgresql@14/14.10_1/lib:$DYLD_LIBRARY_PATH"

// reload your shell
source ~/.zshrc  # or source ~/.bash_profile

// 
brew link --force --overwrite postgresql@14

---linux---
sudo su - postgres
/etc/postgresql/15/main/pg_hba.conf
 set authentication to trust in pg_hba.conf 
 systemctl restart postgresql.service
-----------
// create db
createdb hospital_finder

// start the shell for the selected db
psql -d hospital_finder


CREATE DATABASE hospital_finder;
CREATE USER ian;
ALTER ROLE ian SET client_encoding TO 'utf8';
ALTER ROLE ian SET default_transaction_isolation TO 'read committed';
ALTER ROLE ian SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE hospital_finder TO ian;
ALTER DATABASE hospital_finder OWNER TO ian;
GRANT USAGE, CREATE ON SCHEMA PUBLIC TO ian;


// this is the required port for postgresql 
DB_HOST=localhost
DB_PORT=5432


//TO CREATE SUPERUSER

//create the super user 
python3 manage.py createsuperuser

//You will be prompted for username, emial, password, then password confirmation

//to open the shell
python manage.py shell

//import the user in the shell
from django.contrib.auth.models import User

//grab the user
user = User.objects.get(username='your_username')

//to delete the user
user.delete()

//to adjust user email
user.email = 'new_email@example.com'

//to save
user.save()

//to exit the shell
exit()






# COMMON ISSUES
### SETTING UP THE DATABASE
at line 116 in `core/views.py` comment out lines 116-125.