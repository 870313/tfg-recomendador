import random
import sys
from random import randrange
from shutil import copy2

# POR AHORA NO UTILIZADO EL ARRAY
rules = ['DaysOfWeek', 'Weekend', 'NotWeekend', 'Season', 'PartsOfTheDay', 'Time4Lunch', 'Time4Dinner', 'WeatherStatus',
         'isHot', 'isCold']

daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
season = ['summer', 'winter', 'spring', 'autumn']
partsOfTheDay = ['earlyMorning', 'morning', 'afternoon', 'night']
weatherStatus = ['Clear', 'Thunderstorm', 'Clouds', 'Rain', 'Snow', 'Atmosphere', 'Drizzle']
atHome = ['yes', 'no']
onHolidays = ['onHolidays', 'notOnHolidays']

generatedRules = []

endFile = '@info(name = \'finalResults\') from Results#window.timeBatch(2 sec) select contextId, ' + \
          'str:groupConcat(recommendation) as recommendation group by contextId insert into FinalResults;'


# Random Weekday
def random_weekday():
    daysOfWeekCopy = daysOfWeek.copy()
    i = len(daysOfWeek) - 1
    i = random.randint(0, i)
    day = daysOfWeekCopy.pop(i)
    dayFilter = 'every d = DaysOfWeek[dayOfWeek == \'' + day + '\']'
    return dayFilter


# Random season
def random_season():
    seasonCopy = season.copy()
    i = random.randint(0, len(season) - 1)
    seasonItem = seasonCopy.pop(i)
    seasonFilter = 'every s = Season[contextId == d.contextId and season == \'' + seasonItem + '\']'
    return seasonFilter


# Random partOfDay
def random_part_of_day():
    partsOfTheDayCopy = partsOfTheDay.copy()
    i = random.randint(0, len(partsOfTheDayCopy) - 1)
    part = partsOfTheDayCopy.pop(i)
    partOfDayFilter = 'every p = PartsOfTheDay[contextId == d.contextId and partOfTheDay == \'' + part + '\']'

    i = randrange(2)

    # Buscamos añadir otra context rule de manera aleatoria
    # Mirar si podría ser hora de comer o no
    if (part == 'afternoon' and i == 1):
        partOfDayFilter = partOfDayFilter + ' -> ' + time_4_lunch_string()

    # Mirar si podría ser hora de comer o no
    if (part == 'night' and i == 1):
        partOfDayFilter = partOfDayFilter + ' -> ' + time_4_dinner_string()
    return partOfDayFilter

# string time_4_lunch
def time_4_lunch_string():
    time_4_lunch = 'every p = Time4Lunch[contextId == d.contextId]'
    return time_4_lunch

# string time_4_dinner
def time_4_dinner_string():
    time_4_lunch = 'every p = Time4Dinner[contextId == d.contextId]'
    return time_4_lunch


# Random weatherStatus
def random_weather_status():
    weatherStatusCopy = weatherStatus.copy()
    i = random.randint(0, len(weatherStatus) - 1)
    weather = weatherStatusCopy.pop(i)
    weatherFilter = 'every w = WeatherStatus[contextId == d.contextId and weatherStatus == \'' + weather + '\']'
    return weatherFilter


def random_user_context():
    atHomeCopy = atHome.copy()
    onHolidaysCopy = onHolidays.copy()

    i = random.randint(0,len(atHome) - 1)
    j = random.randint(0, len(onHolidays) - 1)

    home = atHomeCopy.pop(i)
    status = onHolidaysCopy.pop(j)

    userContextFilter = 'every u = UserContext[hasId == d.contextId and status == \'' + status + '\' and atHome == \'' + home + '\']'
    return userContextFilter


def createRule(x):

    dayFilter = random_weekday()

    r = '@info(\'trigger' + str(x) + '\')'

    result = 'from ' + dayFilter

    # Season
    i = randrange(4)
    if (i == 0):
        seasonFilter = random_season()
        result = result + ' -> ' + seasonFilter

    # PartOfDay
    i = randrange(4)
    if (i == 0):
        partOfDayFilter = random_part_of_day()
        result = result + ' -> ' + partOfDayFilter

    # UserContextFilter
    i = randrange(4)
    if (i == 0):
        userContextFilter = random_user_context()
        result = result + ' -> ' + userContextFilter

    # WeatherStatusFilter
    i = randrange(4)
    if (i == 0):
        weatherStatusFilter = random_weather_status()
        result = result + ' -> ' + weatherStatusFilter



    if(result not in generatedRules):
        generatedRules.append(result)
        result = r + result + ' select d.contextId, \'trigger' + str(x) + '\' as recommendation insert into Results;'
        result = result + '\n'
        return result
    else:
        print("Rule repeated")
        print(result)
        return createRule(x)


def createMultipleRules(i):
    result = ''
    for x in range(i):
        result = result + createRule(x)
    return result

# MAIN
# Copy context rules from file to result file
copy2('./siddhi.txt', '50-random-rules.txt')

result = createMultipleRules(50)

resultList = result.split("\n")

# Inform repeated rules
if(len(resultList) != len(set(resultList))):
    print("Watch out! Repeated elements")

# Open a file with access mode 'a'
file_object = open('50-random-rules.txt', 'a')
# Append 'hello' at the end of file
file_object.write('\n')
file_object.write('\n')
file_object.write(result)
file_object.write('\n')
file_object.write(endFile)
# Close the file
file_object.close()
