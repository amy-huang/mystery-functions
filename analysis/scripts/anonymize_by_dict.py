# This script anonymizes a csv file by assigning a number ID for each real ID
# and creating a new CSV with the new IDs
# It prints a csv of the mapping of real IDs to anonymized IDs to terminal
import csv
import sys

if len(sys.argv) < 3:
    print("Usage: python3 csv_parser.py <csv of real to anon IDs> [<CSVs to anonymize accordingly> ...]")
    exit(1)

ID_MAPPING = sys.argv[1]
CSVs_TO_CHANGE = sys.argv[2:]

if __name__ == "__main__":
    idsToAnonIds = {}
    # Get mappings
    with open(ID_MAPPING, newline='') as mappings:
        rows = csv.reader(mappings, delimiter=',')
        header = next(rows)
        for row in rows:
            idsToAnonIds[row[0]] = row[1]

    # For each file, change each row accordingly and write to new file
    for TO_CHANGE in CSVs_TO_CHANGE:
        with open(TO_CHANGE, newline='') as original:
            with open(TO_CHANGE + "_anon", "x") as anon:
                rows = csv.reader(original, delimiter=',')
                header = next(rows) # header

                for row in rows:
                    ID = row[0] # If ID is not in 1st column, change this index

                    # Get anon ID 
                    if ID not in idsToAnonIds:
                        newID = len(idsToAnonIds)
                        idsToAnonIds[ID] = newID
                    anonID = idsToAnonIds[ID]

                    # Change ID in csv row
                    row[0] = str(anonID)

                    # Write csv row to new file
                    for i in range(len(row)):
                        row[i] = "\"{}\"".format(row[i])
                    newRow = ",".join(row) + "\n"
                    anon.write(newRow)