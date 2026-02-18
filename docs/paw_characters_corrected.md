Discovery System Specification (Alchemy-style character combining)
The app has two main areas: the character menu (index) and the workspace (discovery area).
Character Menu (Index)
The character menu shows all characters the player has discovered.
Characters have three possible states:
Undiscovered
Not visible in the menu.

Discovered but locked
Visible in the menu but grayed out with a lock icon.
These cannot be dragged or placed into the workspace.

Discovered and unlocked
Visible in full color.
Can be dragged or tapped to place into the workspace.

Interaction with unlocked characters in the menu:
Tap: instantly spawns the character into a random position in the workspace.

Drag: instantly picks up the character and allows dragging into the workspace.

Drag pickup must feel immediate, especially on mobile. Maximum press-hold delay should be very short (0–100ms max).

Workspace (Discovery Area)
The workspace is an open area where characters can be placed, moved, combined, or removed.
Characters in the workspace:
Can be freely dragged and repositioned.

Dragging must be smooth and immediate on both desktop and mobile.

Mobile touch interaction is the highest priority and must feel responsive.

Removing characters:
If more than 50% of a character is dragged outside the workspace bounds, it disappears.

This is the primary manual removal method.

Also include a "Clear Workspace" button that removes all characters instantly.

Optional limit:
The workspace may optionally enforce a max character limit (recommended: 20–30).

If limit is reached, prevent spawning new characters until space is cleared.

Character Combination Behavior
When two characters overlap, the system checks for a combination result.
There are three possible outcomes:
Valid combination AND requirements met

Result:
Play kiss sound ("mwah")

Both original characters disappear

New character appears at their position

5–6 small heart particles animate upward

New character is added to the character menu as discovered

New character may still be locked if unlock requirements are not met

Valid combination BUT requirements NOT met

Result:
Play sigh sound ("ahh")

1 small heart particle appears

Original characters remain

No new character is created

This indicates the player discovered the combination logic but has not unlocked the character yet.
Invalid combination (no defined match)

Result:
Play "ew" or rejection sound

Characters jitter slightly and push away from each other

Characters remain in workspace

No hearts, no disappearance, no creation

This indicates these two characters do not combine.
Visual and Interaction Goals
All interactions must feel fast, smooth, and responsive

Mobile touch performance is top priority

Dragging must feel immediate, not delayed

Animations should be short and satisfying (200–400ms range)

The system should clearly communicate success, partial success, and failure through animation and sound

Core Functional Requirements Summary
Character menu:
Show discovered characters

Locked characters grayed out with lock icon

Tap or drag to spawn unlocked characters

Workspace:
Free movement

Drag to combine

Drag outside bounds to delete

Clear workspace button

Optional workspace character limit

Combination system:
Success → kiss sound, hearts, new character, originals removed

Valid but locked → sigh sound, one heart, no new character

Invalid → ew sound, jitter, characters push apart

Mobile is primary platform. Desktop must also work.

--
Characters should have a way to assign and unassign as a manager to resorses and buildings.

We need to add a way to see full character bios for characters that have been unlocked.

---

CHARACTER LEVELING SYSTEM SPEC
Every character has a level from 1 to 100.
Level affects resource gathering speed.
Level increases permanently and applies to all uses of that character.
Characters gain levels by spending resources (not XP over time). Leveling is intentional, not passive.

LEVEL TIERS
Level 1–24: Basic
Frame: no special frame
Bonus: base speed only
Level 25–49: Bronze
Frame: bronze frame around character portrait
Bonus: +25% gathering speed (multiplicative with level scaling)
Level 50–74: Silver
Frame: silver frame
Bonus: +50% gathering speed
Level 75–99: Gold
Frame: gold frame
Bonus: +100% gathering speed
Level 100: Legendary
Frame: animated legendary frame (glow, shimmer, or particles)
Bonus: +200% gathering speed
Unlocks Special Ability

LEVEL SPEED SCALING
Each level increases manager speed slightly.
Formula example:
BaseSpeed × (1 + (Level × 0.02))
Example:
Level 1 = 1.02× speed
Level 25 = 1.50× speed
Level 50 = 2.00× speed
Level 75 = 2.50× speed
Level 100 = 3.00× speed
This stacks with Bronze/Silver/Gold/Legendary bonuses.

LEVEL UP COST
Leveling requires resources. Cost increases gradually.
Example formula:
LevelUpCost = BaseCost × (1.15 ^ CurrentLevel)
Example progression:
Level 1 → 2: 50 resource
Level 10 → 11: 200 resource
Level 25 → 26: 800 resource
Level 50 → 51: 5,000 resource
Level 75 → 76: 25,000 resource
Level 99 → 100: 100,000 resource
Higher tier characters use higher tier resources.

FRAME SYSTEM
Character portrait frame changes automatically based on level tier:
Basic → no frame
Bronze → bronze border
Silver → silver border
Gold → gold border
Legendary → animated glowing border
Frame is purely visual except Legendary unlocks ability.

LEGENDARY ABILITIES
At Level 100, each character unlocks a unique special ability.
Abilities must be manually activated by tapping the character.
Abilities have cooldowns.
Typical cooldown: 60–300 seconds.
Ability types:
Frenzy
Doubles resource production for 30 seconds
Efficiency Boost
Reduces resource conversion costs by 50% for 30 seconds
Instant Production
Instantly generates X amount of resource
Global Speed Boost
All managers work 2× faster for 20 seconds
Conversion Surge
Conversion buildings work instantly for 10 seconds
Passive Burst
Character produces 10× output for 10 seconds

ABILITY RULES
Ability unlocked only at Level 100
Ability must be manually activated
Ability has cooldown timer
Ability cooldown shown visually on character
Ability can only run once per cooldown period
Legendary characters feel powerful and valuable.

UI REQUIREMENTS
Each character shows:
Portrait
Frame based on tier
Level number
Progress to next level
Ability icon (if Legendary)
Cooldown indicator (if ability used)
Tap character opens character details panel.
Character panel includes:
Level
Level up button
Level up cost
Ability description
Ability cooldown

DATA STRUCTURE EXAMPLE
Character:
id
title
name
level
maxLevel = 100
baseSpeed
currentSpeed
abilityUnlocked (true at level 100)
abilityCooldown
abilityLastUsedTimestamp

GAME DESIGN BENEFITS
This system creates:
Short term goals: reach level 25
Mid term goals: reach Silver/Gold
Long term goals: reach Legendary
Endgame goal: unlock all abilities
It also encourages:
resource investment
strategic leveling
player attachment to characters

---

There will be 200 character these are the current placeholders for testing that I want to get into the game.

##character list
Tier: 0
Title: Gatherer
Name: Reed Thistlepick
Discovery Combo: starter
Unlock Cost: none
Short Bio: Picks things up because “you never know.”
Full Bio: Reed has spent his entire life wandering just beyond the edges of camp, quietly collecting whatever the world leaves behind. He has a strange instinct for finding useful things in useless places. Others see debris—Reed sees beginnings.

Tier: 0
Title: Builder
Name: Brigg Stoneframe
Discovery Combo: starter
Unlock Cost: none
Short Bio: If it stands up, Brigg built it.
Full Bio: Brigg trusts his hands more than anything else. He shapes raw materials into shelters, tools, and structures with stubborn determination. He doesn’t plan much—he builds, adjusts, and builds again until it works.

Tier: 0
Title: Curious
Name: Luma Brightspark
Discovery Combo: starter
Unlock Cost: none
Short Bio: Cannot leave mysteries alone.
Full Bio: Luma is driven by questions she cannot ignore. She experiments constantly, often breaking things—but just as often discovering something new. Her curiosity pulls the future closer.

Tier: 0
Title: Strange
Name: Odo Flickerfoot
Discovery Combo: starter
Unlock Cost: none
Short Bio: Reality behaves differently around Odo.
Full Bio: Odo appeared one day with no explanation and no memory of arriving. Things react strangely around him—machines behave differently, people feel uneasy, and unlikely combinations suddenly work.

Tier: 1
Title: Farmer
Name: Willow Greenhand
Discovery Combo: Gatherer + Gatherer
Unlock Cost: 50 Cool Sticks, 25 Berries
Short Bio: Makes food grow instead of chasing it.
Full Bio: Willow discovered that survival doesn’t always require movement. By planting what others consumed, she created stability. Her quiet patience transformed survival into sustainability.

Tier: 1
Title: Fisher
Name: Finn Brookwalker
Discovery Combo: Gatherer + Builder
Unlock Cost: 50 Cool Sticks, 25 Berries
Short Bio: Talks to fish like they owe him favors.
Full Bio: Finn learned to reach into the hidden world beneath the water. His calm focus and simple tools provide a steady source of food from a place others overlooked.

Tier: 1
Title: Hunter
Name: Korr Ashtracker
Discovery Combo: Gatherer + Strange
Unlock Cost: 60 Cool Sticks, 30 Berries
Short Bio: Sees trails nobody else sees.
Full Bio: Korr follows signs invisible to most. He moves with precision and patience, ensuring survival even in uncertain conditions. His instincts rarely fail.

Tier: 2
Title: Toolmaker
Name: Della Ironfingers
Discovery Combo: Builder + Farmer
Unlock Cost: 75 Cardboard Boxes
Short Bio: Makes tools that make better tools.
Full Bio: Della believes tools are the true turning point of progress. Her creations extend human capability and open new paths forward. Each invention multiplies what others can achieve.

Tier: 2
Title: Scholar
Name: Quill Evermind
Discovery Combo: Curious + Farmer
Unlock Cost: 75 Novels
Short Bio: Knows things nobody asked about.
Full Bio: Quill collects knowledge obsessively, preserving discoveries so they are never lost. His insights often seem abstract—until they suddenly become essential.

Tier: 2
Title: Engineer
Name: Sparky Hammerthumb
Discovery Combo: Builder + Toolmaker
Unlock Cost: 50 Power Tools
Short Bio: Fixes everything. Breaks some of it first.
Full Bio: Sparky is a clumsy but brilliant engineer whose ideas work better than his hands. He drops tools, misplaces parts, and causes frequent accidents—but somehow, his inventions always work in the end. His chaotic process leads to breakthroughs nobody else would risk.
