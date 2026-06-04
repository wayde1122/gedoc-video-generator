import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {clampNumber, getVoiceSpeed} from '../config';
import type {VoiceProvider, VoiceProviderContext, VoiceRequest} from '../types';

const execFileAsync = promisify(execFile);

const escapePowerShellSingleQuoted = (value: string) => value.replaceAll("'", "''");

export const createWindowsSpeechProvider = ({env, tempDir}: VoiceProviderContext): VoiceProvider => {
  const speed = getVoiceSpeed(env);
  const windowsRate = Math.round(clampNumber((speed - 1) * 10, -10, 10));

  return {
    id: 'windows-speech',
    label: 'Windows zh-CN speech',
    async isAvailable() {
      return process.platform === 'win32';
    },
    async synthesize({text, outputName}: VoiceRequest) {
      if (process.platform !== 'win32') {
        throw new Error('Windows speech synthesis is only available on Windows.');
      }

      const textPath = path.join(tempDir, `${outputName}.txt`);
      const outputPath = path.join(tempDir, `${outputName}.wav`);
      await fs.writeFile(textPath, text, 'utf8');

      const psScript = `
        Add-Type -AssemblyName System.Speech
        $text = Get-Content -Raw -Encoding UTF8 '${escapePowerShellSingleQuoted(textPath)}'
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'zh-CN' } | Select-Object -First 1
        if ($null -eq $voice) { throw 'No zh-CN Windows speech voice is installed.' }
        $synth.SelectVoice($voice.VoiceInfo.Name)
        $synth.Rate = ${windowsRate}
        $synth.Volume = 100
        $synth.SetOutputToWaveFile('${escapePowerShellSingleQuoted(outputPath)}')
        $synth.Speak($text)
        $synth.Dispose()
      `;

      await execFileAsync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
        windowsHide: true,
      });

      return fs.readFile(outputPath);
    },
  };
};
