import sys
from flask import Flask, url_for, render_template
app = Flask(__name__, static_url_path='')

useDev = False
if len(sys.argv) > 1 and sys.argv[1] == 'dev':
  useDev = True

@app.route("/")
def root():
  if useDev:
    return render_template('dev.html')
  else:
    return render_template('index.html')

if __name__ == "__main__":
  if useDev:
    print 'serving dev'
  app.debug = True
  app.run(port=80)
