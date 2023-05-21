# Weather APIs

This is a simple weather API that provides current weather, forecast and history of weather for a specific location.
It uses OpenWeatherMap API to fetch data based on user queries.

##INSTALATION
  1. Clone repository
      https://github.com/Argilos/APIs
      
  2. Install dependencies
     1. npm install express
     2. npm install axios
     3. npm install node-cache
     4. npm install swagger-jsdoc
     5. npm install swagger-ui-express

API DOCUMENTATION 
  API documentation is available using Swagger UI. To access it enter http://localhost:3000/api-docs in your browser
  

Endpoints:

  GET /weather/current: returns the current weather conditions for a specific location
    Parameters: 'location' 
    
  GET /weather/forecast: returns the weather forecast for a specific location
    Parameters: 'location'
    
  GET /weather/history: returns historical weather data for a specific location
    Parameters: 'location'
                'start_date' (format: YYYY-MM-DD)
                'end_date' (format: YYYY-MM-DD)
                
 *NOTE* all parameters are required.
 
 AUTHENTICATION
  To access endpoints, you need to provide basic authentication credentials.
  Credentials set: 
  
    Username: admin
    Password: admin
    
    Username: user
    Password: user
    

Replace 'api_key' with provided API from OpenWeatherMap!    

RUN THIS CODE IN POSTMAN
[![Run in Postman](https://run.pstmn.io/button.svg)](https://god.gw.postman.com/run-collection/25029727-888b1274-0387-4da7-805a-6eeedd3e2f8a?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D25029727-888b1274-0387-4da7-805a-6eeedd3e2f8a%26entityType%3Dcollection%26workspaceId%3D534afe19-ce8f-40a1-81fb-1ff669cd8f33)
    
    
    
    
    
                


      
    
