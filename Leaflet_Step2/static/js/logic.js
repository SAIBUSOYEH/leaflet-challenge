//The API endpoint is store in queryUrl2
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryUrl2 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"


// An API callo the queryUrl to get all the informations therein
d3.json(queryUrl2, function(data) {
  createFeatures(data.features);
});

// Once we get a response, send the data.features object to the createFeatures function
//data is being stored as earthquakeData

function createFeatures(earthquakeData) {

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place, time and magnitude of the earthquake
  
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  
  }


  function markerSize(mag) {
    return mag * 4;
  }
  
  function markerColor(mag) {
    if (mag <= 1) {
        return "rgb(255,191,0)";
    } else if (mag <= 2) {
        return "rgb(255,255,0)";
    } else if (mag <= 3) {
        return "rgb(191,255,0)";
    } else if (mag <= 4) {
        return "rgb(0,255,191)";
    } else if (mag <= 5) {
        return "rgb(0,191,255)";
    } else {
        return "rgb(255,0,128)";
    };
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var color;
      var r = 255;
      var g = Math.floor(255-80*feature.properties.mag);
      var b = Math.floor(255-80*feature.properties.mag);
      color= "rgb("+r+" ,"+g+","+ b+")"
      
      
      var geojsonMarkerOptions = {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        color: "color",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
  
}


function createMap(earthquakes) {

  // Creating the tile layer that will be the background of our map
  
   var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });
 
  // Creating the satellite tile layer
  var satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 18,
    subdomains:['mt0','mt1','mt2','mt3']
});
   // Define a baseMaps object to hold our base layers
   var baseMaps = {
     "Satellite": satellite,
     "Greyscale": light,
     "Outdoors": outdoors
   };
  
   
  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

   // Creating map object
    var myMap = L.map("map", {
     center: [37.09, -95.71],
     zoom: 5,
     layers: [satellite, earthquakes]
   });

// Creating a layer control,pass in baseMaps and overlayMaps
L.control.layers(baseMaps, overlayMaps).addTo(myMap);


function getColor(d) {
  return d < 1 ? 'rgb(255,191,0)' :
        d < 2  ? 'rgb(255,255,0)' :
        d < 3  ? 'rgb(191,255,0)' :
        d < 4  ? 'rgb(0,255,191)' :
        d < 5  ? 'rgb(0,191,255)' :
                    'rgb(255,0,128)';
}

// Create a legend to display information about our map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
  grades = [0, 1, 2, 3, 4, 5],
  labels = [];

  div.innerHTML+='Magnitude<br><hr>'

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 0.01) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(myMap);

}
