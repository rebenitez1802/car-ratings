import  express from 'express';

import { json } from 'body-parser';
import axios from 'axios';

const app = express()
//function to obtain API urls
const vehiclesUrl = (year,manufacturer,model)=>{return `https://one.nhtsa.gov/webapi/api/SafetyRatings/modelyear/${year}/make/${manufacturer}/model/${model}?format=json`}
const ratingUrl = (VehicleId)=>{return `https://one.nhtsa.gov/webapi/api/SafetyRatings/VehicleId/${VehicleId}?format=json`}

app.use( json() );       // to support JSON-encoded bodies

//this method extract de extract the data needed into a object with the final format
function getResulrObject(data){
    var res = {Count:data.Count,Results:[]}
    if(data.Results){
        data.Results.forEach(element => {
            res.Results.push({Description:element.VehicleDescription,VehicleId:element.VehicleId})
        });
    }
    return res;
}
//this method handle the API calls to retrive de data
async function getVehicleData(year, manufacturer, model, addRatings = false){
    try{
        //make request to the API
        var data = await axios.get(vehiclesUrl(year,manufacturer,model))
        //extract data to resultObject
        var resultObject = getResulrObject(data.data);   
        //if rating is required make all de API call needed and add the data to the resultObject
        if (addRatings){
            var promises = resultObject.Results.map(((vehicle)=>{
                return axios.get(ratingUrl(vehicle.VehicleId))
            }))
            await Promise.all(promises).then(results =>{
                results.map(data=>{
                    if(data.data.Count == 1){
                        resultObject.Results.forEach(vehicle=>{
                            if (vehicle.VehicleId == data.data.Results[0].VehicleId){
                                vehicle.CrashRating = data.data.Results[0].OverallRating;
                            }
    
                        })
                    }
                })
            })
        }
        return resultObject
    }catch(err){
        console.log(err)
        return  {Count:0,Results:[]}
    }   
}
/*
* `GET http://localhost:8888/vehicles/2015/Audi/A3`
* `GET http://localhost:8888/vehicles/2015/Toyota/Yaris`
* `GET http://localhost:8888/vehicles/2015/Ford/Crown Victoria`
* `GET http://localhost:8888/vehicles/undefined/Ford/Fusion`

*/  
app.get('/vehicles/:year/:manufacturer/:model',async (req,res)=>{
    var withRating = false
    if(req.query.withRating && req.query.withRating == "true")
        withRating=true
    var data =await getVehicleData(req.params.year,req.params.manufacturer,req.params.model,withRating)
    res.send(data)
})
app.post('/vehicles',async (req,res)=>{
    var withRating = false
    if(req.query.withRating && req.query.withRating == "true")
        withRating=true
    var data =await getVehicleData(req.body.modelYear,req.body.manufacturer,req.body.model,withRating)
    res.send(data)
})

app.get('/', (req, res)=> {
    res.send({message: 'Try http://localhost:8888/vehicles/2015/Audi/A3'})
    
});
  app.listen(8888,  ()=> {
	console.log('The app is listening on port 8888!')
	
})