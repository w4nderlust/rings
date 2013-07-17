import csv
from collections import defaultdict

country_map = defaultdict(str)
with open('continents.csv', 'rb') as csvfile:
	spamreader = csv.reader(csvfile)
	for row in spamreader:
		country_map[row[0]] = row[1]

output_file = open('olympics_with_continents.csv', 'wb')
spamwriter = csv.writer(output_file)
with open('olympics.csv', 'rb') as csvfile:
	spamreader = csv.reader(csvfile)
	for row in spamreader:
		country = row[1]
		continent = country_map[country]
		if continent == '':
			print 'Missing country: ' + country
		row.insert(2, continent)
		spamwriter.writerow(row)