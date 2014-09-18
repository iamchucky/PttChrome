import sys
from flask import Flask, url_for, render_template
app = Flask(__name__, static_url_path='', static_folder='')

useDev = True
if len(sys.argv) > 1 and sys.argv[1] == 'stable':
  useDev = False

@app.route("/")
def root():
  if useDev:
    return app.send_static_file('dev.html')
  else:
    return app.send_static_file('index.html')

if __name__ == "__main__":
  if useDev:
    print('serving dev')
  app.debug = True
  app.run(host='0.0.0.0', port=80)
