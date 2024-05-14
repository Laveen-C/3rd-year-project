# 3rd-year-project
My 3rd year project work on the topic of the re-pairing game.

To use the web application, please follow the steps below:

PREREQUISITES: Make sure you have Python, PyPy (https://www.pypy.org/download.html) and node.js (https://nodejs.org/en/) installed from the following links before proceeding.
Note: If PyPy causes issues, the following instructions will work using the standard python command instead.

1. copy the folder over to a directory of your choosing
2. Open a terminal window at this folder
3. cd into the `backend` folder
4. type the command `pypy -m venv venv` to create the virtual environment (on some machines this may be `pypy3 -m venv venv`
5. activate the virtual environment using the command `source venv/bin/activate` (on windows this will be `venv\Scripts\activate`)
6. Install all dependencies once the virtual environment has been activated using `pip isntall -r requirements.txt`
7. run the flask application using `pypy app.py` (on some machines this may be `pypy3 app.py`)
8. open a new terminal window at the root folder for the project (leaving the previous window open).
9. cd into the `frontend` folder
10. install dependencies using `npm install`
11. run the development server using `npm run dev`

The web application should be running at `http://localhost:5173`, but the terminal window will tell you the domain and port in any case.
