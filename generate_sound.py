import wave
import struct
import math
import os

sample_rate = 44100.0
duration = 0.1 # seconds
frequency = 440.0 # Hz

# Ensure public directory exists
os.makedirs('public', exist_ok=True)

with wave.open('public/hover.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    
    for i in range(int(sample_rate * duration)):
        # Sine wave with exponential decay
        value = int(32767.0 * math.cos(frequency * math.pi * float(i) / float(sample_rate)) * math.exp(-i/(sample_rate*duration/3)))
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)
