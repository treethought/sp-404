import pyaudio
import pydub
import wave
import time
import threading
import os
import logging
import shutil


from collections import OrderedDict

from config import *

logging.basicConfig(level=logging.DEBUG,
                    format='(%(threadName)-10s) %(message)s',
                    )

# Settings for Reading/Writing wav files
FORMAT = pyaudio.paInt16
WIDTH = 2
CHANNELS = 2
RATE = 44100  # samples per second (Hz)
CHUNK = 1024


class Pad(object):  # TODO: making recorcer class into Sample method
    """Provides interface for recording and playing pydub audio sample.

    Each instance provides control for one sample file.
    Recording and playback occur within seperate threads, and allow for multiple instance to play audio through 
    seperate pyaudio streams at once.
    """

    def __init__(self, pad_num, loop=False):
        self.number = pad_num
        # print('TYPE OF NUM IS {}'.format(type(self.number)))

        self.file = os.path.join(SAMPLES, '{}.wav'.format(self.number))
        self.port = pyaudio.PyAudio()
        # self.sample = pydub.AudioSegment.from_wav(self.file)
        # self._is_playing = False
        self._playing = threading.Event()
        self._armed = threading.Event()
        self._loop = threading.Event()

        #

    def __repr__(self):
        # return "pad{}".format(self.number)
        return str(self.number)

    """For playing pad"""
    @property
    def is_playing(self):
        return self._playing.is_set()

    def _trigger(self):
        self._playing.set()
        self._player = PlayThread(self)

    def play(self):
        self._trigger()
        self._player.start()

    def stop_playing(self):
        self._playing.clear()

    """For looping attribute"""
    @property
    def loop_is_set(self):
        return self._loop.is_set()

    def toggle_loop(self):
        if self.loop_is_set:
            self.clear_loop()
        else:
            self.set_loop()

    def set_loop(self):
        self._loop.set()

    def clear_loop(self):
        self._loop.clear()

    """For recording to pad"""
    @property
    def is_armed(self):
        return self._armed.is_set()

    def arm(self):
        self._armed.set()

    def disarm(self):
        """Disarms Pad for recording, or stops current recording"""
        self._armed.clear()

    def record(self):
        self.arm()
        self._recorder = RecordThread(self)  # make self.recorder attribute so
        self._recorder.start()  # can cancel it from pad if needed

    def stop_recording(self):
        """Disarms recorder thread, and waits/blocks til thread joins"""
        self.disarm()
        self._recorder.join()

    @property  # TODO: chamge tests for sample property
    def sample(self):
        try:
            self._segments = pydub.AudioSegment.from_wav(self.file)
        except FileNotFoundError:
            print('need to make file')
            with open(self.file, 'w+') as f:
                f.close()
            self.sample()
        return self._segments

    def save(self, frames):
        """Creates new file if one doesn't exist"""
        try:
            prev_segs = self.sample
            f = wave.open(self.file, 'wb')
            f.setnchannels(CHANNELS)
            f.setsampwidth(self.port.get_sample_size(FORMAT))
            f.setframerate(RATE)
            f.writeframes(b''.join(frames))
            f.close()
            print('closed file')

            new_segs = self.sample
            assert(prev_segs is not new_segs)

        except FileNotFoundError:
            print('need to make file')
            f = open(self.file)
            f.close()


class RecordThread(threading.Thread):
    """Spawns a new thread to open an input stream and saves input to Pad.file
        Runs until pad.armed is set to False

        Records by to a pad by opening the
        Pad's pyAdudio port and saving to Pad.file"""

    def __init__(self, pad_object):
        threading.Thread.__init__(self)
        # super(Recorder).__init__()
        self.pad = pad_object
        self.name = "Pad {} RecordThread".format(self.pad.number)

    def run(self):

        frames = []
        stream = self.pad.port.open(format=FORMAT, channels=CHANNELS,
                                    rate=RATE, input=True,
                                    frames_per_buffer=CHUNK)
        while self.pad.is_armed:
            data = stream.read(CHUNK)
            frames.append(data)

        stream.stop_stream()  # TODO: have stop_sstream be called by toggling record box off
        stream.close()

        self.pad.save(frames)
        return

    def start_during_playback(self):
        """Records using the callback method, so stream is in seperate thread.
          Can Record and Output simultaneously. Playsback immediately.

          **CAREFUL WITH MICROPHONE --> FEEDBACK. For use with line.
          """

        frames = []  # frames of samples to write to file

        def callback(in_data, frame_count, time_info, status):
            new_frames = wf.readframes(frame_count)
            frames.append(new_frames)
            return (in_data, pyaudio.paContinue)

        stream = self.pad.sampleportopen(format=self.pad.sampleportget_format_from_width(2),
                                         # TODO: maybe make new pyaudio port instead of pads
                                         # playback
                                         channels=CHANNELS, rate=RATE,
                                         input=True, output=True,
                                         stream_callback=callback)

        stream.start_stream()
        while stream.is_active():
            time.sleep(0.1)
        stream.stop_stream()
        stream.close()
        self.save(frames)


class PlayThread(threading.Thread):
    """Takes Pad object in constructor. Spawns playback in separate thread.
        Begin playback by calling start(), and stop playback by setting Pad.is_playing to False (Pad.stop())"""

    def __init__(self, pad_object):
        threading.Thread.__init__(self)

        self.pad = pad_object
        self.name = "Pad {} PlayThread".format(self.pad.number)
        self.stream = self.pad.port.open(format=self.pad.port.get_format_from_width(self.pad.sample.sample_width),
                                         channels=self.pad.sample.channels,
                                         rate=self.pad.sample.frame_rate,
                                         output=True)
        self.loop_count = 0

    def play_sample(self):
        """Snippet from pydub.playback so we can keep the stream open (pydub closes after play"""
        from pydub.utils import make_chunks
        segs = self.pad.sample + 8
        # segs = segs.reverse() # REVERSE TODO: reverse and other effects

        for chunk in make_chunks(segs, 50):  # only doing this causes lag between loops
            self.stream.write(chunk._data)  # because the stream gets closed inside pydub
            if not self.pad.is_playing:
                break

    def end(self):

        self.stream.stop_stream()
        self.stream.close()
        self.pad.stop_playing()

        # self.loop_count = 0

    def run(self):

        logging.debug('{} started - loop is {}, playing is {}'.format(self.name,
                                                                      self.pad.loop_is_set, self.pad.is_playing))

        while self.pad.is_playing:
            assert (self.pad.is_playing)
            # logging.debug('{} began looping'.format(self.name))
            if self.pad.loop_is_set:
                self.play_sample()
                self.loop_count += 1
                # logging.debug("{} has looped {} times - loop is {}".format(self.name, self.loop_count, self.pad.loop_is_set))

            else:
                logging.debug('{} playing once'.format(self.name))
                self.play_sample()
                # self.pad.stop_playing()
                break

        self.end()

        return


class Sampler(object):
    """Interface for controlling a multiple Pad objects"""

    def __init__(self, size):
        super(Sampler, self).__init__()
        self._size = size
        self._pads = self._load_pads()
  

    def _load_pads(self):
        pads = OrderedDict()
        for pad_num in range(1, self._size + 1):
            pads[pad_num] = Pad(pad_num)
        return pads

    def _report_status(self):
        status = {
            'playing': [self.pad[p].number for p in self._pads if self.pad[p].is_playing],
            'not_playing': [self.pad[p].number for p in self._pads if not self.pad[p].is_playing],
            'recording': [self.pad[p].number for p in self._pads if self.pad[p].is_armed],
            'loop': [self.pad[p].number for p in self._pads if self.pad[p].loop_is_set],
        }
        return status

    @property
    def status(self):
        return self._report_status()

    @property
    def pad(self):
        """Returns an OrderedDict, so pads are accessed with the integer of pad_num as a key"""
        return self._pads

    def trigger(self, pad_num):
        if self.pad[pad_num].is_playing:
            self.pad[pad_num].stop_playing()
        else:
            self.pad[pad_num].play()
        return self.status

    def stop(self, pad_num):
        self.pad[pad_num].stop_playing()
        return self.status

    def stop_all(self):
        for pad_num in self.status['playing']:
            self.pad[pad_num].stop_playing()
        return self.status

    def record(self, pad_num):  # TODO: Do record differently for resampling
                            # maybe open a record thread and record to only one pad
        self.pad[pad_num].record()
        return self.status

    def stop_recording(self):
        for pad_num in self.status['recording']:
            self.pad[pad_num].stop_recording()
        return self.status


    # def stop_recording(self, pad_nums):  # TODO: Possibly end recording at thread level
    #     for pad_num in pad_nums:
    #         self.pad[pad_num].stop_recording()
    #     return self.status

    def toggle_loop(self, pad_num):  # TODO prbly loop only one pad at time?
        self.pad[pad_num].toggle_loop()
        return self.status




