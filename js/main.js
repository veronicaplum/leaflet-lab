//works
//Object initialization issues
/* CNTour.geojson/ MOD5 COMPLETE / MISSING 5th operator */


//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
 L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 5,
    minZoom: 2

    }).addTo(map);

    //call getData function
    getData(map);
};


//Step 2: Import GeoJSON data
function getData(map){
    //load the dat
    $.ajax("data/CNTour.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            var attributes = processData(response);
            console.log("att");
            createPropSymbols(response, map, attributes);
            console.log("symobols");
            createSequenceControls(map, attributes);
            console.log("control");
        }
    });  
    //create a Leaflet GeoJSON layer and add it to the map
};

function processData(data){
    //array for attributes, empty
    var attributes = [];
    
    //properties of first feature in data set
    var properties = data.features[0].properties;
    
    //is this a stackADT implemented with an array? Not entirely...
    //push each attribute name nto attributes array
    for (var attribute in properties){
                                            //remove "country" for array here
        if(attribute.indexOf("yr_")>-1){    //done through changing -2 to -1
            attributes.push(attribute);
        };
    };
    return attributes;
};

//SequenceControl
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    $('#panel').append('<button class="skip" id="reverse"><p>Previous</p></button>');
    $('#panel').append('<button class="skip" id="forward"><p>Next</p></button>');
    //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
    
     //click listener for buttons
    $('.skip').click(function(){
        //sequence
         //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
             $('.range-slider').val(index);
             
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
             $('.range-slider').val(index);
        };
        updatePropSymbols(map, attributes[index]);
        //Step 8: update slider
       // $('.range-slider').val(index);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //sequence
         //Step 6: get the new index value
        var index = $(this).val();
        console.log(index);
        
        updatePropSymbols(map, attributes[index]);
    
    });
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.009;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
     L.geoJson(data, { 
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//function that creates popUp info dialogues
function createPopup(properties, attribute, layer, radius){

      //create original pop-up content
    var popupContent = "<p><b>Country:</b> " + properties.Country + "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Tourists in China in " + year + ":</b> " + properties[attribute] + " </p>";
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
                
            });
};
//Popup constructor


//update prop Symbols via information provided by the index listeners
function updatePropSymbols(map, attribute){
 
    map.eachLayer(function(layer){
   
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var properties = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(properties[attribute]);
            layer.setRadius(radius);
            
             //create popup info dialogues
            createPopup(properties, attribute, layer, radius);
           // var popup = new Popup(properties, attribute, layer, radius);
            
           // popup.bindToLayer();
        };
    }); 
 
};
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    console.log(attribute);
    //create marker options
    var options = {
        fillColor: "#ffff99",
        color: "#ff8800",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer //for proprotional
    var layer = L.circleMarker(latlng, options); 
 
    //create popup info dialogues
   createPopup(feature.properties, attribute, layer, options.radius);
    //var popup= new Popup(feature.properties, attribute, layer, options.radius);
    
  //  popup.bindToLayer();

    //event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
        }
    });
 
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

$(document).ready(createMap);