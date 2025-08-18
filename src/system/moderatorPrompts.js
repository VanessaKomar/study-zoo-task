/**
 * moderatorPrompts.js
 *
 * Contains the structured prompts for the moderator mode.
 * Prompts are divided into phases of the task. Each array element represents one step in the dialogue.
 * Designed to guide participants while making instructions easy to follow and revisit during the task.
 */

module.exports = {
  INTRO: [
    `*WELCOME TO THE ZOO TASK*

I’m your *AI moderator*. I’ll guide you through the task step by step.

Your goal is to create a *public feeding schedule* that attracts visitors but doesn’t overly stress the animals.

Let me know when you're ready to begin!`,
  ],

  PLANNING: [
    `*PLANNING STRATEGY OVERVIEW*

You'll be choosing animals to feed throughout the day. Here are a few things to keep in mind:

- *Morning*: Low number of Visitors → good for *low-popularity* or *high-stress* animals to save high-popularity animals for later.
- *Midday*: Medium number of Visitors → ideal for *high-popularity* animals.
- *Afternoon*: High number of Visitors→ balance *popularity* with *stress levels*.
- *Evening*: Medium number of Visitors → aim for *popularity*, but end at the *exit*.

*Reminder*: You must feed:
- 8 different animals
- Animals in all 6 sectors

Let me know when you're done reading, and I’ll help you get started.`,

    `*MAKE YOUR LIST*

Choose *1–2 animals per sector* (8–12 total) that you'd consider feeding based on the hints above.

Use this format to keep track:

Blue: ______, ______  
Green: ______, ______  
Yellow: ______, ______  
Purple: ______, ______  
Brown: ______, ______  
White: ______, ______

Let me know when your list is ready, and I’ll guide you through the day.`
  ],

  MORNING: [
    `*MORNING PLANNING*

You start at the *entrance*. Choose *2 animals* from your list to feed in the morning.

Morning is *quiet* — prioritize animals that are *less popular* or *easily stressed*.

These two animals must be in *different sectors*.

Let me know when you have decided which two animals to feed in the morning.`,

    `*CHECK TIME FEASIBILITY*

Make sure your morning route fits within *1 hour*:

- 10 min per sector transition (e.g., Entrance → Blue = 10 min)
- 15 min per feeding

Confirm your two animals and ensure the route is realistic.`
  ],

  MIDDAY: [
    `*MIDDAY*

Start in the sector where you finished in the morning.

Pick *2 new animals* from your list in *two different sectors*.

Visitors are increasing but it is still not as busy as the afternoon
  — now may still be a good time to feed a *high-stress* animal.

Let me know when you have decided which two animals to feed for midday.`,

    `*CHECK TIME FEASIBILITY*

Make sure your midday route fits within *1 hour*:

Remember:

- 15 min per feeding  
- 10 min per transition

Confirm your two animals and ensure the route works.`
  ],

  AFTERNOON: [
    `*AFTERNOON*

Start where you ended midday. Pick *2 new animals* from your list in *two different sectors*.

Afternoon is the *busiest* time of day.

- Maximize *popularity*
- But avoid overstressing *high-stress* animals

Let me know when you have decided which two animals to feed in the afternoon.`,

    `*TIME CHECK*

- 10 min per path  
- 15 min per feeding

Stay under *1 hour*. Let me know when you’ve finalized your choices.`
  ],

  EVENING: [
    `*EVENING*

Start where you ended the afternoon. This is your *final feeding session* before heading to the exit.

Pick *2 new animals* from your list in *two different sectors*

Make sure:

- You’ve visited all *6 sectors*  
- You’ve fed *8 different animals*

Let me know when you have decided which two animals to feed in the evening and can successfully make it back to the exit.`,

    `*FINAL TIME CHECK*

Make sure your evening route fits within *1 hour*:

- 15 min per feeding  
- 10 min per sector (including 10 min to return to the exit)

Confirm your final choices. I’ll help you review everything next.`
  ],

  FINAL: [
    `*FINAL CHECKLIST*

Review your full feeding schedule. Make sure you:

1. Fed animals in *6 different sectors*
2. Chose *8 different animals*
3. Stayed under *1 hour* per session
4. Started at the *entrance* and ended at the *exit*`,

    `*YOU'RE DONE!*

Congrats on completing the Zoo Task!

When you're ready, go ahead and submit your final schedule.

Thanks for taking care of the zoo`
  ]
};
