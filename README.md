# Web Experiments

In this monorepo you can find a collection of my web experiments.
The web apps I consider experiments are the ones that are tiny, self-contained,
and that I don't consider worth of having their own domain, so I'm hosting
all of them under my umbrella domain [gga.dev](https://gga.dev).

Some of them are made to experiment with new web technologies, others come
from an idea I had and I wanted to try out, while others are fully fledged
web applications. Feel free to have a look and play around with them.

## Available experiments

Right now, these are the experiments available in this repo:

- [The Choicest Voice](https://github.com/Dabolus/web-experiments/tree/main/src/experiments/choicest-voice):
  a game that challenges the player to imitate the voice of a character;
- [EUDCC Reader](https://github.com/Dabolus/web-experiments/tree/main/src/experiments/eudcc-reader):
  a web-based EUDCC (aka Green Pass) reader and verifier;
- [Business Card](https://github.com/Dabolus/web-experiments/tree/main/src/experiments/me):
  my digital business card implemented as a web app;
- [Planet Age](https://github.com/Dabolus/web-experiments/tree/main/src/experiments/planet-age):
  a web app that allows you to check how old you are on each planet;
- [Steganography Toolkit](https://github.com/Dabolus/web-experiments/tree/main/src/experiments/steganography-toolkit):
  a PWA that allows to easily obfuscate texts and files using steganography.

This repo also contains two additional projects:

- The home page of the [experiments website](https://gga.dev), which can be
  found [here](https://github.com/Dabolus/web-experiments/tree/main/src/home);
- The functions used by some experiments to do backend work, which can be
  [here](https://github.com/Dabolus/web-experiments/tree/main/src/function).

For more information about each experiment, please refer to the README file in
the corresponding folder.

## Development

The monorepo is managed using [bun](https://bun.sh/). To start a project
locally, follow these steps:

- Make sure [bun](https://bun.sh/) is installed;
- Clone the repo;
- Run `bun install` to install the dependencies;
- Run `bun run start:<project>` to start the project you want to work on.
