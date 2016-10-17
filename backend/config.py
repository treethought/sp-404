import os

APP_ROOT = os.path.dirname(os.path.dirname((__file__)))
GUI = os.path.join(APP_ROOT, 'static')
IMAGES = os.path.join(GUI, 'images')
SAMPLES = os.path.join(GUI, 'wav_files')

print(GUI)

