const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const api_key = '7e3b0d29938664cd4b32b1484a711b4a';

//current location
app.get('/weather/current', async (req, res) => {
  const location = req.query.location;
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is missing' });
  }

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${api_key}`);
    const weatherData = response.data;
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
//f


app.listen(3000, () => {
  console.log('Weather app listening on port 3000!');
});