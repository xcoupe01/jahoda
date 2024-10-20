import './App.css';
import './styles.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from 'react-leaflet';
import { Icon } from "leaflet";
import React, { useState, useEffect } from "react";
import * as L from "leaflet";
import Cookies from 'universal-cookie';
import Modal from 'react-bootstrap/Modal';

import "leaflet-easybutton/src/easy-button.css";
import "font-awesome/css/font-awesome.min.css";
import "leaflet-easybutton/src/easy-button.js";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const DISTANCE_TRESHOLD = 25;
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

function collect_acc_active(acc){
  return acc <= DISTANCE_TRESHOLD
}

export function StrawberryMarker(strawberry, user_pos, user_acc){
  const start_found_list = cookie_prov.get('found')
  const [found, setFound] = useState(start_found_list == null ? false : start_found_list.includes(strawberry.id));
  
  const dist = user_pos == null ? null : Math.round(user_pos.distanceTo(strawberry.pos));

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  if(dist != null && dist <= DISTANCE_TRESHOLD && !found && collect_acc_active(user_acc)){
    setFound(true);
    var cookie_found = cookie_prov.get('found');
    if(cookie_found == null){
      cookie_found = [strawberry.id];
    } else {
      if(!cookie_found.includes(strawberry.id)){
        cookie_found.push(strawberry.id);
      }
    }
    cookie_prov.set('found', cookie_found, {path: '/', expires: new Date(Date.now()+2592000)});
  }

  return (
    <div>
      <Marker position={strawberry.pos} icon={found ? f_stawberry_ico : nf_stawberry_ico} eventHandlers={{
        click: (e) => {
          handleShow()
        },
      }}/>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {strawberry.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          modal_data.text
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default function App() {

  const [map, setMap] = useState(null);
  const [positionSt, setPosition] = useState(null);
  const [pos_acc, setAcc] = useState(null);

  var position = null;
  var track = false;
  var follow = false;

  function pos_updater(){
    map.locate().on("locationfound", function (e) {
      position = e.latlng;
      setPosition(e.latlng);
      setAcc(e.accuracy);
      if(follow){
        map.flyTo(e.latlng);
      };
    });
    if(track){
      console.log('tracking');
      setTimeout(pos_updater, 3_000);
    } else {
      console.log('tracking ended');
    }
  }

  useEffect(() => {
    if (!map) return;
    map.on('dragstart', () => {
      follow = false;
    });
    L.easyButton("fa-crosshairs fa-lg", (btn) => {
      if(track){
        if(follow){
          btn.button.style.backgroundColor = 'white';
          track = false;
          follow = false;
        } else {
          follow = true;
          map.flyTo(position);
        }
      } else {
        btn.button.style.backgroundColor = 'rgb(162, 191, 254)';
        track = true;
        follow = true;
        pos_updater(true);
      }
    }).addTo(map);
  }, [map]);

  return (
    <div>
    <MapContainer center={def_position} zoom={15} ref={setMap}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <TileLayer
        url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      />
      {strawberries.map(strawberry => 
        StrawberryMarker(strawberry, positionSt, pos_acc)
      )}
      {positionSt == null ? null : 
      <div>
        <CircleMarker center={positionSt} fillOpacity={0.8} fillColor={collect_acc_active(pos_acc) ? "green" : "blue"} color={collect_acc_active(pos_acc) ? "green" : "blue"}/>
        <Circle center={positionSt} radius={pos_acc} fillColor={collect_acc_active(pos_acc) ? "green" : "blue"} color={collect_acc_active(pos_acc) ? "green" : "blue"}/>
      </div>}
    </MapContainer>

    </div>

    );
}



