import json

import requests
from django.core.management.base import BaseCommand

from promgen import prometheus
from promgen.signals import trigger_write_config, trigger_write_rules, trigger_write_urls


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('target_file')

    def handle(self, target_file, **kwargs):
        if target_file.startswith('http'):
            config = requests.get(target_file).json()
        else:
            config = json.load(open(target_file), encoding='utf8')
        prometheus.import_config(config)
        trigger_write_config.send(self, force=True)
        trigger_write_rules.send(self, force=True)
        trigger_write_urls.send(self, force=True)
