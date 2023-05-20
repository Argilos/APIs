const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
app.use(bodyParser.json());

const api_key = '7e3b0d29938664cd4b32b1484a711b4a';
const cache = new NodeCache({ stdTTL:300 });

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

//current location
app.get('/weather/current', async (req, res) => {
  const location = req.query.location;
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is missing' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${api_key}`;

  try {
    const weatherData = await getWeatherData(url);
    //current weather data
    return res.json({
      provider: 'OpenWeatherMap',
      lastRefreshed: new Date(),
      data: {
        temperature: weatherData.main.temp, //gets temp
        humidity: weatherData.main.humidity, //gets humidity
        description: weatherData.weather[0].description, //description of weather
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving weather data' });
  }
});

//forecast for location
app.get('/weather/forecast', async (req, res) => {
  const location = req.query.location;
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is missing' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${api_key}`;


  try {
    const forecastData = await getWeatherData(url);
    const forecastList = forecastData.list.map(forecast => ({
      date: forecast.dt_txt, //gets date and time
      temperature: forecast.main.temp, //gets temp
      humidity: forecast.main.humidity, //gets humidity
      description: forecast.weather[0].description, //description of weather
    }));
    //forecast data
    return res.json({
      provider: 'OpenWeatherMap',
      lastRefreshed: new Date(),
      data: forecastList,
    });
  } catch (error) {
    return res.status(400).json({ error: 'Error retrieving weather data' });
  }
});



// history
app.get('/weather/history', async (req, res) => {
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
