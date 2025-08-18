#!/usr/bin/env python3
import sys

# Scoring tables for each timeslot
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

# Map full tag names to keys used in the tables
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

# Sample animal data (flattened from your JSON)
animal_data = {
    "Cheetah": {"tags": ["High Popularity", "High Stress"]},
    "Camel": {"tags": ["Low Stress", "Low Popularity"]},
    "Lion": {"tags": ["High Popularity", "Medium Stress"]},
    "Zebra": {"tags": ["Low Stress", "Medium Popularity"]},
    "Elephant": {"tags": ["Medium Popularity", "Medium Stress"]},
    "Sloth": {"tags": ["Low Popularity", "Medium Stress"]},
    "Koala": {"tags": ["Low Stress", "Low Popularity"]},
    "Lemur": {"tags": ["Low Popularity", "Medium Stress"]},
    "Rhinoceros": {"tags": ["Low Stress", "Low Popularity"]},
    "Giraffe": {"tags": ["Low Popularity", "Medium Stress"]},
    "Alligator": {"tags": ["Medium Popularity", "Medium Stress"]},
    "Hippopotamus": {"tags": ["Medium Popularity", "Medium Stress"]},
    "Toucan": {"tags": ["Low Stress", "Low Popularity"]},
    "Flamingo": {"tags": ["Low Stress", "Low Popularity"]},
    "Monkey": {"tags": ["Low Stress", "Low Popularity"]},
    "Bonobo": {"tags": ["Medium Popularity", "Medium Stress"]},
    "Gorilla": {"tags": ["Medium Popularity", "Medium Stress"]},
    "Orangutan": {"tags": ["Low Stress", "Medium Popularity"]},
    "Jaguar": {"tags": ["Low Stress", "Medium Popularity"]},
    "Panda": {"tags": ["High Popularity", "Medium Stress"]},
    "Red Panda": {"tags": ["High Popularity", "High Stress"]},
    "Tiger": {"tags": ["High Popularity", "High Stress"]},
    "Reindeer": {"tags": ["High Popularity", "High Stress"]},
    "Mountain Lion": {"tags": ["High Popularity", "High Stress"]},
    "Arctic Fox": {"tags": ["High Popularity", "High Stress"]},
    "Penguin": {"tags": ["High Popularity", "High Stress"]},
    "Polar Bear": {"tags": ["High Popularity", "High Stress"]}
}

def normalize_animal_name(name):
    """Strip extraneous quotes (straight or curly) and whitespace, and convert to title case."""
    cleaned = name.replace("“", "").replace("”", "").replace('"', "").replace("'", "")
    return cleaned.strip().title()

def get_table_for_index(index, total):
    """
    Given the index of the animal in the list and total number,
    choose the scoring table based on the following rules:
      - For 8 animals:
          indices 0-1: morning, 2-3: noon, 4-5: afternoon, 6-7: evening (noon table)
      - For 6 animals:
          indices 0-1: morning, 2-3: noon, 4-5: afternoon
    """
    if total == 8:
        if index < 2:
            return morning_table
        elif index < 4:
            return noon_evening_table
        elif index < 6:
            return afternoon_table
        else:
            return noon_evening_table
    elif total == 6:
        if index < 2:
            return morning_table
        elif index < 4:
            return noon_evening_table
        else:
            return afternoon_table
    else:
        return noon_evening_table

def score_animals(animal_names):
    scores = []
    overall_score = 0
    total = len(animal_names)
    
    for i, name in enumerate(animal_names):
        normalized_name = normalize_animal_name(name)
        animal = animal_data.get(normalized_name)
        if not animal:
            print(f"Warning: {normalized_name} not found in animal_data, skipping.")
            continue
        
        tags = animal["tags"]
        stress_tag = next((tag for tag in tags if "Stress" in tag), None)
        pop_tag = next((tag for tag in tags if "Popularity" in tag), None)
        
        if not stress_tag or not pop_tag:
            print(f"Warning: {normalized_name} does not have proper tags, skipping.")
            continue
        
        stress_key = stress_map.get(stress_tag)
        pop_key = pop_map.get(pop_tag)
        table = get_table_for_index(i, total)
        
        score = table.get(stress_key, {}).get(pop_key, 0)
        # Round each animal's score to one decimal place
        score = round(score, 1)
        overall_score += score
        scores.append({"name": normalized_name, "score": score})
        
    overall_score = round(overall_score, 1)
    return scores, overall_score

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_list = sys.argv[1]
    else:
        input_list = input("Enter animal names (comma-separated): ")
        
    animal_names = [name for name in input_list.split(",")]
    
    if len(animal_names) not in (6, 8):
        print("Warning: Expected 6 or 8 animals for proper timeslot scoring, but got", len(animal_names))
    
    individual_scores, overall = score_animals(animal_names)
    print("Individual Scores:")
    for entry in individual_scores:
        print(f"{entry['name']}: {entry['score']}")
    print("Overall Score:", overall)
