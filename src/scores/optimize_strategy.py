#!/usr/bin/env python3
import sys

# --- Scoring Tables ---
morning_table = {
    "high": {"least": 1.7, "medium": 2.8, "most": 4.4},
    "medium": {"least": 1.8, "medium": 3.2, "most": 5.6},
    "low": {"least": 1.9, "medium": 3.6}
}

noon_evening_table = {
    "high": {"least": 2.8, "medium": 4.4, "most": 6.4},
    "medium": {"least": 3.2, "medium": 5.6, "most": 9.6},
    "low": {"least": 3.6, "medium": 6.8}
}

afternoon_table = {
    "high": {"least": 4.4, "medium": 6.4, "most": 8.0},
    "medium": {"least": 5.6, "medium": 9.6, "most": 16.0},
    "low": {"least": 6.8, "medium": 12.8}
}

# --- Tag Maps ---
stress_map = {
    "High Stress": "high",
    "Medium Stress": "medium",
    "Low Stress": "low"
}
pop_map = {
    "High Popularity": "most",
    "Medium Popularity": "medium",
    "Low Popularity": "least"
}

# --- Groups Definition ---
groups = {
    # "Yellow": ["Cheetah", "Lion", "Zebra"],
    # "Green": ["Koala"],
    # "Blue": ["Alligator"],
    # "Brown": ["Bonobo", "Orangutan"],
    # "White": ["Reindeer"],
    # "Purple": ["Jaguar", "Panda", "Red Panda"]
    
    "Yellow": ["Cheetah", "Camel", "Lion", "Zebra", "Elephant"],
    "Green": ["Sloth", "Koala"],
    "Blue": ["Alligator", "Toucan"],
    "Brown": ["Monkey", "Bonobo", "Orangutan"],
    "White": ["White"],
    "Purple": ["Jaguar", "Panda", "Red Panda"]
}

# Build a mapping from animal to its group
animal_to_group = {}
for group, animals in groups.items():
    for animal in animals:
        animal_to_group[animal] = group

# --- Sample Animal Data (tags) ---
animal_data = {
    "Cheetah": ["High Popularity", "High Stress"],
    "Lion": ["High Popularity", "Medium Stress"],
    "Zebra": ["Low Stress", "Medium Popularity"],
    "Koala": ["Low Stress", "Low Popularity"],
    "Alligator": ["Medium Popularity", "Medium Stress"],
    "Bonobo": ["Medium Popularity", "Medium Stress"],
    "Orangutan": ["Low Stress", "Medium Popularity"],
    "Jaguar": ["Low Stress", "Medium Popularity"],
    "Panda": ["High Popularity", "Medium Stress"],
    "Red Panda": ["High Popularity", "High Stress"],
    "White": ["High Popularity", "High Stress"], 
    "Camel": ["Low Stress", "Low Popularity"],
    "Elephant": ["Medium Popularity", "Medium Stress"],
    "Sloth": ["Low Popularity", "Medium Stress"],
    "Toucan": ["Low Stress", "Low Popularity"],
    "Monkey": ["Low Stress", "Low Popularity"],
}

# Build the list of all animals
all_animals = list(animal_to_group.keys())

# Maximum possible scores for each position (0 to 7):
# Positions 0-1: Morning (max ~5.6), 2-3: Noon/Evening (max ~9.6),
# 4-5: Afternoon (max ~16.0), 6-7: Evening (max ~9.6)
max_scores = [5.6, 5.6, 9.6, 9.6, 16.0, 16.0, 9.6, 9.6]

def score_for_position(animal, pos):
    tags = animal_data.get(animal, [])
    if not tags or len(tags) < 2:
        return 0
    stress_tag = next((t for t in tags if "Stress" in t), None)
    pop_tag = next((t for t in tags if "Popularity" in t), None)
    if not stress_tag or not pop_tag:
        return 0
    stress_key = stress_map.get(stress_tag)
    pop_key = pop_map.get(pop_tag)
    if pos < 2:
        table = morning_table
    elif pos < 4:
        table = noon_evening_table
    elif pos < 6:
        table = afternoon_table
    else:
        table = noon_evening_table
    return table.get(stress_key, {}).get(pop_key, 0)

# Global best score and orders
best_score = -1
best_orders = []

def backtrack(current_order, used, current_score):
    global best_score, best_orders
    pos = len(current_order)
    
    # If the order is complete (8 animals), check that all groups are represented.
    if pos == 8:
        groups_used = set(animal_to_group[a] for a in current_order)
        if len(groups_used) == 6:
            if current_score > best_score:
                best_score = current_score
                best_orders = [(list(current_order), current_score)]
            elif current_score == best_score:
                best_orders.append((list(current_order), current_score))
        return
    
    # Branch-and-bound: prune branches that cannot beat the best score.
    remaining_max = sum(max_scores[pos:])
    if current_score + remaining_max < best_score:
        return

    # Determine candidate animals.
    if pos % 2 == 1:
        # For the second animal in a pair, it must be from a different group than the first.
        pair_first = current_order[pos - 1]
        candidates = [a for a in all_animals if a not in used and animal_to_group[a] != animal_to_group[pair_first]]
        # Morning constraint: for pos == 1 (morning pair), disallow certain group combinations.
        if pos == 1:
            disallowed_morning = {
                frozenset(["Green", "White"]),
                frozenset(["Brown", "White"]),
                frozenset(["Yellow", "White"]),
                frozenset(["Green", "Brown"]),
                frozenset(["Yellow", "Brown"])
            }
            candidates = [
                a for a in candidates 
                if frozenset([animal_to_group[pair_first], animal_to_group[a]]) not in disallowed_morning
            ]
    else:
        candidates = [a for a in all_animals if a not in used]
    
    # Evening constraints: for positions 6 and 7 (evening),
    # if a candidate is from White, Brown, or Yellow, then at least one animal in the afternoon (positions 4-5)
    # must already be from that same group.
    if pos >= 6:
        def evening_filter(candidate):
            candidate_group = animal_to_group[candidate]
            if candidate_group in {"White", "Brown", "Yellow"}:
                # Get animals from the afternoon positions (4 and 5)
                afternoon_animals = current_order[4:6]
                return any(animal_to_group[x] == candidate_group for x in afternoon_animals)
            return True
        candidates = [a for a in candidates if evening_filter(a)]
    
    for a in candidates:
        used.add(a)
        current_order.append(a)
        new_score = current_score + score_for_position(a, pos)
        backtrack(current_order, used, new_score)
        current_order.pop()
        used.remove(a)

def find_best_strategies():
    global best_score, best_orders
    backtrack([], set(), 0)
    best_orders.sort(key=lambda x: x[1], reverse=True)
    return best_orders

if __name__ == "__main__":
    results = find_best_strategies()
    print(f"Best score: {best_score}")
    for order, score in results:
        print("Order:", order, "Score:", score)
