import './App.css';
import './styles.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import React, { useState, useEffect } from "react";
import * as L from "leaflet";
import Cookies from 'universal-cookie';

import "leaflet-easybutton/src/easy-button.css";
import "font-awesome/css/font-awesome.min.css";
import "leaflet-easybutton/src/easy-button.js";

const DISTANCE_TRESHOLD = 250;
const def_position = [49.1779167, 16.6845664];
const def_icon_size = [38, 38];

const cookie_prov = new Cookies();

var strawberries = [
  {
    id: 1,
    pos: [49.1814161, 16.6845208],
    name: 'Workout hřiště',
  },
  {
    id: 2,
    pos: [49.1772589, 16.6910789],
    name: 'Jahodovi doma',
  },
  {
    id: 3,
    pos: [49.1905322, 16.6757419],
    name: 'Stránská triangl',
  }
];

const f_stawberry_ico = new Icon({
  iconUrl: "img/strawberry.png",
  iconSize: def_icon_size
});

const nf_stawberry_ico = new Icon({
  iconUrl: "img/strawberry-g.png",
  iconSize: def_icon_size
});

const position_ico = new Icon({
  iconUrl: "img/position.png",
  iconSize: def_icon_size
});

export function StrawberryMarker(strawberry, user_pos){
  const start_found_list = cookie_prov.get('found')
  const [found, setFound] = useState(start_found_list == null ? false : start_found_list.includes(strawberry.id));
  const dist = user_pos == null ? null : Math.round(user_pos.distanceTo(strawberry.pos));
  
  if(dist == null){
    return (
      <Marker position={strawberry.pos} icon={found ? f_stawberry_ico : nf_stawberry_ico}/>
    );
  }

  if(dist <= DISTANCE_TRESHOLD && !found){
    setFound(true);
    var cookie_found = cookie_prov.get('found');
    if(cookie_found == null){
      cookie_found = [strawberry.id];
    } else {
      if(!cookie_found.includes(strawberry.id)){
        cookie_found.push(strawberry.id);
      }
    }
    cookie_prov.set('found', cookie_found);
    return(
      <Marker position={strawberry.pos} icon={f_stawberry_ico}/>
    )
  }

  return (
    <Marker position={strawberry.pos} icon={found? f_stawberry_ico : nf_stawberry_ico}/>
  )
}

export default function App() {

  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  var track = false

  function pos_updater(){
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
    });
    if(track){
      console.log('tracking');
      setTimeout(pos_updater, 10_000);
    } else {
      console.log('tracking ended');
    }
  }

  useEffect(() => {
    if (!map) return;
    L.easyButton("fa-crosshairs fa-lg", () => {
      if(track){
        track = false
      } else {
        track = true;
        pos_updater(true);
      }
    }).addTo(map);
  }, [map]);

  return (
    <MapContainer center={def_position} zoom={15} ref={setMap}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <TileLayer
        url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      />
      {strawberries.map(strawberry => 
        StrawberryMarker(strawberry, position)
      )}
      {position == null ? null : <Marker position={position} icon={position_ico}/>}
      
    </MapContainer>
  );
}



