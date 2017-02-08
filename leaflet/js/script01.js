(function () {
var m = L.map('mapID').setView([38.32, 137.62],5);
var baseMaps = [
    "Stamen.Watercolor",
	"OpenStreetMap.Mapnik",
	"OpenStreetMap.DE",
	"Esri.WorldImagery",
	// "MapQuestOpen.OSM"
];
var lc = L.control.layers.provided(baseMaps,{},{collapsed:false}).addTo(m);
m.addHash({lc:lc});
var data={}, layers={}, fills =[
     "rgb(197,27,125)", //purplered
	 "rgb(222,119,174)", //pink
	 "rgb(213, 62, 79)", //red
	 "rgb(84, 39, 136)", //purple
	 "rgb(247,64,247)", //lightpink
	 "rgb(244, 109, 67)",  //orange
	 "rgb(184,225,134)",  //green
	 "rgb(127,188,65)",  //darkgreen
	 "rgb(69, 117, 180)"  //blue
];
d3.json("json/oa1.json", dealwithData);
function dealwithData(oa){
	data.json= oa.features.map(function(v){
        return [v.geometry.coordinates[1],v.geometry.coordinates[0]];
	});
    points();
    // veronoi();
    // delaunay();
    clusters();
    // quadtree();
}
function points(){
    layers.points = L.layerGroup(data.json.map(function(v){
    	return L.circleMarker(L.latLng(v),{radius:5,stroke:false,fillOpacity:1,clickable:false,color:fills[Math.floor((Math.random()*9))]})
	}));
	lc.addOverlay(layers.points,"points");
}
// function veronoi(){
//     data.veronoi = d3.geom.voronoi(data.json);
//     layers.veronoi = L.layerGroup(data.veronoi.map(function(v){
// 		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
// 	}));
// 	lc.addOverlay(layers.veronoi,"veronoi");
// }
// function delaunay(){
//     data.delaunay = d3.geom.delaunay(data.json);
//     layers.delaunay = L.layerGroup(data.delaunay.map(function(v){
// 		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
// 	}));
// 	lc.addOverlay(layers.delaunay,"delaunay");
// }
function clusters(){
    layers.clusters= new L.MarkerClusterGroup();
	layers.clusters.addLayers(data.json.map(function(v){
		return L.marker(L.latLng(v));
	}));
	lc.addOverlay(layers.clusters,"clusters");
}
// function quadtree(){
//     data.quadtree = d3.geom.quadtree(data.json.map(function(v){return {x:v[0],y:v[1]};}));
// 	layers.quadtree = L.layerGroup();
// 	data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2){
// 		layers.quadtree.addLayer(L.rectangle([[lat1,lng1],[lat2,lng2]],{fillOpacity:0,weight:1,color:"#000",clickable:false}));
// 	});
// 	lc.addOverlay(layers.quadtree,"quadtree");
// }


layers.svg=L.d3("json/japan.json",{
	topojson:"singleSeatBlock",
	svgClass : "Spectral",
	pathClass:function(d) {
		return "count" + (10-layers.svg.quintile(d.properties.pop/layers.svg.path.area(d)))+"-11";
	},
	before: function(data){
		var _this = this;
		this.quintile=d3.scale.quantile().domain(data.geometries.map(function(d){return d.properties.pop/_this.path.area(d);})).range(d3.range(11));
	}
});
layers.svg.bindPopup(function(p){
	var out =[];
	for(var key in p){
	if(key !== "FOURCOLOR"){
		out.push("<strong>"+key+"</strong>: "+p[key]);
		}
	}
	return out.join("<br/>");
	});
lc.addOverlay(layers.svg,"Hot density");


window.public = {};
window.public.data = data;
window.public.layers = layers;
}());