"""Download the white-background GymBells illustrations used by Mi Rutina.

Source: https://github.com/gellyfish-ai/gymbells-exercises
License: CC BY-NC 4.0. See assets/exercises/LICENSE.txt.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://raw.githubusercontent.com/gellyfish-ai/gymbells-exercises/main/"
NAMES = [
    "Barbell Bench Press", "Dumbbell Bench Press", "Incline Barbell Bench Press",
    "Incline Dumbbell Press", "Dumbbell Fly", "Cable Crossover", "Machine Chest Press",
    "Push-Up", "Chest Dip", "Pull-Up", "Band Assisted Pull-Up", "Lat Pulldown, Wide Grip",
    "Bent-Over Barbell Row", "One-Arm Dumbbell Row", "Seated Cable Row", "Machine Row",
    "Barbell Deadlift", "Romanian Deadlift", "Kneeling Cable Pullover", "Back Extension",
    "Barbell Back Squat", "Goblet Squat", "Dumbbell Bulgarian Split Squat", "Leg Press",
    "Leg Extension", "Lying Leg Curl", "Seated Leg Curl", "Barbell Hip Thrust",
    "Dumbbell Lunge", "Dumbbell Step-Up", "Machine Calf Raise", "Machine Hip Abduction",
    "Machine Hip Adduction", "Glute Bridge", "Barbell Overhead Press", "Dumbbell Shoulder Press",
    "Dumbbell Lateral Raise", "Dumbbell Front Raise", "Dumbbell Reverse Fly", "Face Pull",
    "Machine Shoulder Press", "Dumbbell Shrug", "Barbell Curl", "Dumbbell Curl",
    "Dumbbell Hammer Curl", "Barbell Preacher Curl", "Cable Curl", "Triceps Pushdown",
    "EZ-Bar Skull Crusher", "Dumbbell Triceps Kickback", "Bench Dip",
    "Dumbbell Overhead Triceps Extension", "Plank", "Side Plank", "Crunch",
    "Lying Leg Raise", "Hanging Knee Raise", "Ab Wheel Rollout", "Russian Twist",
    "Cable Crunch", None, None, None, "Rowing Machine", None, "Burpee",
]


def get(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read()


def main():
    if len(NAMES) != 66:
        raise ValueError(f"Expected 66 exercise mappings, got {len(NAMES)}")
    data = json.loads(get(BASE + "exercises.json"))["exercises"]
    texts = json.loads(get(BASE + "text/en.json"))["exercises"]
    by_name = {entry["name"]: key for key, entry in texts.items()}
    jobs = []
    for index, name in enumerate(NAMES, 1):
        if name is None:
            continue
        key = by_name.get(name)
        if key is None:
            raise ValueError(f"Missing source exercise: {name}")
        jobs.append((index, name, data[key]["pose"]))
    destination = ROOT / "assets" / "exercises"
    destination.mkdir(parents=True, exist_ok=True)

    def download(job):
        index, name, pose = job
        content = get(BASE + f"images/{pose}/start.png")
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError(f"Invalid PNG: {name}")
        path = destination / f"ex-{index}.png"
        path.write_bytes(content)
        return index, name, pose, len(content)

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = sorted(future.result() for future in as_completed(pool.submit(download, job) for job in jobs))
    (destination / "sources.json").write_text(
        json.dumps([{"id": f"ex-{index}", "name": name, "pose": pose} for index, name, pose, _ in results], indent=2) + "\n"
    )
    print(f"Downloaded {len(results)} images ({sum(size for *_, size in results) / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
