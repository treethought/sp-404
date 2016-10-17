import os
from collections import OrderedDict
from flask import Flask, url_for, render_template, jsonify, request, make_response, session, redirect
import webview
import app
from sample_pads import Sampler


# APP_ROOT = os.path.dirname(os.pardir(os.pardir(os.path.abspath(__file__))))
APP_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
static_dir = os.path.join(APP_ROOT, 'static')
templates_dir = os.path.join(APP_ROOT, 'templates')

# gui_dir = os.path.join(os.getcwd(), "gui")  # development path
if not os.path.exists(static_dir):  # frozen executable path
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")


# server = Flask(__name__, static_folder=gui_dir, static_path='/static', template_folder=gui_dir)
server = Flask(__name__, static_path='/static',
               static_folder=static_dir, template_folder=templates_dir)

server.config["SEND_FILE_MAX_AGE_DEFAULT"] = 1  # disable caching
server.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'  # TODO regenerate and hide

sampler = Sampler(12)


@server.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store'
    return response


@server.route("/init")
def initialize():
    """
    Perform heavy-lifting initialization asynchronously.
    :return:
    """

    if True:
        response = {
            "status": "ok",
        }
    else:
        response = {
            "status": "error"
        }

    return jsonify(response)


@server.route("/")
def landing():
    """
    Render index.html. Initialization is performed asynchronously in initialize() function
    """
    return render_template("index.html")


@server.route('/trigger/<pad_num>', methods=['POST'])
def trigger(pad_num):
    """Plays or stops pad appropiately"""
    response = sampler.trigger(int(pad_num))
    return jsonify(**response)


@server.route('/toggle_loop/<pad_num>', methods=['POST'])
def toggle_loop(pad_num):
    response = sampler.toggle_loop(int(pad_num))
    return jsonify(**response)


@server.route('/record', methods=['POST'])
def record():
    response = sampler.record()
    return jsonify(**response)


@server.route('/stop_recording', methods=['POST'])
def stop_recording():
    response = sampler.stop_recording()
    return jsonify(**response)


@server.route("/choose/path")
def choose_path():
    """
    Invoke a folder selection dialog here
    :return:
    """
    dirs = webview.create_file_dialog(webview.FOLDER_DIALOG)
    if dirs and len(dirs) > 0:
        directory = dirs[0]
        if isinstance(directory, bytes):
            directory = directory.decode("utf-8")

        response = {"status": "ok", "directory": directory}
    else:
        response = {"status": "cancel"}

    return jsonify(response)


@server.route("/do/stuff")
def do_stuff():
    result = app.do_stuff()

    if result:
        response = {"status": "ok", "result": result}
    else:
        response = {"status": "error"}

    return jsonify(response)


def run_server():
    server.run(host="127.0.0.1", port=23948, threaded=True)


if __name__ == "__main__":
    run_server()
