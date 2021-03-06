//works from mod4

/* Map of GeoJSON data fromCNTour.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
 L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
	minZoom: 1,
	maxZoom: 16,

}).addTo(map);

    //call getData function
    getData(map);
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};


//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    //Example 2.3 line 22...load the data
    $.ajax("data/CNTour.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ffff00",
                color: "#ff8800",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.6
            };

            //create a Leaflet GeoJSON layer and add it to the map
            //couldn't get the clustering functon to work ... marked as optional, but 
            //i doubt I will need it for my lab1, since it would be confusing the user to do it this way
            
            L.geoJson(response, {
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                //provides a boolean that applies to all features of the data
                //boolean determines weather or not the features will be added to the map
                //filter: function(feature, layer) {
                //    return feature.properties.Pop_2015 > 20;
                //}
                
            }).addTo(map);
        }
    });
};



$(document).ready(createMap);