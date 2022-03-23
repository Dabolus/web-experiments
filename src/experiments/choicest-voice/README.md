# The Choicest Voice

## What is it?

The Choicest Voice is a game that challenges the player to imitate the voice of a character.
Each game is composed of 3 rounds, and for each round the user is voted by 5 judges. Each vote of
a judge gives the player 10 points. In single player mode, the player wins if their final score is
90 or more. In multiplayer mode instead, the player with the highest final score wins.

## Why?

The game is based on [the minigame](https://www.mariowiki.com/The_Choicest_Voice) of the same name
from [Mario Party: Island tour](https://www.mariowiki.com/Mario_Party:_Island_Tour). While the
mechanics are exactly the same, it has been expanded to different universes besides the Mario one
to make it more fun and varied.

## How?

The game makes heavy use of the [AudioContext API](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
and of the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) to play and visualize sounds.

For the online play mode, the [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) is used to
allow players to connect to each other in a peer-to-peer fashion. [Cloud Firestore](https://firebase.google.com/products/firestore)
is used to make the peers know each other and to sync the game state without the need of having a central server.

## Who?

The game was built with ❤️ by [Dabolus](https://giorgio.garasto.me).
