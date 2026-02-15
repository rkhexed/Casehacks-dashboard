import random
from dotenv import load_dotenv
import os
from pathlib import Path
from faker import Faker
from supabase import create_client, Client
fah = Faker()
env_path = Path(__file__).resolve().parents[3] / ".env.local"
load_dotenv(dotenv_path=env_path)

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") 
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


supabase: Client = create_client(url, key)

def nuke():
    supabase.table("users").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
#nuke() # delete existing data in users and teams

TEAMS = 10 #final value lower cause it nukes teams w 0 members
USERS = 20
GENDERRATIO = 0.5 #f:m
MAJORRATIO = 0.5 #cs:bba
GENDEROUT = 0.1
MAJOROUT = 0.2
ONTEAM = 0.30 #chance someone is on existing team

def teams(num):
    teams = [{"name": f"Team {i}"} for i in range(num)]
    if not teams:
        return []
    res = supabase.table("teams").insert(teams).execute()
    return [t["id"] for t in res.data]

def dataset(num, ids):
    users = []
    team_sizes = {tid: 0 for tid in ids}
    for _ in range(num):
        team_id = None

        if random.random() < ONTEAM: 
            available = [
                tid for tid, size in team_sizes.items()
                if size < 4
            ]
            if available:
                team_id = random.choice(available)
                team_sizes[team_id] += 1

        users.append(
            hacker(team_id)
        )
    
    return users, team_sizes

def hacker(team_id):
    if random.random() < GENDERRATIO:
        gender = "Female"
        name = fah.name_female()
    else:
        gender = "Male"
        name = fah.name_male()
    if random.random() < GENDEROUT:
        gender = "Other"
        name = fah.name()

    
    if random.random() < MAJORRATIO:
        major = "Computer Science"
    else:
        major = "Business"
    if random.random() < MAJOROUT:
        major = "Other"

    person = {
        "email": f"{name.lower().replace(' ', '.')}@casehacks.ca",
        "name": name,
        "role": "hacker",
        "team_id": team_id,
#        "qr_code": None,
#        "created_at": None,
#        "status": None,
#        "school": fah.university(),
        "year": str(random.randint(1,4)),
#       "dietary": None,
#        "tshirt_size": None,
#        "github": None,
#       "linkedin": None,
#        "portfolio": None,
        "points": 0,
        "major": major,
        "gender": gender
    }
    return person

team_ids = teams(TEAMS) 
data, team_sizes = dataset(USERS, team_ids)
supabase.table("users").insert(data).execute()
for tid, size in team_sizes.items():
    supabase.table("teams").update({"members": size}).eq("id", tid).execute()
supabase.table("teams").delete().eq("members", 0).execute()
print("meow?")