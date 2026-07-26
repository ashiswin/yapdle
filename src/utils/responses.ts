const wrongResponses: string[] = [
  "That's not even close, you absolute buffoon.",
  "Are you even trying? Jesus Christ.",
  "What in the actual hell was that guess?",
  "I'm genuinely concerned about your cognitive abilities right now.",
  "That guess was drier than my sense of humor.",
  "Wow. Just... wow. That's impressively wrong.",
  "You're really embarrassing yourself here, bud.",
  "No. Just... no.",
  "That's the worst guess I've ever seen in my entire life.",
  "I don't even know how to respond to that level of incompetence.",
  "My dude, what are you even doing?",
  "I've seen better guesses from a random number generator.",
  "That's not it, chief. Not even remotely.",
  "Listen, I'm not mad. I'm just disappointed.",
  "You're making this way harder than it needs to be.",
  "Is this your first day on the internet?",
  "Brother, that guess is absolutely tragic.",
  "That attempt was so bad it's almost impressive.",
  "You gotta be kidding me with that guess.",
  "I'm starting to think you've never seen a penguinz0 video.",
  "Yikes. Just... yikes.",
  "That's a swing and a miss. A really embarrassing miss.",
  "At this point I'm just watching in horror.",
  "You know you can just not guess, right?",
  "Every guess you make physically hurts me.",
  "Holy crap, that's wrong on so many levels.",
  "I need you to really think about what you just typed.",
  "That guess was a hate crime against my channel.",
  "Do you even watch YouTube, my guy?",
  "This is painful. I'm in physical pain.",
]

const correctResponses: string[] = [
  "You actually got it! Holy shit, I'm genuinely impressed. What a goddamn legend.",
  "No way. NO WAY. You actually guessed it. I owe you a crisp high-five.",
  "Well I'll be damned. You're not as clueless as you look. Nice job.",
  "Oh my god, someone with a functioning brain finally showed up. Congratulations!",
  "You magnificent bastard. You actually pulled it off. I'm proud of you.",
  "Holy crap, you did it! I was about to roast you into oblivion but you actually know my content!",
  "Wait, what? You got it? I was fully prepared to eviscerate you. Good job, I guess.",
  "That's... actually correct. I'm in shock. Respect.",
]

const lostResponses: string[] = [
  "Welp, you're out of guesses. The video was \"%s\". Maybe next time, champ.",
  "Game over, my guy. It was \"%s\". I expected nothing and I'm still disappointed.",
  "You really couldn't figure out \"%s\"? That's just sad.",
  "The correct answer was \"%s\". I'm not angry, I'm just... okay I'm a little angry.",
  "It was \"%s\". How did you not get that? That's one of my classics!",
]

export function getWrongResponse(): string {
  return wrongResponses[Math.floor(Math.random() * wrongResponses.length)]
}

export function getCorrectResponse(): string {
  return correctResponses[Math.floor(Math.random() * correctResponses.length)]
}

export function getLostResponse(title: string): string {
  const template = lostResponses[Math.floor(Math.random() * lostResponses.length)]
  return template.replace("%s", title)
}
