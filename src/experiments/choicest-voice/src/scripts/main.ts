import voiceUniverses from '@virtual:tree:../../public/voices';
import { getRandomArrayElement, shuffle, sleep } from './utils';
import { DirStructureElement } from '../../../../config/vite/plugins/tree';
import { playRound } from './game';
import { notify } from './notify';

const totalRounds = 3;
const scoreToWin = totalRounds * 30;

const universesNavLabel = document.querySelector<HTMLElement>(
  '#universes-nav-label',
)!;
const universesList =
  document.querySelector<HTMLUListElement>('#universes-list')!;
const startButton = document.querySelector<HTMLButtonElement>('#start')!;

const startGame = async (
  universe: string,
  characters: DirStructureElement[],
) => {
  universesNavLabel.hidden = true;
  universesList.parentElement!.hidden = true;
  startButton.hidden = false;
  const selectedCharacters = shuffle(characters).slice(0, totalRounds);
  startButton.addEventListener(
    'click',
    async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    },
    { once: true },
  );
};

voiceUniverses.forEach(({ name, children }) => {
  const button = document.createElement('button');
  button.textContent = name;
  button.addEventListener('click', () => startGame(name, children));
  const li = document.createElement('li');
  li.appendChild(button);
  universesList.appendChild(li);
});
