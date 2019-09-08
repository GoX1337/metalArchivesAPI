# deathMetalAPI

1) To start steal metal archives website data and save it in MongoDB:

        node crawler/app.js "Death Metal"


2) To start API (on port 1337 by default):

        PORT=<YOUR_PORT_NUMBER> APISECRET=<YOUR_API_SECRET> node api.js


3) To get a token: 

        /api/token


4) To get data: 

        /api/bands?token=<your_token>&genre=<metal_genre>&name=<band_name>&country=<country_name>