var map = L.mapbox.map('map', 'wethepeopleapi.map-r9kmecu5');

function loadPetitionData() {
    $.getJSON('http://wetheentities.herokuapp.com/petitions/51942b9b2f2c888e2f00000c.json', function(data) {
        if(data.analysis_complete) {
            $('#loading').remove();
            drawMap(data);
        }
        else {
            setTimeout(loadPetitionData, 2000);
        }
    });
}

function drawMap(data) {
    // console.log(data.open_calais);

    // Extract Countries from the Open Calais result:
    var locations = [];
    for(var key in data.open_calais) {
        var value = data.open_calais[key];
        if(value._typeGroup == 'entities') {
            var entity = value;
            if(entity._type == 'Country') {
                if(entity.resolutions) {
                    locations.push(entity.resolutions[0]);
                }
            }
        }
    }

    for(var i = 0; i < locations.length; i++) {

        var loc = locations[i];

        L.mapbox.markerLayer({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude]
            },
            properties: {
                title: loc.name,
                'marker-color': '#cc0033'
            }
        }).addTo(map);

    };

}


$(document).ready(function() {

    loadPetitionData();


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