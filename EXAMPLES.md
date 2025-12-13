# Example Guidelines for Different Stream Types

## Gaming Stream Examples

### Competitive Gaming
```json
{
  "id": "rank_question",
  "enabled": true,
  "triggers": ["rank", "what rank", "your rank"],
  "triggerType": "contains",
  "responses": [
    "Current rank info is in the stream title! 🏆"
  ],
  "cooldown": 120
}
```

### Variety Gaming
```json
{
  "id": "next_game",
  "enabled": true,
  "triggers": ["next game", "what's next", "play next"],
  "triggerType": "contains",
  "responses": [
    "Check the schedule panel for upcoming games! 🎮",
    "Taking suggestions for next game! Drop your ideas! 💡"
  ],
  "cooldown": 180,
  "probability": 0.6
}
```

## Creative Stream Examples

### Art Stream
```json
{
  "id": "art_question",
  "enabled": true,
  "triggers": ["what software", "what program", "drawing tablet"],
  "triggerType": "contains",
  "responses": [
    "Setup details are in the About section! 🎨",
    "Art tools and tablet info in the panels below! ✏️"
  ],
  "cooldown": 120
}
```

### Music Stream
```json
{
  "id": "song_request",
  "enabled": true,
  "triggers": ["song request", "play this song", "can you play"],
  "triggerType": "contains",
  "responses": [
    "Use !sr [song name] for song requests! 🎵",
    "Song requests are open! Use !sr command! 🎶"
  ],
  "cooldown": 60
}
```

## Just Chatting Examples

```json
{
  "id": "topic_question",
  "enabled": true,
  "triggers": ["what we talking about", "topic", "what's the discussion"],
  "triggerType": "contains",
  "responses": [
    "Just vibing and chatting! Jump in anytime! 💬"
  ],
  "cooldown": 120
}
```

## Engagement Boosters

### Sub/Follow Thanks
```json
{
  "id": "follow_thanks",
  "enabled": true,
  "triggers": ["just followed", "new follow"],
  "triggerType": "contains",
  "responses": [
    "Thanks for the follow! Welcome to the community! 💜"
  ],
  "cooldown": 300
}
```

### Clip Requests
```json
{
  "id": "clip_request",
  "enabled": true,
  "triggers": ["clip that", "someone clip", "clipped"],
  "triggerType": "contains",
  "responses": [
    "Epic moment! Thanks for clipping! 🎬"
  ],
  "cooldown": 90,
  "probability": 0.4
}
```

### Hype Responses
```json
{
  "id": "hype",
  "enabled": true,
  "triggers": ["pog", "poggers", "let's go", "hype"],
  "triggerType": "contains",
  "responses": [
    "LET'S GOOO! 🔥",
    "HYPE HYPE HYPE! 🎉",
    "POG MOMENT! ⚡"
  ],
  "cooldown": 60,
  "probability": 0.2
}
```

## Educational/Tutorial Streams

```json
{
  "id": "tutorial_question",
  "enabled": true,
  "triggers": ["how did you", "how do you", "tutorial"],
  "triggerType": "contains",
  "responses": [
    "Great question! I'll explain in a moment! 📚",
    "Check the YouTube for detailed tutorials! 🎓"
  ],
  "cooldown": 120,
  "probability": 0.5
}
```

## Time-Based Responses (Manual)

```json
{
  "id": "stream_ending",
  "enabled": false,
  "triggers": ["how long", "stream ending", "how much longer"],
  "triggerType": "contains",
  "responses": [
    "Probably about 30 more minutes! ⏰",
    "Wrapping up soon! Stay tuned! 👋"
  ],
  "cooldown": 180
}
```

## Seasonal/Event Specific

```json
{
  "id": "holiday_greeting",
  "enabled": false,
  "triggers": ["happy holidays", "merry christmas", "happy new year"],
  "triggerType": "contains",
  "responses": [
    "Happy holidays to you too! 🎄✨",
    "Wishing you the best this season! 🎁"
  ],
  "cooldown": 300
}
```

## Pro Tips

1. **Start Simple**: Begin with 5-10 rules, add more as needed
2. **Monitor Logs**: Check which rules trigger most often
3. **Adjust Probability**: Lower it if bot seems too chatty
4. **Use Cooldowns**: 60-300 seconds keeps responses fresh
5. **Vary Responses**: 3-5 variations per rule feels natural
6. **Disable When Needed**: Set `"enabled": false` to temporarily disable rules
7. **Test in Real Time**: Monitor first stream carefully and adjust
8. **Get Feedback**: Ask viewers if bot is helpful or annoying

## Testing New Rules

Before going live:
1. Add rule with high cooldown (300s)
2. Set probability to 0.2-0.3
3. Monitor first hour of stream
4. Adjust based on chat flow
5. Get mod/viewer feedback
