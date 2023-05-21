const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const NodeCache = require('node-cache');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();
app.use(bodyParser.json());

const api_key = '7e3b0d29938664cd4b32b1484a711b4a';

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'API documentation for the Weather app',
    },
    securityDefinitions: {
      basicAuth: {
        type: 'basic',
      },
    },
    security: [{
      basicAuth: [],
    }],
  },
  apis: ['./doc.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const cache = new NodeCache({ stdTTL: 480 });

const validUsers = {
  admin : 'admin',
  user : 'user',
}

// function to check if user is authorised or not

const Authentification = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic '))
  return res.status(401).json({ error : 'Not authorised'})


const encodedCredentials = authHeader.slice(6);
const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
const [username, password] = decodedCredentials.split(':')

if (!validUsers.hasOwnProperty(username) || validUsers[username] !== password ){
  return res.status(401).json({ error : 'Not authorised'});
}

next();
};

const getWeatherData = async (url) => {
  const cacheKey = url;
  const cachedData = cache.get(cacheKey);

  if (cachedData){
    console.log('Cached data')
    return cachedData;
  }

  console.log('New data from API');
  try{
    const response = await axios.get(url);
    const weatherData = response.data;
    cache.set(cacheKey, weatherData);
    return weatherData;

  }
  catch (error) {
    return res.status(500).json({ error: 'Error retrieving weather data' });
  }
}

/**
 * @swagger
 * tags:
 *   name: Weather
 *   description: Weather API
 */

/**
 * @swagger
 * /weather/current:
 *   get:
 *     summary: Get current weather data for a location
 *     tags: [Weather]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: The location for which to retrieve weather data
 *     responses:
 *        200:
 *          description: Successful response
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CurrentWeatherResponse'
 */

// current location

app.get('/weather/current', Authentification, async (req, res) => {
  const location = req.query.location;
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is missing' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${api_key}`;

  try {
    const weatherData = await getWeatherData(url);
    // current weather data
    return res.json({
      provider: 'OpenWeatherMap',
      lastRefreshed: new Date(),
      data: {
        temperature: weatherData.main.temp, // gets temp
        humidity: weatherData.main.humidity, // gets humidity
        description: weatherData.weather[0].description, // description of weather
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving weather data' });
  }
});

/**
 * @swagger
 * /weather/forecast:
 *   get:
 *     summary: Get weather forecast for a location
 *     tags: [Weather]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: The location for which to retrieve weather forecast
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForecastResponse'
 */

// forecast for location
app.get('/weather/forecast', Authentification, async (req, res) => {
  const location = req.query.location;
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is missing' });
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${api_key}`;


  try {
    const forecastData = await getWeatherData(url);
    const forecastList = forecastData.list.map(forecast => ({
      date: forecast.dt_txt, // gets date and time
      temperature: forecast.main.temp, // gets temp
      humidity: forecast.main.humidity, // gets humidity
      description: forecast.weather[0].description, // description of weather
    }));
    // forecast data
    return res.json({
      provider: 'OpenWeatherMap',
      lastRefreshed: new Date(),
      data: forecastList,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving weather data' });
  }
});

/**
 * @swagger
 * /weather/history:
 *   get:
 *     summary: Get historical weather data for a location within a date range
 *     tags: [Weather]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: The location for which to retrieve historical weather data
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The start date of the historical weather data range (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The end date of the historical weather data range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryWeatherResponse'
 */


// history
app.get('/weather/history', Authentification, async (req, res) => {
  const location = req.query.location;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  if (!location) {
    return res.status(400).json({ error: 'Location parameter is missing' });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and/or end date parameters are missing' });
  }

  // get latitude and longitude for the location
  try {
    const locationResponse = await axios.get(`http://api.openweathermap.org/data/2.5/history/city?q=${location}&type=hour&start=${startDate}&end=${endDate}&appid=${api_key}`);
    const { lat, lng } = locationResponse.data.results[0].geometry.location;

    // convert start and end date to Unix timestamps
    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = new Date(endDate).getTime() / 1000;

    // make call to OpenWeatherMap API to get historical weather data
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lng}&dt=${startTimestamp}&appid=${api_key}`);
    const historyData = response.data;
    return res.json({
      provider: 'OpenWeatherMap',
      lastRefreshed: new Date(),
      data: {
        temperature: historyData.current.temp,
        humidity: historyData.current.humidity,
        description: historyData.current.weather[0].description,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving weather data' });
  }
});




app.listen(3000, () => {
  console.log('Weather app listening on port 3000!');
});
