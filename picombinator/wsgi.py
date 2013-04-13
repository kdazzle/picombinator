import os, sys
from picombinator import app as application

PROJECT_DIR = os.path.dirname(os.path.realpath(__file__))

activate_this = 'C:/Users/Kyle/Documents/Websites/picombinator/venv/Script/activeate_this.py'
execfile(activate_this, dict(__file__=activate_this))

sys.path.append(PROJECT_DIR)
sys.path.insert(0, "C:/Users/Kyle/Documents/Websites/picombinator/venv/Lib/site-packages/"