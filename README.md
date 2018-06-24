# car-ratings

## Env Used
node version = `v10.5.0`
javascript Standard `ES6`

## How to Use 
just run `npm install` and `npm start`
now you can visit any of the following url
* GET http://localhost:8888/vehicles/{year}/{manufacturer}/{model}[?withRating=true]
 
* POST http://localhost:8888/vehicles[?withRating=true]
with json data as
```
{
    "manufacturer": "<manufacturer>",
    "model": "<model>",
    "modelYear":<year>
}
```