import csv
import pandas as pd

# Paths to input CSV files and output merged file
trustradius_path = './data/trustradius-ml.csv'
g2_path = './data/g2-ml.csv'
output_file_path = './data/merged_ratings.csv'

# Load TrustRadius data
def load_csv(file_path):
    data = {}
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            platform_name = row.get("What is the name of this AI/ML software platform?")
            if platform_name:
                data[platform_name] = row
    return data

# Merge data from TrustRadius and G2 based on platform name
def merge_data(trustradius_data, g2_data):
    merged_data = []

    # Add TrustRadius data to merged list
    for platform_name, data in trustradius_data.items():
        merged_entry = data.copy()
        merged_entry["TrustRadius Rating"] = data.get("What are the customer reviews and ratings of this platform?", "N/A")
        merged_entry["G2 Rating"] = "N/A"  # Placeholder for G2 rating
        merged_data.append(merged_entry)

    # Add G2 data, update existing entries with G2 rating
    for platform_name, data in g2_data.items():
        # Find existing entry in TrustRadius data, if it exists
        existing_entry = next((entry for entry in merged_data if entry["What is the name of this AI/ML software platform?"] == platform_name), None)
        if existing_entry:
            # Update with G2 rating if entry exists
            existing_entry["G2 Rating"] = data.get("What are the customer reviews and ratings of this platform?", "N/A")
        else:
            # Add new entry with G2 data if not in TrustRadius data
            new_entry = data.copy()
            new_entry["TrustRadius Rating"] = "N/A"  # Placeholder for TrustRadius rating
            new_entry["G2 Rating"] = data.get("What are the customer reviews and ratings of this platform?", "N/A")
            merged_data.append(new_entry)

    return merged_data

# Main function to load, merge, and save the merged data
def main():
    trustradius_data = load_csv(trustradius_path)
    g2_data = load_csv(g2_path)
    merged_data = merge_data(trustradius_data, g2_data)

    # Write merged data to CSV
    fieldnames = merged_data[0].keys()
    with open(output_file_path, mode='w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(merged_data)
    
    print(f"Merged CSV created at {output_file_path}")

if __name__ == "__main__":
    main()
