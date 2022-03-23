import { WaveformIndicator, OutlineLoudnessIndicator } from './visualize';
import { count, getRandomArrayElement, shuffle, sleep } from './utils';
import { notify } from './notify';
import { DirStructureElement } from '../../../../config/vite/plugins/tree';

const totalRounds = 3;
const scoreToWin = totalRounds * 30;

const canvas = document.querySelector('canvas')!;
const waveformIndicator = new WaveformIndicator(canvas);
const outlineIndicator = new OutlineLoudnessIndicator(
  document.querySelector('#mic-img')!,
);
const countdownSound = new Audio('sfx/countdown.ogg');

const stopRecording = (mediaRecorder: MediaRecorder) =>
  new Promise<Blob>((resolve, reject) => {
    mediaRecorder.addEventListener('dataavailable', ({ data }) =>
      resolve(data),
    );
    mediaRecorder.addEventListener('error', ({ error }) => reject(error));
    mediaRecorder.stop();
  });

const playAudio = (url: string) =>
  new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    audio.addEventListener('ended', () => resolve());
    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(reject);
    });
    audio.addEventListener('error', reject);
  });

const record = async (stream: MediaStream): Promise<[Uint8Array, Blob]> => {
  // Start recording the microphone's audio stream in-memory.
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  const output = await waveformIndicator.display(stream, {
    color: 'rgba(0, 0, 255, 0.5)',
    onValue: loudness => outlineIndicator.show(loudness),
  });

  outlineIndicator.hide();
  const audioBlob = await stopRecording(mediaRecorder);

  return [output, audioBlob];
};

const computeVotes = (diffPercentage: number) =>
  Math.ceil(Math.max(0, 75 - diffPercentage) / 15);

export const playRound = async (
  stream: MediaStream,
  universe: string,
  character: string,
  voice: string,
) => {
  waveformIndicator.reset();

  notify(character, 2000);

  document.querySelector<HTMLElement>('#landing')!.hidden = true;
  document.querySelector<HTMLElement>('#game')!.hidden = false;
  const [soundBuffer] = await Promise.all([
    fetch(`voices/${universe}/${character}/${voice}`).then(res =>
      res.arrayBuffer(),
    ),
    sleep(2500),
  ]);

  const originalAudio = await waveformIndicator.display(soundBuffer, {
    color: 'rgba(0, 0, 0, 0.5)',
    play: true,
  });
  await sleep(1500);
  countdownSound.play();
  await count(3, val => {
    if (val > 0) {
      notify(val.toString(), val > 1 ? -1 : 1000);
    }
  });
  const [userAudio, userBlob] = await record(stream);

  await sleep(1000);

  // Play user audio
  await playAudio(URL.createObjectURL(userBlob));

  const bufferSize = 512;
  let sf = 0;
  let totalSize = 0;
  for (let i = -(bufferSize / 2); i < userAudio.length / 2 - 1; i++) {
    const x = Math.abs(userAudio[i]) - Math.abs(originalAudio[i]);
    const val = (x + Math.abs(x)) / 2;
    const toSum = isNaN(val) ? 100 : val;
    sf += toSum;
    totalSize++;
  }
  const votes = computeVotes(sf / totalSize);

  notify(`Votes: ${votes}`, 2500);
  await sleep(3000);

  return votes;
};

export const playMatch = async (
  stream: MediaStream,
  universe: string,
  characters: DirStructureElement[],
) => {
  const selectedCharacters = shuffle(characters).slice(0, totalRounds);
  const totalVotes = await selectedCharacters.reduce(
    async (previousVotesPromise, { name, children = [] }) => {
      const previousVotes = await previousVotesPromise;
      const voice = getRandomArrayElement(children).name;
      const newVotes = await playRound(stream, universe, name, voice);
      return previousVotes + newVotes;
    },
    Promise.resolve(0),
  );
  const totalScore = totalVotes * 10;
  notify('Game over!', -1);
  await sleep(3000);
  notify(`Final score: ${totalScore}`, -1);
  await sleep(3000);
  notify(`You ${totalScore >= scoreToWin ? 'win!' : 'lose.'}`, -1);
};
