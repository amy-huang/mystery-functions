# This script anonymizes a csv file by assigning a number ID for each real ID
# and creating a new CSV with the new IDs
# It prints a csv of the mapping of real IDs to anonymized IDs to terminal
import csv
import sys

if len(sys.argv) < 3:
    print("Usage: python3 csv_parser.py <CSV with all database rows> <anonymized CSV name>")
    exit(1)

DB_ROWS = sys.argv[1]
NEW_CSV_NAME = sys.argv[2]

if __name__ == "__main__":
    idsToAnonIds = {}
    with open(NEW_CSV_NAME, "x") as anon:
        with open(DB_ROWS, newline='') as csvfile:
            rows = csv.reader(csvfile, delimiter=',')
            header = next(rows) # header
            anon.write(",".join(header) + "\n")

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

    # print("Mapping real IDs to anonymous IDs:")
    for ID in idsToAnonIds:
        print("{}, {}".format(ID, idsToAnonIds[ID]))