var map = L.mapbox.map('map', 'wethepeopleapi.map-r9kmecu5');

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function loadPetitionData(petition_id) {
    var url = 'http://wetheentities.herokuapp.com/petitions/' + petition_id + '.js';

    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(data) {
            if(data.analysis_complete) {
                drawMap(data);
            }
            else {
                setTimeout(loadPetitionData, 2000);
            }
        },
        error: function(e) {
            console.log(e.message);
        }
    });

}

function drawMap(data) {
    // Extract Countries from the Open Calais result:
    var locations = [];
    for(var key in data.open_calais) {
        var value = data.open_calais[key];
        if(value._typeGroup == 'entities') {
            var entity = value;
            if(entity._type == 'Country' || entity._type == 'City') {
                if(entity.resolutions) {
                    locations.push(entity.resolutions[0]);
                }
            }
        }
    }

    var geoJson = [];
    for(var i = 0; i < locations.length; i++) {

        var loc = locations[i];

        geoJson.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude]
            },
            properties: {
                title: loc.name,
                'marker-color': '#cc0033'
            }
        });
    };

    map.markerLayer.setGeoJSON(geoJson);

    map.fitBounds(map.markerLayer.getBounds());

}


$(document).ready(function() {
    var petition_id = getURLParameter('id');

    if(petition_id !== null) {
        loadPetitionData(petition_id);
    } else {
        // No id error
    }

});


// L.mapbox.markerLayer({
//     // this feature is in the GeoJSON format: see geojson.org
//     // for the full specification
//     type: 'Feature',
//     geometry: {
//         type: 'Point',
//         // coordinates here are in longitude, latitude order because
//         // x, y is the standard for GeoJSON and many formats
//         coordinates: [-77, 37.9]
//     },
//     properties: {
//         title: 'A Single Marker',
//         description: 'Just one of me',
//         // one can customize markers by adding simplestyle properties
//         // http://mapbox.com/developers/simplestyle/
//         'marker-size': 'large',
//         'marker-color': '#f0a'
//     }
// }).addTo(map);