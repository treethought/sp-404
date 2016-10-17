#!/usr/bin/env python

from setuptools import setup, find_packages

setup(

    options={
        'app': {
            'formal_name': 'Spy-404',
            'bundle': 'com.treethought',
        },
        'macos': {
            'app_requires': [
                'toga-cocoa'
            ],
            'icon': 'icon.png',
        },
        'ios': {
            'app_requires': [
                'toga-ios'
            ],
            'icon': 'images/ios_icon',
            'splash': 'images/ios_splash'
        },
        'android': {
            'app_requires': [
                'toga-android'
            ],
            'icon': 'images/android_icon',
        },
        'tvos': {
            'app_requires': [
                'toga-ios'
            ]
        },
    }
)