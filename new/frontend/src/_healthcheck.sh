#!/usr/bin/env sh
set -eu
curl -s 127.0.0.1:80 | grep -q '^<!doctype html>'
