import csv
import sys
from datetime import *
from statistics import *

# For consecutive input similarity
from Levenshtein import distance, editops
from distance import jaccard
from stringdist import rdlevenshtein, levenshtein

# For clustering
from sklearn.cluster import KMeans
import numpy as np

from actions import *

if len(sys.argv) < 3:
    print("Usage: python3 csv_parser.py <CSV with all database rows> [<Function names to apply operations to> ...]")
    print("Functions available for analysis: Average, Median, SumParityBool, SumParityInt, SumBetween, Induced")
    exit(1)

# Names of all functions to do analysis onust the names
ALL_FCN_NAMES = ["Average", "Median", "SumParityBool", "SumParityInt", "SumBetween", "Induced"]

#################################################################
# Input Similarity Comparison

# Because we want to consider each integer a single character when
# using Levenshtein distance, we map each integer seen in the data
# to a unique string character. The resulting string for each
# input is then used for calculating distances between inputs.

# To help with mapping integers to characters and inputs to strings,
# the below classes each have a getNums method for extracting a 
# list of integers from the value of that type for the mapping of integers
# to characters, and a toCharas method to turn a value of that type
# into a string based on the mapping made.

class Bool:
	@staticmethod
	def getNums(val):
		if val == "true":
			return "1"
		return ["0"]

	@staticmethod
	def toCharas(val):
		return charaMappings[val]

class Int:
	@staticmethod
	def getNums(val):
		return [val]

	@staticmethod
	def toCharas(val):
		return charaMappings[val]

class ListInt:
	@staticmethod
	def getNums(val):
		nums = val.split()
		return nums

	@staticmethod
	def toCharas(val):
		charas = ""
		nums = val.split()
		for n in nums:
			charas += charaMappings[n]
		return charas

class Float:
	@staticmethod
	def getNums(val):
		return [val]

	@staticmethod
	def toCharas(val):
		return charaMappings[val]

# Function input and output types
in_out_types = {
    "Average": [ListInt, Float],
    "Median": [ListInt, Float],
    "SumParityInt": [ListInt, Int],
    "SumParityBool": [ListInt, Bool],
    "Induced": [Int, Int],
    "EvenlyDividesIntoFirst": [ListInt, Bool],
    "SecondIntoFirstDivisible": [ListInt, Bool],
    "FirstIntoSecondDivisible": [ListInt, Bool],
    "SumBetween": [ListInt, Int],
}

# Number of inputs per function
num_inputs = {
    "Average": 1,
    "Median": 1,
    "SumParityInt": 1,
    "SumParityBool": 1,
    "Induced": 1,
    "EvenlyDividesIntoFirst": 2,
    "FirstIntoSecondDivisible": 2,
    "SecondIntoFirstDivisible": 2,
    "SumBetween": 2,
}

# Keys are all of the integers seen; each value is True
seenNums = {}
# Mapping each seen value to a unicode character
charaMappings = {}

# Given an input or output for a function, 
# figure out what type the value is and get the corresponding
# integer values to return. For single integer, return a list with just itself,
# for lists of integers, return that list of integers, and for 
# booleans return 0 or 1
def getIntVals(fcn, isInput, value):
    valType = None
    # See if the value is a function input or output,
    # and retrieve the right type based on that
    if isInput == True:
        valType = in_out_types[fcn][0]
    else: 
        valType = in_out_types[fcn][1]

    # If there are multiple inputs, get values of each input
    if num_inputs[fcn] > 1:
        args = value.split()
        if isInput == True and len(args) != num_inputs[fcn]:
            # print("error, num args does not match args found")
            args = value.split(",")

        vals = []
        for a in args:
            # Call getNums on each argument to get integer values seen
            vals += valType.getNums(a)
        return vals

    # Only 1 input
    elif num_inputs[fcn] == 1:
        return valType.getNums(value)

    else:
        print("error, invalid number of arguments: {}".format(num_inputs[fcn]))

# Record the given list of integers as seen
def recordSeenInts(seenInts):
    for val in seenInts:
        seenNums[val] = True

# Sort the list of seen integers and assign each to a character
def makeCharaMappings():
    sortedKeys = sorted(seenNums.keys())
    for i in range(len(sortedKeys)):
        charaMappings[sortedKeys[i]] = chr(i)

####################################################################

def inducedDiff(first, second: EvalInput):
    return rdlevenshtein(first.input, second.input)

def inducedEditOps(first, second: EvalInput):
    return editops(first.input, second.input)

# Gets the edit operations between the given inputs
# Output specification: https://github.com/ztane/python-Levenshtein/wiki#Levenshtein-editops
def inputEditOps(fcn:str, first, second: EvalInput):
    if fcn == "Induced":
        return inducedEditOps(first, second)

    inType = in_out_types[fcn][0]
    firstCharas = inType.toCharas(first.input)
    secondCharas = inType.toCharas(second.input)
    return editops(firstCharas, secondCharas)

# Calculates edit distance from default input value, nothing, to first input
def inputEditOpsFromBlank(inp: EvalInput):
    return editops("", inp.input)

def inputDifference(fcn:str, first, second: EvalInput):
    if fcn == "Induced":
        return inducedDiff(first, second)

    inType = in_out_types[fcn][0]
    firstCharas = inType.toCharas(first.input)
    secondCharas = inType.toCharas(second.input)
    return rdlevenshtein(firstCharas, secondCharas)

#################################################################

if __name__ == "__main__":

    # Do initial recording of each subject's traces into Subject objects.
    # For each database row, record the action
    # The Subject class has methods that are useful later on for analysis
    # once all of the actions for a Subject have been recorded.

    idsToSubs = {} # Maps IDs to subjects
    with open(sys.argv[1], newline='') as csvfile:
        rows = csv.reader(csvfile, delimiter=',')
        header = next(rows) # header

        # Current subject we're recording actions for
        subject = None
        # Go through each database row
        for row in rows:
            # See if we need to start a new Subject
            ID = row[0]
            if subject == None:
                subject = Subject(ID)
                idsToSubs[ID] = subject
            elif ID != subject.ID:
                subject = Subject(ID)
                idsToSubs[ID] = subject

            fcnName = row[1]
            key = row[2]
            time = row[4]
            actType = row[3]
            action = None

            inType = in_out_types[fcnName]
            outType = in_out_types[fcnName]

            # Record specific action taken
            if (actType == "eval_input"):
                action = EvalInput(key, time)
                inp = row[5]
                out = row[6]
                action.setInputOutput(inp, out)

                # Used to generate character to integer mappings for use in 
                # calculating Levenshtein distance
                recordSeenInts(getIntVals(fcnName, True, inp))
                recordSeenInts(getIntVals(fcnName, False, out))

                subject.addEvalInput(fcnName, action)

            elif (actType == "quiz_answer"):
                action = QuizQ(key, time)
                quizQ = row[7]
                inp = row[5]
                out = row[6]
                realOut = row[8]
                result = row[9]

                display = "✗"
                if (result == "true"):
                    display = "✓"

                action.setQ(quizQ, inp, out, realOut, display)

                recordSeenInts(getIntVals(fcnName, True, inp))
                recordSeenInts(getIntVals(fcnName, False, out))
                recordSeenInts(getIntVals(fcnName, False, realOut))

                subject.addQuizQ(fcnName, action)

            elif (actType == "final_answer"):
                action = FinalAnswer(key, time)
                guess = row[10]
                action.setGuess(guess)
                subject.addFinalAnswer(fcnName, action)
            # else:ust the names
            #     print("WARNING: unknown action type")

    # Make character mappings using the characters observed
    makeCharaMappings()

    ##########################################################################################################

    # Now that we have all Subject action data, go through the answer labels and associate them with the
    # right subjects so we can do analysis of all of that data together.

    # Will keep track of the well-formedness labels (comp for completion)
    # and corrections labels (cor for correctness) of subjects by subject pool, function, and ID
    compCorDicts = { "32": FcnSubDivider(), "IU": FcnSubDivider() }

    # Open each label guess csv
    # Process function guess labels, add them to each Subject object, and do other calculations
    for subjectPool in ["32", "IU"]:
        for fcn in ALL_FCN_NAMES:
            with open("answer_labels/anon_{}_{}.csv".format(subjectPool, fcn), newline='') as csvfile:
                rows = csv.reader(csvfile, delimiter=',')
                header = next(rows) # header

                # Each row represents a function guess for a given subject and function
                for row in rows:
                    ID = row[0]
                    answer = row[1]
                    tags = []
                    # Make list of each tag for given answer
                    for i in range(2, len(row)):
                        enteredTags = row[i].split()
                        for tag in enteredTags:
                            if tag != '':
                                tags.append(tag)

                    # Add tags to corresponding Subject
                    if ID not in idsToSubs:
                        print("WARNING: this ID has no subject", ID)
                        continue
                    if idsToSubs[ID] == None:
                        print("WARNING: this ID has None subject", ID)
                        continue
                    subject = idsToSubs[ID]
                    if subject.didFcn(fcn):
                        idsToSubs[ID].addAnswerTags(fcn, tags)

                    # Record subject pool
                    subject.addSubjectPool(subjectPool)

                    # Get correctness rating
                    # rating = 0
                    if "COR" in tags:
                        compCorDicts[subjectPool].addCorRating(ID, fcn, 4)
                    elif "MCOR" in tags:
                        compCorDicts[subjectPool].addCorRating(ID, fcn, 3)
                    elif "SCOR" in tags:
                        compCorDicts[subjectPool].addCorRating(ID, fcn, 2)
                    elif "XCOR" in tags:
                        compCorDicts[subjectPool].addCorRating(ID, fcn, 1)

                    # Get well-formedness rating
                    if "NONS" in tags:
                        compCorDicts[subjectPool].addCompRating(ID, fcn, "NONS")
                    elif "IDK" in tags:
                        compCorDicts[subjectPool].addCompRating(ID, fcn, "IDK")
                    elif "NORM" in tags:
                        compCorDicts[subjectPool].addCompRating(ID, fcn, "NORM")
                    else:
                        print("Warning: {} does not have comprehensiveness rating for {}".format(ID, fcn))

    #############################################################################################################

    # Prints out the completion and correctness ratings for each subject pool 
    # print("IU Completion and correctness ratings")
    # print(compCorDicts["IU"])
    # print("32 Completion and correctness ratings")
    # print(compCorDicts["32"])

    #############################################################################################################

    # Calculate edit distance and edit operations between input evaluations for each function a subject has done. 
    # The command line arguments passed to this script determines what functions are looked at

    # Make keeper of tag frequency distribution, by function and correctness rating.
    tagFrequencies = TagsByFcn()
    
    # Maps ID_FCN to list of operations groups, a space separated string of the operations, for each session (defined by ID_FCN)
    editOps = {} 
    # Maps ID_FCN to list of lengths of operation chains for each session
    stretchLens = {}
    # Maps ID_FCN to list of lengths of operations groups for each session
    numOps = {}
    # Maps operation groups to list of operation chains they appear in 
    groupLens = {}

    # Used for vector clustering later on, to figure out which vectors of chain lengths
    # are in which groups
    allIDs = []
    allLists = []

    # For each session (one subject completing one function), record metrics and do calculations
    # When defined here, this distribution keeper tracks metrics for all function sessions.
    # Can also create ones for each function
    distros = DistributionKeeper() 
    for fcn in sys.argv[2:]:
        for ID in idsToSubs.keys():
            # For use as a key value in dicts
            ID_FCN = "{}_{}".format(ID, fcn)

            # Get correctness tag for answer
            tags = idsToSubs[ID].getAnswerTags(fcn)
            if tags != None:
                if "COR" in tags:
                    rating = "COR"
                elif "MCOR" in tags:
                    rating = "MCOR"
                elif "SCOR" in tags:
                    rating = "SCOR"
                elif "XCOR" in tags:
                    rating = "XCOR"
                else:
                    # print("ID {} fcn {} has no rating".format(ID, fcn))
                    continue

                # Record the tags for frequency breakdown
                tagFrequencies.addTags(fcn, tags)

                # Record the number of input evaluations for this session
                evals = idsToSubs[ID].functionAttempts[fcn].allEvals()
                distros.addNumEvals(rating, len(evals))

                diffsArray = [] # List of edit distances for each pair of inputs
                editOps[ID_FCN] = [] # List of operation groups in order
                numOps[ID_FCN] = [] # Lengths of each operation group in order
            
                # Variables for recording the lengths of operation chains and edit operations groups
                currOps = "" # Edit operations group defining the current chain
                currLen = 0 # Length of current operation chain

                # For each consecutive pair of inputs evaluated...
                for i in range(0, len(evals)):
                    # Calculate edit distance and record
                    diff = inputDifference(fcn, evals[i-1], evals[i])
                    diffsArray.append(diff)
                    
                    # Get edit operations - list of tuples: (operation name, index)
                    ops = inputEditOps(fcn, evals[i-1], evals[i])
                    if i == 0: # If is the first input evaluated
                        ops = inputEditOpsFromBlank(evals[i])

                    # Record number of operations in the operations group
                    numOps[ID_FCN].append(len(ops))
                    
                    # From the edit operations, get just the names of operations and then
                    # combine them into a single space separated string
                    currOpsList = []
                    for op in ops:
                        currOpsList.append(op[0])
                    nextOps = " ".join(sorted(currOpsList))

                    # See if the current stretch of identical operations groups has ended. 
                    # If not, increase current length
                    if nextOps == currOps:
                        currLen += 1
                    else:
                        # Otherwise, 
                        # If the edit operations group is empty, that means the input stayed 
                        # the same so also just increment current length
                        if len(nextOps) == 0:
                            currLen += 1
                        else:
                            # Otherwise, that means the current chain has just ended. 
                            # Record the chain characteristics
                            if len(currOps) > 0:
                                # Record length of chain for this ID_FCN
                                if not ID_FCN in stretchLens:
                                    stretchLens[ID_FCN] = []
                                stretchLens[ID_FCN].append(currLen)

                                # Record edit operation group for this ID_FCN
                                editOps[ID_FCN].append(currOps)

                                # Record length of chain for this operation group
                                # so later we can see distribution of lengths
                                if currOps not in groupLens:
                                    groupLens[currOps] = []
                                groupLens[currOps].append(currLen)

                            # Start monitoring new chain
                            currOps = nextOps
                            currLen = 1

                # Record the final operation chain that wasn't recorded yet
                # because there was no change in operation group before we ran out of 
                # input pairs to look at
                if len(currOps) > 0:
                    # Record length of chain for this ID_FCN
                    if not ID_FCN in stretchLens:
                        stretchLens[ID_FCN] = []
                    stretchLens[ID_FCN].append(currLen)

                    # Record edit operation group for this ID_FCN
                    editOps[ID_FCN].append(currOps)

                    # Record length of chain for this operation group
                    # so later we can see distribution of lengths
                    if currOps not in groupLens:
                        groupLens[currOps] = []
                    groupLens[currOps].append(currLen)

                # Used for vector clustering later on, to figure out which vectors of chain lengths
                # are in which groups
                allIDs.append("{}_{}".format(ID, fcn))
                allLists.append(diffsArray)
                
                # Record the number of quiz attempts and the numbers of inputs evaluated
                # between quiz attempts for this correctness rating
                sub = idsToSubs[ID]
                actions, EIs, QAs = sub.allFcnActions(fcn)
                distros.addQuizAttempts(rating, len(QAs.keys())) 
                distros.addEIsBwQAs(rating, ID_FCN, sub.getEvalLens(fcn))

    ##################################################################################################################

    # Summary metrics to print out, each is by correctness rating
    # print(distros.firstStretchStats()) # average and median length of first stretch of inputs evaluation before first quiz attempt
    # print(distros.EIsBwQAs()) # For each ID_FCN, prints out the list numbers of inputs evaluated between quiz attempts
    # print(distros.numEvals()) # Median number of input evaluations 
    # print(distros.quizAttempts()) # Number of quiz attempts 
    # print(tagFrequencies)

    # Average length of each chain by operation group
    # for opsGroup in sorted(groupLens.keys()):
    #     print("{}, {}, {}".format(opsGroup, len(groupLens[opsGroup]), sum(groupLens[opsGroup])/ len(groupLens[opsGroup])))

    ##################################################################################################################

    # Prints out the ratings distributions by function
    allRatings = { "32": { "Average": { 4: 0, 3: 0, 2: 0, 1: 0}, "Median": { 4: 0, 3: 0, 2: 0, 1: 0}, "SumParityBool": { 4: 0, 3: 0, 2: 0, 1: 0}, "SumParityInt": { 4: 0, 3: 0, 2: 0, 1: 0}, "SumBetween": { 4: 0, 3: 0, 2: 0, 1: 0}, "Induced": { 4: 0, 3: 0, 2: 0, 1: 0} }, "IU": { "Average": { 4: 0, 3: 0, 2: 0, 1: 0}, "Median": { 4: 0, 3: 0, 2: 0, 1: 0}, "SumParityBool": { 4: 0, 3: 0, 2: 0, 1: 0}, "SumParityInt": { 4: 0, 3: 0, 2: 0, 1: 0}, "SumBetween": { 4: 0, 3: 0, 2: 0, 1: 0}, "Induced": { 4: 0, 3: 0, 2: 0, 1: 0} }}
    for ID in idsToSubs:
        sub = idsToSubs[ID]
        fcns = sub.fcnNames()
        for f in fcns:
            rating = sub.fcnScore(f)
            if rating > 0:
                allRatings[sub.subjectPool][f][rating] += 1

    for which in allRatings:
        for fcn in allRatings[which]:
            line = "{}, {}, ".format(which, fcn)
            for rating in range(1, 5):
                line += "{}, ".format(allRatings[which][fcn][rating])
                # print(line)

    ##################################################################################################################

    # Average deviation from average operation chain length
    chainLenDiffs = []
    chainLenDiffFromAvgs = []
    allChainLens = []
    for eoID in stretchLens:
        for sl in stretchLens[eoID]:
            allChainLens.append(sl)
    chainLenAvg = sum(allChainLens)/len(allChainLens)
    for eoID in stretchLens:
        lensTrace = stretchLens[eoID]
        for i in range(0, len(lensTrace)):
            if i > 0:
                diff = abs(lensTrace[i-1] - lensTrace[i])
                chainLenDiffs.append(diff)
                if eoID == "mghani1_Median":
                    print("{} idx {} diff bw lenths is {}".format(eoID, i, diff))
            diffFromAvg = abs(lensTrace[i] - chainLenAvg)
            chainLenDiffFromAvgs.append(diffFromAvg)
            if eoID == "mghani1_Median":
                print("{} idx {} diff from avg is {}".format(eoID, i, diffFromAvg))
    avgDiffFromAvg = sum(chainLenDiffFromAvgs)/len(chainLenDiffFromAvgs)
    avgConsecDiff = sum(chainLenDiffs)/len(chainLenDiffs)
    # print("Average chain length {}".format(chainLenAvg))
    # print("Average chain length diff from average: {} Avg diff b/w consec chain lengths {}".format(avgDiffFromAvg, avgConsecDiff))

    ##################################################################################################################

    # The sequences of operation chain lengths, when graph, appear very "spiky": the chain lengths often oscillate
    # between 1 and higher lengths
    # To quantify this, I found the likelihood that a length >1 operation chain was only adjacent to chains of length 1

    adjacentAreOnes = 0
    totalPoints = 0
    pointLens = [] 
    for stretchID in stretchLens:
        ID = stretchID.split("_")[0]
        trace = stretchLens[stretchID]
        for i in range(0, len(trace)):
             # For each chain of length >1...
            if trace[i] > 1:
                # See if this point is a "spike" point: only adjacent to chains length 1
                isSpikePoint = False
                if i == 0: 
                    if len(trace) > 1: 
                        # If there exists a 1st chain, see if next chain length is 1
                        totalPoints += 1
                        if trace[i+1] == 1:
                            adjacentAreOnes += 1
                            pointLens.append(trace[i])
                elif i == len(trace) - 1:
                    if len(trace) > 1:
                        # If there exists a last chain, see if previous chain length is 1
                        totalPoints += 1
                        if trace[i-1] == 1:
                            adjacentAreOnes += 1 
                            pointLens.append(trace[i])
                else:
                    # If this chain is surrounded by 2 other chains, see if both are length 1
                    totalPoints += 1
                    if trace[i-1] == 1 and trace[i+1] == 1:
                        adjacentAreOnes += 1
                        pointLens.append(trace[i])

    # print("Number of operation chains of length > 1 are adjacent only to chains length 1:", adjacentAreOnes)
    # print("Total # of such chains:", totalPoints)
    # print("Average length of such chains:", sum(pointLens)/len(pointLens))

    ##################################################################################################################

    # K-Clustering vectors of operation group lens, to try and pick out patterns in input picking strategies.
    # Did not end up yielding anything useful, but can be adapted to future clustering uses
    # Since each trace of operation chain lengths can have a different length, I first found the length of the 
    # longest one, and padded the rest of them with 0s

    # Clusters are generated for k = 1 to k = 10 inclusive, and the WSS values are printed out so that the optimal 
    # number of clusters can be determined using the elbow method. It turned out that chain lengths were not 
    # easily clustered, and so the elbow shape did not appear.

    # To use this, uncomment the line writing to the CSVs and also the one printing out the WSS value for each k

    # Getting all traces and finding the max length
    maxConsecLen = 0
    allLists = []
    for user in stretchLens:
        trace = stretchLens[user]
        if len(trace) > maxConsecLen:
            maxConsecLen = len(trace)
        allLists.append(stretchLens[user])
        
    # Padding all shorter vectors with 0s
    filled = []
    for l in allLists:
        newTrace = []
        for num in l:
            newTrace.append(num)
        while len(newTrace) < maxConsecLen:
            newTrace.append(0)
        filled.append(newTrace)

    toCluster = np.array(filled)
    for k in range(1, 11):
        kmeans = KMeans(n_clusters = k).fit(toCluster)
        centroids = kmeans.cluster_centers_
        pred_clusters = kmeans.predict(toCluster)
        curr_sse = 0

        # Write result to CSV
        clusterIdxs = {}
        for i in range(len(kmeans.labels_)):
            if kmeans.labels_[i] not in clusterIdxs:
                clusterIdxs[kmeans.labels_[i]] = []
            clusterIdxs[kmeans.labels_[i]].append(i)

        # Record the clustering groups to CSV for every value of k t
        # csv_name = "{}_k{}.csv".format("".join(sys.argv[2:]), k)
        # with open(csv_name, "w") as CSVFILE:
        #     for label in sorted(clusterIdxs.keys()):
        #         CSVFILE.write("Cluster {},\n".format(label))
        #         for idx in clusterIdxs[label]:
        #             ID = allIDs[idx]
        #             line = "{}, ".format(ID)
        #             trace = allLists[idx]
        #             for val in trace:
        #                 line += "{}, ".format(val)
        #             line += "\n"
        #             CSVFILE.write(line)
        
        # Print out WSS value for this value of K
        for i in range(len(toCluster)):
            curr_center = centroids[pred_clusters[i]]
            curr_sse += (toCluster[i, 0] - curr_center[0]) ** 2 + (toCluster[i, 1] - curr_center[1]) ** 2
    #       print("{}, {},".format(k, curr_sse))





