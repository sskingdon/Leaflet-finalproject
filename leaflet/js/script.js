(function() {
    var m = L.map('mapID').setView([38.32, 137.62], 5);

    var baseMaps = [
        "Stamen.Watercolor",
        "OpenStreetMap.Mapnik",
        "OpenStreetMap.DE",
        "Esri.WorldImagery"
        // "MapQuestOpen.OSM"
    ];
    var lc = L.control.layers.provided(baseMaps, {}, {
        collapsed: false
    }).addTo(m);
    m.addHash({
        lc: lc
    });
    var data = {},
        layers = {},
        fills = [
            "rgb(197,27,125)",
            "rgb(222,119,174)",
            "rgb(213, 62, 79)",
            "rgb(84, 39, 136)",
            "rgb(247,64,247)",
            "rgb(244, 109, 67)",
            "rgb(184,225,134)",
            "rgb(127,188,65)",
            "rgb(69, 117, 180)"
        ];
    d3.json("json/jp.json", dealwithData);

    function dealwithData(oa) {
        data.json = oa.features.map(function(v) {
            return [v.geometry.coordinates[1], v.geometry.coordinates[0], v.properties.Name];
        });
        points();
        clusters();
        allpath();
        recommend();
    }

    function points() {
        layers.points = L.layerGroup(data.json.map(function(v) {
            return L.circleMarker(L.latLng(v), {
                radius: 5,
                stroke: false,
                fillOpacity: 1,
                clickable: true,
                color: fills[Math.floor((Math.random() * 9))]
            }).bindPopup("<strong>" + v[2] + "</strong><br>" + v[0] + "," + v[1]);
        }));
        lc.addOverlay(layers.points, "points");
    }

    function allpath() {
        d3.json("json/allroute.json", pao);

        function pao(alro) {
            ss = alro.features.map(function(t) {
                return [
                    [t.fromx, t.fromy],
                    [t.tox, t.toy]
                ];
            });
            // console.log(ss);
            layers.allpath = L.multiPolyline(ss, {
                'color': 'black',
                'weight': '0.1'
            }).addTo(m);
            lc.addOverlay(layers.allpath, "allpath");
        }

    }

    function recommend() {
        d3.json("json/superbigtable.json", hi);
        //dictionary 
        var tmp = [];
        var currentpoint;
        var dic = {};
        var alltime = 10800;

        function hi(ih) {
            superbig = ih.features.map(function(z) {
                return [
                    [z.Startx, z.Starty],
                    [
                        [
                            [z.firstx, z.firsty], z.firstdis, z.firstcartime, z.firstcount
                        ],
                        [
                            [z.secondx, z.secondy], z.seconddis, z.secondcartime, z.secondcount
                        ],
                        [
                            [z.thirdx, z.thirdy], z.thirddis, z.thirdcartime, z.thirdcount
                        ],
                        [
                            [z.fourthx, z.fourthy], z.fourthdis, z.fourthcartime, z.fourthcount
                        ],
                        [
                            [z.fifthx, z.fifthy], z.fifthdis, z.fifthcartime, z.fifthcount
                        ]
                    ]
                ]
            });

            for (var i = 0; i < superbig.length; i++) {
                // console.log(superbig[i][0]);
                dic[superbig[i][0]] = superbig[i][1];
            }
            // console.log(dic["35.127547,139.037432"]);
            // console.log(dic);
        }
        //////////////////////////////////////////////////
        layers.recommend = L.layerGroup(data.json.map(function(v) {
            return L.circleMarker(L.latLng(v), {
                radius: 5,
                stroke: false,
                fillOpacity: 1,
                clickable: true,
                color: 'red'
            }).bindPopup("<strong>" + v[2] + "</strong>").on('click', onClick);

        }));

        function onClick() {
            var secondlayer = [];
            var totaltime = 10800;
            if (layers.route != null) {
                layers.recommend.removeLayer(layers.route);
            }
            var currentlat = this.getLatLng().lat;
            var currentlng = this.getLatLng().lng;
            currentpoint = [currentlat, currentlng];
            console.log(currentpoint);
            // console.log(dic[currentpoint]);
            // console.log(dic[currentpoint]);
            secondlayer.push(currentpoint);
            var temppath = dic[currentpoint];
            // console.log(typeof(temppath));

            var tmpnum = 5;
            var flagg = 0;
            var drawlist = [];
            var weightlist = [];
            for (var gg = 0; gg < 5; gg++) {
                if (temppath[gg][0][0] != 0.000000) {
                    var now = [currentpoint, temppath[gg][0]];
                    // console.log(temppath[gg][0]);
                    var won1 = temppath[gg][2];
                    var won2 = temppath[gg][3];
                    if (won2 < 2) {
                        won2 = 5;
                    } else {
                        won2 = won2 - 1;
                        won2 = won2 / 615;
                        won2 = won2 * 15;
                        won2 = won2 + 2;
                    }
                    var won = [won1, won2];
                    drawlist.push(now);
                    weightlist.push(won);
                } else {
                    if (flagg == 0) {
                        tmpnum = gg;
                        // console.log(tmpnum);
                        flagg = 1;
                    }
                }
            }
            // console.log(drawlist[0]);
            for (var x = 0; x < tmpnum; x++) {
                var weighttt = String(weightlist[x][1]);
                // console.log(weighttt);
                var thistime = parseInt(String(weightlist[x][0]));
                var nowtime = totaltime - thistime;
                // console.log([drawlist[x]]);
                if (nowtime > 0) {
                    layers.route = L.multiPolyline([drawlist[x]], {
                        'color': 'red',
                        'weight': weighttt
                    }).addTo(m);
                    // console.log(drawlist[x][1]);
                }
                var current2point = [drawlist[x][1].lat, drawlist[x][1].lng];
                var temp2path = dic[current2point];
                console.log(current2point);
                // console.log(drawlist[x][1]);
                // console.log(temp2path);
                var draw2list = [];
                var weight2list = [];
                var flaggg = 0;
                var tmp2num = 5;
                for (var gg = 0; gg < 5; gg++) {
                    if (temp2path[gg][0][0] != 0.000000) {
                        var now = [current2point, temp2path[gg][0]];
                        // console.log(temppath[gg][0]);
                        var won1 = temp2path[gg][2];
                        var won2 = temp2path[gg][3];
                        if (won2 < 2) {
                            won2 = 5;
                        } else {
                            won2 = won2 - 1;
                            won2 = won2 / 615;
                            won2 = won2 * 15;
                            won2 = won2 + 2;
                        }
                        var won = [won1, won2];
                        draw2list.push(now);
                        weight2list.push(won);
                    } else {
                        if (flaggg == 0) {
                            tmp2num = gg;
                            // console.log(tmp2num);
                            flaggg = 1;
                        }
                    }
                }
                for (var y = 0; y < tmp2num; y++) {
                    var weighttt2 = String(weight2list[y][1]);
                    // console.log(weighttt2);
                    var thistime = parseInt(String(weight2list[y][0]));
                    var now2time = nowtime - thistime;
                    // console.log([drawlist[x]]);
                    if (now2time > 0) {
                        layers.route = L.multiPolyline([draw2list[y]], {
                            'color': 'blue',
                            'weight': weighttt2
                        }).addTo(m);
                        console.log(draw2list[y][0]);
                    }
                    var current3point = [draw2list[y][1].lat, draw2list[y][1].lng];
                    var temp3path = dic[current3point];
                    console.log(current3point);
                    // console.log(drawlist[x][1]);
                    // console.log(temp2path);
                    var draw3list = [];
                    var weight3list = [];
                    var flagggg = 0;
                    var tmp3num = 3;
                    for (var gg = 0; gg < 3; gg++) {
                        if (temp3path[gg][0][0] != 0.000000) {
                            var now = [current3point, temp3path[gg][0]];
                            // console.log(temppath[gg][0]);
                            var won1 = temp3path[gg][2];
                            var won2 = temp3path[gg][3];
                            if (won2 < 2) {
                                won2 = 5;
                            } else {
                                won2 = won2 - 1;
                                won2 = won2 / 615;
                                won2 = won2 * 15;
                                won2 = won2 + 2;
                            }
                            var won = [won1, won2];
                            draw3list.push(now);
                            weight3list.push(won);
                        } else {
                            if (flagggg == 0) {
                                tmp3num = gg;
                                // console.log(tmp3num);
                                flagggg = 1;
                            }
                        }
                    }
                    for (var z = 0; z < tmp3num; z++) {
                        var weighttt3 = String(weight3list[z][1]);
                        // console.log(weighttt3);
                        var thistime = parseInt(String(weight3list[z][0]));
                        var now3time = now2time - thistime;
                        console.log([draw3list[z][0]]);
                        if (now3time > 0) {
                            layers.route = L.multiPolyline([draw3list[z]], {
                                'color': 'green',
                                'weight': weighttt3
                            }).addTo(m);
                            // console.log(drawlist[x][1]);
                        }
                    }
                }
                layers.recommend.addLayer(layers.route);
            }
            // layers.recommend.addLayer(layers.route);
            // console.log(drawlist);
        };


        lc.addOverlay(layers.recommend, "recommend");
    }

    function clusters() {
        layers.clusters = new L.MarkerClusterGroup();
        layers.clusters.addLayers(data.json.map(function(v) {
            return L.marker(L.latLng(v)).bindPopup("<strong>" + v[2] + "</strong><br>" + v[0] + "," + v[1]).openPopup();
        }));
        lc.addOverlay(layers.clusters, "clusters");
    }
    // function quadtree(){
    //     data.quadtree = d3.geom.quadtree(data.json.map(function(v){return {x:v[0],y:v[1]};}));
    //  layers.quadtree = L.layerGroup();
    //  data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2){
    //      layers.quadtree.addLayer(L.rectangle([[lat1,lng1],[lat2,lng2]],{fillOpacity:0,weight:1,color:"#000",clickable:false}));
    //  });
    //  lc.addOverlay(layers.quadtree,"quadtree");
    // }


    layers.svg = L.d3("json/japan.json", {
        topojson: "singleSeatBlock",
        svgClass: "Spectral",
        pathClass: function(d) {
            return "town q" + (10 - layers.svg.quintile(d.properties.pop / layers.svg.path.area(d))) + "-11";
        },
        before: function(data) {
            var _this = this;
            this.quintile = d3.scale.quantile().domain(data.geometries.map(function(d) {
                return d.properties.pop / _this.path.area(d);
            })).range(d3.range(11));
        }
    });
    layers.svg.bindPopup(function(p) {
        var out = [];
        for (var key in p) {
            if (key !== "FOURCOLOR") {
                out.push("<strong>" + key + "</strong>: " + p[key]);
            }
        }
        return out.join("<br/>");
    });
    lc.addOverlay(layers.svg, "Hot density");


    window.public = {};
    window.public.data = data;
    window.public.layers = layers;
}());