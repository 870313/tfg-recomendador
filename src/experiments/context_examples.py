import datetime
import random

atHome = ['yes', 'no']
status = ['onHolidays', 'notOnHolidays']

weatherStatus = ['Clear', 'Thunderstorm', 'Clouds', 'Rain', 'Snow', 'Atmosphere', 'Drizzle']

preferences = ['Food', 'Party', 'Sport', 'Shows', 'Culture', 'Music', 'Education']
activities = ['Open-Air', 'Indoor', 'Both']

# Random date between 01/01/2020 and 31/12/2021
def random_date():
    start = datetime.date(2020, 1, 1)
    end= datetime.date(2021, 12, 31)

    # Get difference between dates in days
    time_between = end - start
    days_between = time_between.days

    # Random days and get date
    random_number_of_days = random.randrange(days_between)
    random_date = str(start + datetime.timedelta(days = random_number_of_days))
    random_date = random_date.replace("-","/")
    return random_date

# Random time between 00:00:00 and 23:59:59
def random_time():
    start = datetime.datetime(2021, 1, 1)
    randomTime = start + datetime.timedelta(seconds = random.randint(1, 3600 * 24))
    return randomTime.strftime('%H:%M:%S')


# Create random UserContext for final json
def create_user_context(id):
    randomDate = random_date()
    randomTime = random_time()

    statusCopy = status.copy()
    atHomeCopy = atHome.copy()
    aux = len(status) - 1
    randomStatus = statusCopy.pop(random.randint(0, aux))
    aux = len(atHome) - 1
    randomAtHome = atHomeCopy.pop(random.randint(0, aux))


    userContext = '{\"hasId\" : \"' + str(id) + '\", \"date\" : \"' + randomDate + '\", \"time\" : \"' + randomTime + \
                  '\", \"status\" : \"' + randomStatus + '\", \"atHome\" : \"' + randomAtHome + '\"}'
    return userContext

# Create random Preference for final json
def create_preferences():
    preferencesResult = '['
    i = random.randrange(1,4)

    for x in range(i):
        preferencesCopy = preferences.copy()
        activitiesCopy = activities.copy()

        aux = random.randint(0,len(preferences) - 1)
        typeOf = preferencesCopy.pop(aux)

        aux = random.randint(0, len(activities) - 1)
        where = activitiesCopy.pop(aux)
        preference = '{\"typeOf\" : \"' + typeOf + '\", \"where\" : \"' + where +'\"}'
        if (x != 0):
            preferencesResult = preferencesResult + ',' + preference
        else:
            preferencesResult = preferencesResult + preference

    preferencesResult = preferencesResult + ']'
    return preferencesResult

# Create random Observations for final json
def create_obsertvations():
    observations = '['
    observedBy = str(random.randrange(1000))
    observedProperty = 'WeatherStatus'

    weatherStatusCopy = weatherStatus.copy()

    aux = random.randint(0, len(weatherStatus) - 1)
    observationValue = weatherStatusCopy.pop(aux)

    time = random_time()

    observation1 = '{\"observedBy\" : \"' + observedBy + '\", \"featureOfInterest\" : \"me\", \"observedProperty\" : \"'\
                   + observedProperty + '\", \"observationValue\" : \"' + observationValue + '\", \"timeOfMeasurement\" : \"' + \
                   time + '\"}'

    observations = observations + observation1

    i = random.randrange(2)
    #Generate WeatherTemperature observation
    if(i == 1):
        observedProperty = 'WeatherTemperature'
        observationValue = str(random.randrange(45))

        time = random_time()

        observation2 = '{\"observedBy\" : \"' + observedBy + '\", \"featureOfInterest\" : \"me\", \"observedProperty\" : \"' \
                       + observedProperty + '\", \"observationValue\" : \"' + observationValue + '\", \"timeOfMeasurement\" : \"' + \
                       time + '\"}'
        observations = observations + ',' + observation2

    observations = observations + ']'
    return observations


def create_complete_context(id):
    userContext = create_user_context(id)
    preferencesArray = create_preferences()
    observationsArray = create_obsertvations()

    context = '{ \"UserContext\" : ' + userContext + ', \"Preferences\" : ' + preferencesArray + \
              ', \"Observations\" : ' + observationsArray + '}'
    return context

def create_multiple_context(n):
    jsonContext = '{ \"default\" : [ \n'

    for x in range(n):
        element = create_complete_context(x)

        if(x == 0):
            jsonContext = jsonContext + element + '\n'
        else:
            jsonContext = jsonContext + ',' + element + '\n'

    jsonContext = jsonContext + '] }'
    print(jsonContext)
    return jsonContext


result = create_multiple_context(22)

file_object = open('21-random-context.json', 'a')

file_object.write(result)
file_object.close()