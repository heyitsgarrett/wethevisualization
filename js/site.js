var globalLocations = [];

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function loadIssueData(issue_id, markerStyle) {
    if(issue_id === null) {
        issue_id = 'Foreign%20Policy';
    }
    var url = 'http://wetheentities.herokuapp.com/petitions.js?issues[]=' + encodeURIComponent(issue_id);

    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        jsonpCallback: 'callback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(data) {
            if(data.analysis_complete) {
                for(var x =0; x< data.petitions.length; x++) {
                    // console.log(data.petitions[x]);
                    loadPetitionData(data.petitions[x].attributes.id, markerStyle);
                }

            }
            else {
                setTimeout(loadIssueData(issue_id), 2000);
            }
        },
        error: function(e) {
            // console.log(e.message);
        }
    });
}

function loadPetitionData(petition_id, markerStyle) {
    var url = 'http://wetheentities.herokuapp.com/petitions/' + petition_id + '.js';

    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        jsonpCallback: 'callback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(data) {
            if(data.analysis_complete) {
                drawMap(data, markerStyle);
            }
            else {
                setTimeout(loadPetitionData, 2000);
            }
        },
        error: function(e) {
            // console.log(e.message);
        }
    });

}

function drawMap(data, markerStyle) {

    var circleOptions = {
        radius: 20,
        fillColor: "#fff800",
        weight: 0,
        fillOpacity: 0.2
    };


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

        var feature = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [loc.longitude, loc.latitude]
                },
                properties: {
                    title: loc.name,
                    'marker-color': '#cc0033'
                }
            };

        if(markerStyle === 'cluster') {

            // Group markers
            L.geoJson(feature, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, circleOptions);
                }
            }).addTo(map);

            L.geoJson(feature, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 3,
                        fillColor: "#fff800",
                        weight: 0,
                        fillOpacity: 1.0
                    });
                }
            }).addTo(map);


        } else {
            geoJson.push(feature);

            map.markerLayer.setGeoJSON(geoJson);

            map.fitBounds(map.markerLayer.getBounds());
        }
    };


}
