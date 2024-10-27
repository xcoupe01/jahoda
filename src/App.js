import './App.css';
import './styles.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { Icon } from "leaflet";
import React, { useState, useEffect } from "react";
import * as L from "leaflet";
import Modal from 'react-bootstrap/Modal';

import "leaflet-easybutton/src/easy-button.css";
import "font-awesome/css/font-awesome.min.css";
import "leaflet-easybutton/src/easy-button.js";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const DISTANCE_TRESHOLD = 25;
const def_position = [49.1779167, 16.6845664];
const def_icon_size = [38, 38];

var found_strawberries = JSON.parse(localStorage.getItem('found_berries') || "[]");
localStorage.setItem('found_berries', JSON.stringify(found_strawberries));

var strawberries = [
  {
    id: 1,
    pos: [49.1814161, 16.6845208],
    name: 'Workout hřiště',
    content: <div>
      Na obřadu jsme se dozvěděli,<br/>
      že už zde se k sobě měli.<br/>
      těla své zde posílili,<br/>
      oči ze sebe nespustili.<br/>
    </div>
  },
  {
    id: 2,
    pos: [49.1772589, 16.6910789],
    name: 'Jahodovi doma',
    content: <div>
      Z videa o maželích,<br/>
      zjistili jsme mnohé,<br/>
      že Martince to sluší na koních,<br/>
      Mirkovi v sukni dlouhé.<br/>
      <br/>
      <img className="img-fluid" src='img/fotky.jpg'/>
    </div>
  },
  {
    id: 3,
    pos: [49.1905322, 16.6757419],
    name: 'Stránská triangl',
    content: <div>
      Věichni hosté novomanželů,<br/>
      hezké vzkazy do albíčka psali,<br/>
      jen ti Mirkovi kamarádi,<br/>
      joo ti tomu albíčku dali.<br/>
      (náramně se při tom pobavili)<br/>
      <br/>
      <img className="img-fluid" src='img/albicko.jpg'/>
    </div>
  },
  {
    id: 4,
    pos: [49.17968522241855, 16.67024533036232],
    name: 'Hřiště Kigginsova',
    content: <div>
      Po obřadu nás všechny,<br/>
      dobré jídlo čekalo,<br/>
      mnoho z hostů přítomných<br/>
      chobotnici ochutnalo.<br/>
      <br/>
      <img className="img-fluid" src='img/chobot.jpg'/>
    </div>
  },
  {
    id: 5,
    pos: [49.1800964, 16.6831506],
    name: 'Hřiště na sídlišti',
    content: <div>
      Soutěž velká vypukla,<br/>
      kdo s novomanžely do Zoo půjde,<br/>
      hrdinná Šárka Mirka našla,<br/>
      byl na půdě.<br/>
    </div>
  },
  {
    id: 6,
    pos: [49.1800728, 16.6795347],
    name: 'Hřiště Langrova',
    content: <div>
      Den před svatbou<br/>
      zataženo bylo a foukalo ještě,<br/>
      den po ní,<br/>
      z nebe padaly kapky deště.<br/>
      <br/>
      Ve svatby den však,<br/>
      slunko se na nás koukalo,<br/>
      možná, aby sušit slzy štěstí pomohlo,<br/>
      když si říkali "ano" pak.<br/>
      <br/>
      <img className="img-fluid" src='img/ano.jpg'/>
    </div>
  },
  {
    id: 7,
    pos: [49.1781264, 16.6891239],
    name: 'Hřiště hliník',
    content: <div>
      Po cestě domů,<br/>
      předmanželé mne překvapili,<br/>
      jahůdky a oznámení,<br/>
      ke dveřím nám doručili.<br/>
      <br/>
    </div>
  },
  {
    id: 8,
    pos: [49.1812244, 16.6803450],
    name: 'Hřiště Vlnitá',
    content: <div>
      Na tanečním parketu,<br/>
      bylo živo velice,<br/>
      nejvíc však prošoupal,<br/>
      Mirkův táta střevíce.<br/>
      <br/>
      <img className="img-fluid" src='img/disco.jpg'/>
    </div>
  },
  {
    id: 9,
    pos: [49.1748614, 16.6917925],
    name: 'Ovečky',
    content: <div>
      Na statku bylo mnoho zvířat,<br/>
      prasátka, husy, králíci,<br/>
      nestačili jsme zírat,<br/>
      co vše najdeš na vesnici.<br/>
      <br/>
      <img className="img-fluid" src='img/husy.jpg'/>
    </div>
  },
  {
    id: 10,
    pos: [49.1916703, 16.6737842],
    name: 'Zastávka Stránská skála',
    content: <div>
      Pozdě večer jsme přijeli, <br/>
      vichr překvapil nás,<br/>
      česal nám každý vlas,<br/>
      když týpko ve tmě jsme stavěli.<br/>
      <br/>
      <img className="img-fluid" src='img/teepee.jpg'/>
    </div>
  },
  {
    id: 11,
    pos: [49.1766194, 16.6829414],
    name: 'Hřiště Černozemní',
    content: <div>
      Svatební píseň Mirek & Martinka<br/>
      <br/>
      1) Vlnité vlasy má, naše Martinka krásná,<br/>
      my jí teď chceme jen to nejhezčí přát,<br/>
      Vdává se na statku, to zpráva je jasná,<br/>
      pojďme teď zpívat a hrát.<br/>
      <br/>
      2) Mirek je kluk vnímavý a vyrost z něj kus chlapa,<br/>
      na kdekoho z výšky kouká jak z patra.<br/>
      Vybral si Martinku, oba spolu teď tu stojí,<br/>
      svůj život navždy spojí.<br/>
      <br/>
      3) Zelený, voňavý, dva pstýnky z trávy,<br/>
      copak si holka víc může přát,<br/>
      doznívá menuet, čím dál víc nís baví,<br/>
      dnes lásku oslavovat.<br/>
      <br/>
      R) Svatba jejich ta se dnes slaví, hodujeme chcem připít,<br/>
      na jejich zdraví, lásku a klid,<br/>
      Viktorka si všechno hlídá, mámu, tátu a kus jídla,<br/>
      pojďme se s nimi radovat a snít.<br/>
      <br/>
      4) Martinka a Mirek jsou teď jedna rodina,<br/>
      spolu v domečku si budou dál žít,<br/>
      Viktorka, Neroušek, Aura, Chilli, Corona,<br/>
      v životě štěstí jen mít.<br/>
      <br/>
      Hodně lásky a zdraví ... Hodně lásky a štestí ... Hodně lásky a dětí<br/>
      <br/>
      <img className="img-fluid" src='img/plac.jpg'/>
    </div>
  },
  {
    id: 12,
    pos: [49.1761039, 16.6894511],
    name: 'Hřiště Kikrleho',
    content: <div>
      Místo svatebních holubic<br/>
      jiného jsme měli letce,<br/>
      Viki se líbil o dost víc,<br/>
      dron nám létal nad hlavami hladce.<br/>
      <br/>
      <img className="img-fluid" src='img/kdeje.jpg'/>
    </div>
  },
  {
    id: 13,
    pos: [49.1776994, 16.6845586],
    name: 'Slatina náměstí',  
    content: <div>
      Největší švihák toho dne,<br/>
      mirek měl být,<br/>
      jeho role ale pande,<br/>
      jakmile se zjeví Kubík.<br/>
      <br/>
      <img className="img-fluid" src='img/kubik.jpg'/>
    </div>
  },
  {
    id: 14,
    pos: [49.1883414, 16.6711181],
    name: 'Stránská přístřešek',
    content: <div>
      Čtvery šatičky<br/>
      Viki za svatbu vystřídala,<br/>
      k nim ještě střevíčky<br/>
      a úplná princezna by z ní byla.<br/>
      <br/>
      <img className="img-fluid" src='img/saticky.jpg'/>
    </div>
  },
  {
    id: 15,
    pos: [49.1793528, 16.6771664],
    name: 'Lesík Langrova',
    content: <div>
      Tanec novomanželský<br/>
      pro dva má být pouze,<br/>
      Viki však spustila pláč nehezký,<br/>
      a tak ve třech ploužili se dlouze.<br/>
      <br/>
      <img className="img-fluid" src='img/tanec.jpg'/>
    </div>
  }
];

const f_stawberry_ico = new Icon({
  iconUrl: "img/strawberry.png",
  iconSize: def_icon_size,
  className: 'fade_in'
});

const nf_stawberry_ico = new Icon({
  iconUrl: "img/strawberry-g.png",
  iconSize: def_icon_size,
  className: 'fade_in'
});

function collect_acc_active(acc){
  return acc <= DISTANCE_TRESHOLD;
}

export function StrawberryMarker(strawberry, user_pos, user_acc){

  var found_strawberries = JSON.parse(localStorage.getItem('found_berries') || "[]");
  const [found, setFound] = useState(found_strawberries.includes(strawberry.id));
  
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const dist = user_pos == null ? null : Math.round(user_pos.distanceTo(strawberry.pos));

  if(dist != null && dist <= DISTANCE_TRESHOLD && !found_strawberries.includes(strawberry.id) && collect_acc_active(user_acc)){
    setFound(true);
    found_strawberries.push(strawberry.id);
    localStorage.setItem('found_berries', JSON.stringify(found_strawberries));
  }

  return (
    <div>
      <Marker my_data={found} my_id={strawberry.id} position={strawberry.pos} icon={found ? f_stawberry_ico : nf_stawberry_ico} eventHandlers={{
        click: (e) => {
          if(found){
            handleShow();
          }
        },
      }}> 
      {!found ? <Popup>Nejdřív mě musíš najít <br/>{dist != null? "Jsem " + dist + "m daleko": null} </Popup> : null}
      </Marker>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {strawberry.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {strawberry.content}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default function App() {

  const [map, setMap] = useState(null);
  const [positionSt, setPosition] = useState(null);
  const [pos_acc, setAcc] = useState(null);
  const [pos_collor, setPosCollor] = useState(null);

  var opened_first_time = localStorage.getItem('opened');
  const [show, setShow] = useState(opened_first_time == null);
  const handleClose = () => {
    localStorage.setItem('opened', "false");
    setShow(false)};
  const handleShow = () => setShow(true);

  var position = null;
  var track = false;
  var follow = false;

  function pos_updater(){
    map.locate().on("locationfound", function (e) {
      position = e.latlng;
      setPosition(e.latlng);
      setAcc(e.accuracy);
      setPosCollor(collect_acc_active(e.accuracy) ? "green" : "blue");
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
    }, { position: 'bottomright' }).addTo(map);
    L.easyButton("fa-solid fa-info", (btn) => {
      handleShow();
    }, { position: 'bottomright' }).addTo(map);
  }, [map]);

  return (
    <div>
      <MapContainer center={def_position} zoom={15} ref={setMap} zoomControl={false}>
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
        <ZoomControl position='bottomright'></ZoomControl>
        {positionSt == null ? null : 
        <div>
          <CircleMarker center={positionSt} fillOpacity={0.8} fillColor={pos_collor} color={pos_collor}/>
          <Circle center={positionSt} radius={pos_acc} fillColor={pos_collor} color={pos_collor}/>
        </div>}
      </MapContainer>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Vítejte ve sběru jahůdek
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Vaším úkolem bude sesbírat co nejvíce, nejlépe všech 15 jahůdek na mapě, abyste si prošli náše vzpomínky na vaši svatbu.<br/>
          Jahůdku seberete tak, že dorazíte na patřičné místo na mapě a aktivujete sledování polohy (tlačítko vpravo dole - viz obrázek).<br/>
          <br/>
          <img className="img-fluid" src='img/poloha.png'/>
          <br/>
          <br/>
          Pokud je vaše pozice znázorněna zelenou tečkou se zeleným kruhem, je vaše pozice dostatečně zaměřená a můžete sbírat, v případě, že je modrá, jahůdky sbírat nejde.<br/>
          Mělo by stačit počkat dokud kruh nezezelená, jinak zkuste znovu načíst stránku a znovu aktivovat sledování polohy.<br/>
          Pokud je jahůdka barevná, lze kliknutím na ní odhalit vzpomínku.<br/>
          Ulovené jahůdky si pamatuje každé zařízení zvlášť a po nějaké době (cca jeden týden) je znovu zapomene.<br/>
          <br/>
          Šťastný lov přejí Majda s Vojtou.<br/>
          <br/>
          <img className="img-fluid" src='img/strawberry.png' height={38} width={38}/>
        </Modal.Body>
      </Modal>
    </div>

    );
}



