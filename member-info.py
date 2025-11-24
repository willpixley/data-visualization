import pandas as pd
import requests
import time


# Used to get images for each member of congress

df = pd.read_csv("trade_data.csv")


state_map = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
}

df["member_state"] = df["member_state"].map(state_map).fillna(df["member_state"])


df["amount"] = pd.to_numeric(df["amount"], errors="coerce")


group_cols = [
    "member_name",
    "member_party",
    "member_state",
    "member_chamber",
    "member_bio_guide_id",
]

summary = (
    df.groupby(group_cols)["amount"]
    .sum()
    .reset_index()
    .rename(columns={"amount": "total_trade_volume"})
)


def fetch_member_photo_url(member_row):

    member_id = member_row["member_bio_guide_id"]
    API_KEY = "Get your own api key :)"  # https://www.loc.gov/apis/additional-apis/congress-dot-gov-api/
    url = f"https://api.congress.gov/v3/member/{member_id}"
    params = {"api_key": API_KEY}

    time.sleep(1)

    response = requests.get(url, params=params)
    response.raise_for_status()  # throws error if request failed
    data = response.json()["member"]["depiction"]["imageUrl"]
    print(data)
    return data


summary["photo_url"] = summary.apply(fetch_member_photo_url, axis=1)


summary.to_csv("member-info.csv", index=False)

print("done")
