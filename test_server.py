from flask import Flask, url_for, render_template
app = Flask(__name__, static_url_path='')

@app.route("/")
def root():
  return render_template('dev.html')

if __name__ == "__main__":
  app.debug = True
  app.run(port=80)
