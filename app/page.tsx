'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// --- 🚀 FUNÇÕES DO BANCO DE DADOS LOCAL (INDEXEDDB) ---
const DB_NAME = 'VivianAuditoriaDB';
const STORE_NAME = 'checklists';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToIndexedDB = async (key: string, data: any) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

const loadFromIndexedDB = async (key: string) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const removeFromIndexedDB = async (key: string) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
// -----------------------------------------------------------

const SETORES_LISTA = ["Gerente", "SubGerente", "FLV", "Mercearia", "FLC (Frios e Laticínios)", "Padaria-Confeitaria-Rotisseria"];

// --- 🍞 BANCO DE DADOS DE PRODUTOS TOP 10 ---
const PRODUTOS_PADARIA = [
  { id: '500666', name: 'Biscoito Amanteigado Kg' }, { id: '1428950', name: 'Biscoito Flor De Pistache Kg' }, { id: '960845', name: 'Biscoito Gourmet Kg' },
  { id: '838810', name: 'Cafe Moido 500g' }, { id: '1435990', name: 'Pd Batata Recheada Kg' }, { id: '411701', name: 'Pd Biscoito Mineiro Kg' },
  { id: '199770', name: 'Pd Bolacha Agua Sal Kg' }, { id: '863653', name: 'Pd Bolacha Pet Four Kg' }, { id: '1064479', name: 'Pd Broa C/ Chocolate Kg' },
  { id: '806633', name: 'Pd Broa Milho Kg' }, { id: '469734', name: 'Pd Broinha Caxambu Kg' }, { id: '917966', name: 'Pd Chipa Unid' },
  { id: '917958', name: 'Pd Chipa Kg' }, { id: '1173650', name: 'Pd Chocottone C/ Cobertura Kg' }, { id: '426270', name: 'Pd Chocottone Da Casa 100g' },
  { id: '426253', name: 'Pd Chocottone Da Casa 500g' }, { id: '914312', name: 'Pd Chocottone Trufado Kg' }, { id: '1173677', name: 'Pd Chocottone Trufado Kg Dois Amores' },
  { id: '1173642', name: 'Pd Chocottone Trufado Kg Ferrero Rocher' }, { id: '851779', name: 'Pd Colomba Pascal Kg' }, { id: '239640', name: 'Pd Colomba Pascal Frutas 400g' },
  { id: '604801', name: 'Pd Colomba Pascal Gotas Choc 400g' }, { id: '1089404', name: 'Pd Croissant Calabresa Kg' }, { id: '1094653', name: 'Pd Cuca Doce Doce Sabores Kg' },
  { id: '425036', name: 'Pd Cueca Virada Kg' }, { id: '1427628', name: 'Pd Donuts Coraçao Un' }, { id: '924180', name: 'Pd Donuts Sabores Un' },
  { id: '199460', name: 'Farinha Rosca Kg' }, { id: '514209', name: 'Pd Fatia Hungara Kg' }, { id: '870706', name: 'Pd Lua De Mel Kg' },
  { id: '199478', name: 'Pd Massa Pizza Kg' }, { id: '1368222', name: 'Pd Mini Baquete 100g' }, { id: '282804', name: 'Pd Panettone Da Casa 100g' },
  { id: '1440829', name: 'Pd Panettone Da Casa 400g' }, { id: '199524', name: 'Pd Panettone Da Casa 500g' }, { id: '454907', name: 'Pd Pao Amanhecido Kg' },
  { id: '997455', name: 'Pd Pao Australiano Kg' }, { id: '869066', name: 'Pd Pao Baguete Integral 38% Kg' }, { id: '839140', name: 'Pd Pao Baguete Kg' },
  { id: '524247', name: 'Pd Pao Baguete Mini Veneza Kg' }, { id: '917486', name: 'Pd Pao Baguete Tradicional Kg' }, { id: '201588', name: 'Pd Pao Bisnaguinha Kg' },
  { id: '869783', name: 'Pd Pao Brioche Kg' }, { id: '869163', name: 'Pd Pao Brioche Kg' }, { id: '1128140', name: 'Pd Pao Caseirinho Kg' },
  { id: '199559', name: 'Pd Pao Caseiro Da Vovo Kg' }, { id: '917451', name: 'Pd Pao Centeio Bola Kg' }, { id: '1063820', name: 'Pd Pao De Alho Kg' },
  { id: '868981', name: 'Pd Pao De Açucar Kg' }, { id: '199710', name: 'Pd Pao De Batata Kg Doce' }, { id: '455539', name: 'Pd Pao De Batata Kg' },
  { id: '869023', name: 'Pd Pao De Beterraba Kg' }, { id: '868710', name: 'Pd Pao De Cenoura Kg' }, { id: '1176935', name: 'Pd Pao De Coco Kg' },
  { id: '407631', name: 'Pd Pao De Forma Kg' }, { id: '199672', name: 'Pd Pao De Hamburguer Kg' }, { id: '199680', name: 'Pd Pao De Hot Dog Kg' },
  { id: '199508', name: 'Pd Pao De Hot Dog Mini Kg' }, { id: '199621', name: 'Pd Pao De Leite Kg' }, { id: '917940', name: 'Pd Pao De Queijo Kg' },
  { id: '1116037', name: 'Pd Pao De Queijo Palito Kg' }, { id: '1453130', name: 'Pd Pao De Queijo Rech Bacon Kg' }, { id: '1448978', name: 'Pd Pao De Queijo Rech Frango Kg' },
  { id: '1448951', name: 'Pd Pao De Queijo Rech Goiabada Kg' }, { id: '1448960', name: 'Pd Pao De Queijo Rech Requeijao Kg' }, { id: '214698', name: 'Pd Pao Doce Kg' },
  { id: '864013', name: 'Pd Pao Doce Trança Caracol Kg' }, { id: '851744', name: 'Pd Pao Frances Mini Kg' }, { id: '917494', name: 'Pd Pao Fuba Bola Kg' },
  { id: '199699', name: 'Pd Pao Integral Kg' }, { id: '228141', name: 'Pd Pao Italiano Kg' }, { id: '850632', name: 'Pd Pao Kuke Do Padeiro Goiaba Kg' },
  { id: '850640', name: 'Pd Pao Kuke Do Padeiro Kg' }, { id: '179760', name: 'Pd Pao Melao Kg' }, { id: '839299', name: 'Pd Pao Milho Kg' },
  { id: '924075', name: 'Pd Pao Mini Baguete Tradicional Kg' }, { id: '869058', name: 'Pd Pao Portugues Kg' }, { id: '917524', name: 'Pd Pao Rosca Doce Kg' },
  { id: '917630', name: 'Pd Pao Sirio Kg' }, { id: '199745', name: 'Pd Pao Sovado Kg' }, { id: '1406329', name: 'Pd Pao Tipo Australiano Kg' },
  { id: '565180', name: 'Pd Pao Torresmo Kg' }, { id: '1181211', name: 'Pd Paozinho Curit Choco Kg' }, { id: '1181220', name: 'Pd Paozinho Curitibano Kg' },
  { id: '917656', name: 'Pd Rosca Natalina Kg' }, { id: '1418220', name: 'Pd Rosquinha De Laranja Kg' }, { id: '248118', name: 'Pd Rosquinha Pinga Kg' },
  { id: '870650', name: 'Pd Sequilhos Kg' }, { id: '201855', name: 'Pd Torrada Kg' }, { id: '868523', name: 'Pizza Especial Kg' }, { id: '917559', name: 'Rosquinha Da Vovo Kg' }
];

const PRODUTOS_ROTISSERIA = [
  { id: '869287', name: 'Coxinha De Mandioca C/ Carne Moida Un' }, { id: '869279', name: 'Coxinha De Mandioca C/ Frango Un' }, { id: '917974', name: 'Croissant C/ Calabresa Kg' },
  { id: '917982', name: 'Croissant C/ Pres/Queijo Kg' }, { id: '1096192', name: 'Croissant Frango C/ Requeijao Kg' }, { id: '1000136', name: 'Croquete Un' },
  { id: '680044', name: 'Esfirra Aberta Kg' }, { id: '1333704', name: 'Fornecimento Lanche Para Evento' }, { id: '1343548', name: 'Kibe C/ Requeijao Lanche Un' },
  { id: '862673', name: 'Mini Pastel Vento Kg' }, { id: '1150359', name: 'Mini Salgados Assados Unidade' }, { id: '973661', name: 'Pastel De Vento Unidade' },
  { id: '869309', name: 'Pd Salgado Assado Un' }, { id: '1101650', name: 'Risoles Unidade' }, { id: '1448382', name: 'Rt Arroz Branco Vivian Kg' },
  { id: '1448374', name: 'Rt Arroz Temperado Vivian Kg' }, { id: '163600', name: 'Rt Barqueta Un' }, { id: '249220', name: 'Rt Barquete Un Chocolate' },
  { id: '862657', name: 'Rt Bauru Kg' }, { id: '1385801', name: 'Rt Bolinho De Bacalhau Kg' }, { id: '870064', name: 'Rt Bolinho De Carne Kg' },
  { id: '862460', name: 'Rt Bolinho De Carne Mini Kg' }, { id: '918016', name: 'Rt Calzone Sabores Un' }, { id: '918008', name: 'Rt Coxinha Costela Un' },
  { id: '869589', name: 'Rt Empada Kg' }, { id: '869422', name: 'Rt Empada Vivian Un' }, { id: '869570', name: 'Rt Empadao De Frango Kg' },
  { id: '862541', name: 'Rt Empadinha De Frango Kg' }, { id: '1063782', name: 'Rt Enroladinho Pres Qjo Kg' }, { id: '444111', name: 'Rt Enroladinho Presunto Mussarela Un' },
  { id: '960764', name: 'Rt Enrolado Cabotia Un' }, { id: '590444', name: 'Rt Enrolado Salsicha Kg' }, { id: '1100890', name: 'Rt Escond De Carne Moida Kg' },
  { id: '869368', name: 'Rt Esfiha De Unidade' }, { id: '710342', name: 'Rt Esfirra Frango Un' }, { id: '402532', name: 'Rt Esfirra Kg' },
  { id: '501131', name: 'Rt Esfirrra Carne Un' }, { id: '870854', name: 'Rt Espetinho Bovino Kg' }, { id: '590550', name: 'Rt Espetinho Cafta Carne Kg' },
  { id: '616435', name: 'Rt Espetinho Carne Un' }, { id: '592382', name: 'Rt Espetinho De Frango Frito Un' }, { id: '1129333', name: 'Rt Espetinho Frango Kg' },
  { id: '1452118', name: 'Rt File Mignon Suino Assado Vivian Kg' }, { id: '402940', name: 'Rt Foccacia Kg' }, { id: '1448048', name: 'Rt Frango Coxa/Sobrec Assado Kg' },
  { id: '1447432', name: 'Rt Frango Frito Kg' }, { id: '1094548', name: 'Rt Hamburgao Assado Un' }, { id: '1110560', name: 'Rt Hot Dog Kg' },
  { id: '1441760', name: 'Rt Kibe Recheado Assado Kg' }, { id: '552887', name: 'Rt Lanche Frio Kg' }, { id: '1118161', name: 'Rt Lanche Hamburguer Da Casa Kg' },
  { id: '1063405', name: 'Rt Lanche Hamburguer Kg' }, { id: '1063413', name: 'Rt Lanche Hot Dog Kg' }, { id: '862851', name: 'Rt Lanche Shawarma Kg' },
  { id: '1347039', name: 'Rt Lasanha De Carne Da Casa Kg' }, { id: '862614', name: 'Rt Lasanha De Carne Kg' }, { id: '917702', name: 'Rt Lasanha De Frango Da Casa Kg' },
  { id: '1448102', name: 'Rt Maionese Vivian Kg' }, { id: '869899', name: 'Rt Mini Enroladinho De Calabreza Kg' }, { id: '917990', name: 'Rt Mini Enroladinho De Salsichakg' },
  { id: '862606', name: 'Rt Mini Enroladinho Frango/Catupiry Kg' }, { id: '862630', name: 'Rt Mini Enroladinho Queijo e Presunto Kg' }, { id: '862649', name: 'Rt Mini Hamburguinho Kg' },
  { id: '1443186', name: 'Rt Misto Quente Kg' }, { id: '869180', name: 'Rt Panqueca De Carne Kg' }, { id: '869198', name: 'Rt Panqueca De Frango Kg' },
  { id: '917621', name: 'Rt Pao Com Linguiça Kg' }, { id: '1103580', name: 'Rt Pastel Kg' }, { id: '1343688', name: 'Rt Pastel De Nata Un' },
  { id: '1431480', name: 'Rt Pastel De Vento Kg' }, { id: '1448609', name: 'Rt Pernil Assado Vivian Kg' }, { id: '842516', name: 'Rt Pizza Da Casa 600g' },
  { id: '607819', name: 'Rt Pizza Pronta Assada Kg' }, { id: '592455', name: 'Rt Pizza Semi Pronta Kg' }, { id: '1444824', name: 'Rt Quiche Kg' },
  { id: '869627', name: 'Rt Rondelli Carne Kg' }, { id: '869678', name: 'Rt Rondelli Frango Kg' }, { id: '972452', name: 'Rt Rondelli Presunto Queijo Kg' },
  { id: '864765', name: 'Rt Salgado Frito Grande Un' }, { id: '869929', name: 'Rt Salgado Frito Mini Un' }, { id: '1448528', name: 'Rt Salpicao Vivian Kg' },
  { id: '1441027', name: 'Rt Sanduiche De Forno Kg Bacon' }, { id: '1441019', name: 'Rt Sanduiche De Forno Kg Calabresa' }, { id: '1449176', name: 'Rt Sanduiche De Forno Kg Carne' },
  { id: '1440993', name: 'Rt Sanduiche De Forno Kg Frango' }, { id: '1441086', name: 'Rt Sanduiche De Forno Kg Hamburguer' }, { id: '1449168', name: 'Rt Sanduiche De Forno Kg Palmito' },
  { id: '1441000', name: 'Rt Sanduiche De Forno Kg Presunto/Queijo' }, { id: '1449745', name: 'Rt Sanduiche De Forno Kg Salsi/Pres/Quei' }, { id: '1441094', name: 'Rt Sanduiche De Forno Kg Salsicha C/ Frango' },
  { id: '1452100', name: 'Rt Sobrepa Suina Assado Vivian Kg' }, { id: '1451510', name: 'Rt Torta Salgada Atum Kg' }, { id: '371998', name: 'Rt Torta Salgada Carne Kg' },
  { id: '853550', name: 'Rt Torta Salgada Frango Kg' }, { id: '1451480', name: 'Rt Torta Salgada Legumes Kg' }, { id: '1106139', name: 'Sa Bauru Calabresa Un' },
  { id: '1105787', name: 'Sa Bauru Frango Und' }, { id: '1105779', name: 'Sa Bauru Pres/Queijo Un' }, { id: '1105744', name: 'Sa Calzone De Frango Unidade' },
  { id: '1105752', name: 'Sa Calzone De Palmito Unidade' }, { id: '1105760', name: 'Sa Esfirra Carne Unidade' }, { id: '1105817', name: 'Sa Esfirra Frango Unidade' },
  { id: '1105795', name: 'Sa X-Burguer Unidade' }
];

const PRODUTOS_CONFEITARIA = [
  { id: '863947', name: 'Cf Alfajor Doce De Leite Kg' }, { id: '163180', name: 'Cf Amendoin Cri Cri Kg' }, { id: '712418', name: 'Cf Biscoito Mantecaus Kg' },
  { id: '869201', name: 'Cf Bol De Leite Ninho c Avela Kg' }, { id: '1168622', name: 'Cf Bolacha Leite Ninho Kg' }, { id: '1090020', name: 'Cf Bolo Banana C/ Farofa Kg' },
  { id: '870366', name: 'Cf Bolo Brownie Cremoso Kg' }, { id: '1091883', name: 'Cf Bolo De Cenoura Kg' }, { id: '1128132', name: 'Cf Bolo De Fuba Com Goiabada Kg' },
  { id: '1143395', name: 'Cf Bolo De Milho Especial Kg' }, { id: '1190725', name: 'Cf Bolo De Pamonha Kg' }, { id: '870161', name: 'Cf Bolo Doce Leite Chocolate Kg' },
  { id: '870358', name: 'Cf Bolo Doce Leite Festa Kg' }, { id: '710628', name: 'Cf Bolo Doce Leite Kg' }, { id: '712043', name: 'Cf Bolo Gelado Kg' },
  { id: '1090038', name: 'Cf Bolo Indiano Kg' }, { id: '1431498', name: 'Cf Bolo Matilda Kg' }, { id: '496391', name: 'Cf Bolo Milho Cremoso Kg' },
  { id: '1139908', name: 'Cf Bolo Natalino Kg' }, { id: '405957', name: 'Cf Bolo Olho De Sogra Kg' }, { id: '924156', name: 'Cf Bolo Pelado Kg' },
  { id: '1092537', name: 'Cf Bolo Pote Kg' }, { id: '1154273', name: 'Cf Bolo Pote Kg Especial' }, { id: '1168762', name: 'Cf Bolo Rech Brigadeiro Kg' },
  { id: '615668', name: 'Cf Bolo Sc Aipim Kg' }, { id: '870374', name: 'Cf Bolo Sc Banana Kg' }, { id: '1089390', name: 'Cf Bolo Sc Baunilha Kg' },
  { id: '398063', name: 'Cf Bolo Sc Cenoura Kg' }, { id: '518247', name: 'Cf Bolo Sc Chocolate Kg' }, { id: '1153790', name: 'Cf Bolo Sc Churros Kg' },
  { id: '518220', name: 'Cf Bolo Sc Coco Kg' }, { id: '565660', name: 'Cf Bolo Sc Formigueiro Kg' }, { id: '914509', name: 'Cf Bolo Sc Frutas Vermelhas Kg' },
  { id: '202940', name: 'Cf Bolo Sc Fuba Kg' }, { id: '201693', name: 'Cf Bolo Sc Laranja Kg' }, { id: '635413', name: 'Cf Bolo Sc Leite Condensado Kg' },
  { id: '996602', name: 'Cf Bolo Sc Limao Kg' }, { id: '863327', name: 'Cf Bolo Sc Marmore Kg' }, { id: '1128124', name: 'Cf Bolo Sc Milho Kg' },
  { id: '710580', name: 'Cf Bolo Sc Milho Kg' }, { id: '1094963', name: 'Cf Bolo Sc Pacoquita Kg' }, { id: '1143417', name: 'Cf Bolo Sc Pacoquita Kg Recheio' },
  { id: '864900', name: 'Cf Bomba Brigadeiro Kg' }, { id: '864919', name: 'Cf Bomba Chocolate Kg' }, { id: '864897', name: 'Cf Bomba Creme Kg' },
  { id: '865176', name: 'Cf Bomba De Creme C/ Morango Kg' }, { id: '870730', name: 'Cf Bomba Dois Amores Kg' }, { id: '200190', name: 'Cf Bomba Kg' },
  { id: '865214', name: 'Cf Bomba Ouro Branco Kg' }, { id: '865150', name: 'Cf Bomba Sonho Valsa Kg' }, { id: '481394', name: 'Cf Bombocado Kg' },
  { id: '917516', name: 'Cf Bombom Barras Especial Kg' }, { id: '1178709', name: 'Cf Bombom De Brigadeiro Kg' }, { id: '1178652', name: 'Cf Bombom De Maracuja Kg' },
  { id: '1178660', name: 'Cf Bombom De Prestigio Kg' }, { id: '865443', name: 'Cf Bombom Especial Kg' }, { id: '769533', name: 'Cf Brevidade Kg' },
  { id: '864714', name: 'Cf Brigadeirinho Kg' }, { id: '576093', name: 'Cf Brigadeiro Leite Ninho Kg' }, { id: '1178687', name: 'Cf Camafel Nozes Kg' },
  { id: '835951', name: 'Cf Carolina Brigadeiro Kg' }, { id: '1173960', name: 'Cf Carolina De Creme Kg' }, { id: '201758', name: 'Cf Carolina Doce Leite Kg' },
  { id: '835994', name: 'Cf Carolina Ninho Kg' }, { id: '1178962', name: 'Cf Carolina Pacoquinha Kg' }, { id: '710695', name: 'Cf Cocada Kg' },
  { id: '1067664', name: 'Cf Cone Recheado Unidade' }, { id: '344958', name: 'Cf Cookies Kg' }, { id: '1430521', name: 'Cf Coxinha De Morango Kg' },
  { id: '1120000', name: 'Cf Cri Cri Kg' }, { id: '1112813', name: 'Cf Cupcake Kg' }, { id: '1131940', name: 'Cf Doce Confeitaria Fina Kg' },
  { id: '846970', name: 'Cf Doce De Leite Condensado Kg' }, { id: '863386', name: 'Cf Donuts Recheado Kg' }, { id: '1002970', name: 'Cf Fios De Ovos Kg' },
  { id: '981745', name: 'Cf Gelatina Mosaico Kg' }, { id: '930610', name: 'Cf Maca Do Amor Kg' }, { id: '870579', name: 'Cf Macrom Kg' },
  { id: '512338', name: 'Cf Maria Mole Kg' }, { id: '1170163', name: 'Cf Mini Churros Kg' }, { id: '1430530', name: 'Cf Morango Do Amor Kg' },
  { id: '1178695', name: 'Cf Mousse Especial Kg' }, { id: '1064363', name: 'Cf Mousse Mini Kg' }, { id: '778605', name: 'Cf Muffins Chocolate C/ Gotas Kg' },
  { id: '639702', name: 'Cf Muffins Sabores Kg' }, { id: '1084240', name: 'Cf Ovo Pascoa Colh Confete Kg' }, { id: '1147943', name: 'Cf Ovo Pascoa Colh Limão Kg' },
  { id: '1176641', name: 'Cf Ovo Pascoa Colher Ninho Kg' }, { id: '1177869', name: 'Cf Ovo Pascoa Colher Brigadeiro Kg' }, { id: '1177877', name: 'Cf Ovo Pascoa Kg 2 Amores' },
  { id: '1177893', name: 'Cf Ovo Pascoa Kg Ferrero Rocher' }, { id: '1177931', name: 'Cf Ovo Pascoa Kg Maracuja' }, { id: '1177885', name: 'Cf Ovo Pascoa Kg Ninho C/ Creme Avelã Kg' },
  { id: '1177850', name: 'Cf Ovo Pascoa Kg Oreo' }, { id: '478881', name: 'Cf Pacoquinha Amendoim Kg' }, { id: '1168592', name: 'Cf Pacoquinha Colher Kg' },
  { id: '809519', name: 'Cf Pao De Mel Kg' }, { id: '1439090', name: 'Cf Pao De Mel Uni' }, { id: '1128230', name: 'Cf Pastel De Leite Ninho Kg' },
  { id: '865907', name: 'Cf Pave Cafe Kg' }, { id: '870145', name: 'Cf Pave Chocolate Kg' }, { id: '870200', name: 'Cf Pave Frutas Kg' },
  { id: '870196', name: 'Cf Pave c t Nata Kg' }, { id: '1448560', name: 'Cf Pavê De Capuccino Kg' }, { id: '566209', name: 'Cf Pe De Moleque Kg' },
  { id: '870455', name: 'Cf Petifour De Chocolate Kg' }, { id: '824089', name: 'Cf Pudim Caseiro Kg' }, { id: '571482', name: 'Cf Pudim De Iogurte Kg' },
  { id: '201790', name: 'Cf Pudim Leite Condensado Kg' }, { id: '504939', name: 'Cf Queijadinha Kg' }, { id: '1186426', name: 'Cf Quindin Kg' },
  { id: '846953', name: 'Cf Rocambole 4 Leites Kg' }, { id: '809314', name: 'Cf Rocambole Brigadeiro Kg' }, { id: '407321', name: 'Cf Rocambole Doce Leite Kg' },
  { id: '1168576', name: 'Cf Rocambole Dois Amor Kg' }, { id: '484199', name: 'Cf Rocambole Especial Kg' }, { id: '869821', name: 'Cf Rocambole Goiabada Kg' },
  { id: '1178890', name: 'Cf Rocambole Leite Ninho C/Nutella Kg' }, { id: '1115090', name: 'Cf Rocambole Leite Ninho Kg' }, { id: '869864', name: 'Cf Rocambole Prestigio Kg' },
  { id: '576484', name: 'Cf Rosca Santa Clara Kg' }, { id: '870625', name: 'Cf Samantinha Kg' }, { id: '870510', name: 'Cf Sobremesa Leite Moca Kg' },
  { id: '924938', name: 'Cf Sobremesa Natalina Kg' }, { id: '863602', name: 'Cf Sonho De Creme Kg' }, { id: '199230', name: 'Cf Sonho De Doce De Leite Kg' },
  { id: '863637', name: 'Cf Sonho De Nata Kg' }, { id: '199290', name: 'Cf Suspiro Kg' }, { id: '924326', name: 'Cf Torta Mousse Chocolate Kg' },
  { id: '870382', name: 'Cf Torta 4 Leites Kg' }, { id: '1123572', name: 'Cf Torta Alemã Kg' }, { id: '518182', name: 'Cf Torta Banana Kg' },
  { id: '1091557', name: 'Cf Torta Banoffee Kg' }, { id: '838497', name: 'Cf Torta Brigadeiro Kg' }, { id: '869333', name: 'Cf Torta De Frutas Kg' },
  { id: '869651', name: 'Cf Torta De Nozes Kg' }, { id: '809497', name: 'Cf Torta Dois Amores Kg' }, { id: '924172', name: 'Cf Torta Ferrero Rocher Kg' },
  { id: '710750', name: 'Cf Torta Floresta Negra Kg' }, { id: '1208292', name: 'Cf Torta Frutas Vermelhas Kg' }, { id: '866687', name: 'Cf Torta Holandesa Kg' },
  { id: '527394', name: 'Cf Torta Laka Kg' }, { id: '464082', name: 'Cf Torta Limao Kg' }, { id: '812129', name: 'Cf Torta Mineira Kg' },
  { id: '201260', name: 'Cf Torta Morango Kg' }, { id: '924164', name: 'Cf Torta Ninho C/ Avela Kg' }, { id: '710768', name: 'Cf Torta Ouro Branco Kg' },
  { id: '199150', name: 'Cf Torta Prestrigo Suprema Kg' }, { id: '1120441', name: 'Cf Torta Red Velvet Kg' }, { id: '199184', name: 'Cf Torta Sonho De Valsa Kg' },
  { id: '719285', name: 'Cf Torta Suflair Kg' }, { id: '712051', name: 'Cf Torta Tentacao Chocolate Morango Kg' }, { id: '521787', name: 'Cf Torta Tentacao Kg' },
  { id: '812285', name: 'Cf Torta Tipo Kinder Ovo Kg' }, { id: '869554', name: 'Cf Torta Trufada De Nata Kg' }, { id: '1349937', name: 'Cf Torta Unidade' },
  { id: '870587', name: 'Cf Torteleta Chocolate Kg' }, { id: '870536', name: 'Cf Torteleta Maracuja Kg' }, { id: '605603', name: 'Cf Torteleta Morango Kg' },
  { id: '870595', name: 'Cf Tortelete Kg' }, { id: '870528', name: 'Cf Tortelete Limao Kg' }, { id: '921122', name: 'Cf Tortelete Sabores Un' },
  { id: '1402404', name: 'Churros Kg Gourmet' }, { id: '976121', name: 'Churros Mini Kg Chocolate' }, { id: '1000160', name: 'Churros Un Choc' },
  { id: '1120450', name: 'Croissant Chocolate Kg' }, { id: '1090046', name: 'Rocambole Brigadeiro Doce Doce Kg' }, { id: '574783', name: 'Sub Bolo Pao De Lo Chocolate Placa Kg' },
  { id: '919748', name: 'Sub Bolo Pao De Lo Placa Branca Kg' }
];

// 2. TAREFAS
const TASK_DATA: any = {
  'TESTE_SISTEMA': [
    { description: 'TESTE: Validar se a foto está subindo', periodicity: 'DIÁRIO' },
    { description: 'TESTE: Validar se a observação salva', periodicity: 'DIÁRIO' },
  ],
  'Gerente': [
    { description: 'V.O. MANHÃ: Preços no sistema / PDV (Atualização de preços no sistema)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { 
      description: 'V.O. MANHÃ: Balcões de frios (abastecimento, precificação, qualidade, limpeza, equipamentos)', 
      periodicity: 'DIÁRIO',
      subItems: ['FATIADOS', 'IOGURTES', 'MARGARINAS', 'EMBUTIDOS/MASSAS', 'GELADEIRAS/FREEZERS-SORVERTES']
    },
    { description: 'V.O. MANHÃ: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta e repassar ao encarregado', periodicity: 'DIÁRIO' },
    { 
      description: 'V.O. MANHÃ: Balcões de açougue (abastecimento, precificação, qualidade, limpeza)', 
      periodicity: 'DIÁRIO',
      subItems: ['LINGUIÇA', 'CARNE BOVINA', 'CARNE SUÍNA', 'CARNE AVES', 'PÃO DE ALHO'] 
    },
    { description: 'V.O. MANHÃ: Bebidas frias geladeiras abastecidas constantes', periodicity: 'DIÁRIO', 
      subItems: ['GELADEIRAS FRENTE DE CAIXA', 'GELADEIRAS LINHA COCA-COLA', 'GELADEIRAS REFRIGERANTES/CERVEJAS'] 
    },
    { description: 'V.O. MANHÃ: Cartazeamento dentro e fora da loja (Validade, descrição, local correto)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Depósito organizado e limpo', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Equipamentos em funcionamento (refrigeradores, freezers, iluminação...)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Hortifruti (Qualidade, precificação, abastecimento, cartazeamento)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Limpeza e organização dos banheiros e frente de caixa', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Pontos extras (Abastecimento, precificação, validade)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Som do rádio interno (volume, ruídos...)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Acompanhar vendas, perdas, margem versus a META do dia anterior/acumulado mês', periodicity: 'DIÁRIO' },
    { description: 'DIA: Verificar rupturas na área de venda e acionar o responsável imediatamente', periodicity: 'DIÁRIO' },
    { description: 'DIA: Comunicar apostas comerciais ao time de encarregados', periodicity: 'DIÁRIO' },
    { description: 'DIA: Ruptura crítica (itens de curva A)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Acompanhamentos vendas dos itens das ofertas, se a exposição foi em aceita', periodicity: 'DIÁRIO' },   
    { description: 'DIA: Preparação para os festivais, degustações, ofertas do dia (cartazeamento, exposição)', periodicity: 'DIÁRIO' },
    { description: 'DIA: Acompanhar divergências no recebimento (quantidade e valor e após entender junto com o comercial e CPD loja os motivos para a correção.', periodicity: 'DIÁRIO' },
    { description: 'SEMANAL: Toda sexta-feira: Definir ofertas do hortifruti', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Validade dos produtos (lista dos itens com plano de ação)', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Estoque - Troca - Extrato de movimentação, acompanhamento junto ao Cleber', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: SEXTA 14:00h- Comercial - Lista de produtos com validade curta 7 dias (trabalhar com plano de ação, rebaixe de preço, exposição, cartazeamento, estoques)', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Acompanhar o despacho de osso', periodicity: 'SEMANAL' },
    { description: 'SEMANAL: Comercial (Levar sugestões de ofertas agressivas ao comercial, como itens próximo de vencimento, levantar as informações ao repassar aos setores)', periodicity: 'SEMANAL' },
    { description: 'MENSAL: Reunião Gerente Geral com encarregados(as) e Subgerente', periodicity: 'MENSAL' },
    { description: 'MENSAL: Reunião Encarregados(as) com a sua equipe (falar dos pontos do mês que passou e plano de ação para o mês seguinte)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Reunião Indicadores com Comercial (Gerente, Sub, RH e Comercial)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Perdas (top 5 perdas por setor e traçar plano de ação)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Divergências no recebimento (Entender o motivo para resolução)', periodicity: 'MENSAL' },
    { description: 'MENSAL: Gerenciar produtos próximos do vencimento com exposição agressiva', periodicity: 'MENSAL' },
    { description: 'MENSAL: Acompanhar cotações', periodicity: 'DIÁRIO' },
    { description: 'MENSAL: Elaborar relatórios semanais das vendas das cotações', periodicity: 'MENSAL' },
    { description: 'MENSAL: Perdas e itens sem giro (Reunião com Prevenção - plano de ação)', periodicity: 'MENSAL' },
  ],
  'SubGerente': [
    { description: 'OPERAÇÃO: Acompanhar cotações', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Apresentação pessoal da equipe (uniformes, maquiagem, cabelos) e escalas', periodicity: 'DIÁRIO' },
     { 
      description: 'V.O. MANHÃ: Balcões de açougue (abastecimento, precificação, qualidade, limpeza)', 
      periodicity: 'DIÁRIO',
      subItems: ['LINGUIÇA', 'CARNE BOVINA', 'CARNE SUÍNA', 'CARNE AVES', 'PÃO DE ALHO'] 
    },
    { description: 'OPERAÇÃO: Balcões de padaria (abastecimento, precificação, qualidade, limpeza, equipamentos)', periodicity: 'DIÁRIO' },
    { description: 'V.O. MANHÃ: Bebidas frias geladeiras abastecidas constantes', periodicity: 'DIÁRIO', 
      subItems: ['GELADEIRAS FRENTE DE CAIXA', 'GELADEIRAS LINHA COCA-COLA', 'GELADEIRAS REFRIGERANTES/CERVEJAS'] 
    },
    { description: 'OPERAÇÃO: Cartazeamento dentro e fora da loja (Validade, descrição, local correto)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Corredores da área de venda (está livre para que o cliente consiga passar com os carrinhos)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Depósito organizado e limpo', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Equipamentos em funcionamento (refrigerados, freezers, iluminação...)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Festivais - Exposição agressivo e cartazeamento (não deixar falta o item)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Hortifrutti (Qualidade, precificação, abastecimento, cartazeamento)', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Limpeza e organização da frente de caixa', periodicity: 'DIÁRIO' },
    { description: 'QUALIDADE: Limpeza e organization dos banheiros', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Ofertas diárias (Pegar o encarte de ofertas e ver como está a exposição, precificação)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Ofertas do dia (abastecimento, precificação)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Pontas de gôndulas (Abastecimento, troca de preços, cartazeamento, validade da ação) - sugerir troca', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Precificação (todos os produtos com a etiqueta de preço)', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: REPOSIÇÃO (área de venda sem buracos), ver produtos em falta na área de venda e repassar ao encarregado da reposição', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: QUINTA - Recolher lista de validades com encarregados dos setores', periodicity: 'SEMANAL' },
    { description: 'PREVENÇÃO: Lista de produtos com validade curta 15 dias (trabalhar com rebaixe de preço, exposição, cartazeamento, estoques) ', periodicity: 'SEMANAL' },
    { description: 'PREVENÇÃO: SEXTA 14:00h- Comercial - Lista de produtos com validade curta 7 dias (trabalhar com plano de ação, rebaixe de preço, exposição, cartazeamento, estoques)', periodicity: 'SEMANAL' },
    { 
      description: 'OPERAÇÃO: Balcão de frios', 
      periodicity: 'DIÁRIO',
      subItems: ['FATIADOS', 'QUEIJOS', 'MARGARINAS', 'EMBUTIDOS/MASSAS', 'GELADEIRAS/FREEZERS-SORVERTES'] 
    },
  ],
  'FLV': [
    { description: 'ABASTECIMENTO: Todas as bancas estão abastecidas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Todos os produtos possui etiquetas de preço?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias todos os produtos que são pesaveis foram pesados?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias durante a pesagem foi descontado a TARA das caixas?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias foi pesado fora das caixas de madeira ?', periodicity: 'DIÁRIO' },
    { description: 'RECEBIMENTO: No recebimento das mercadorias foi constatado qualidade ruim? ', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização das cameras frias', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza das bancas', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização da aréa de fracionamento dos produtos e seus utensilios', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do descarte', periodicity: 'DIÁRIO' },
    { description: 'VENDAS: Acompanhamento das vendas do setor, sendo do dia anterior versus a meta', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento das perdas do setor', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do balanço nas quintas-feiras e análise das divergências', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Sugestão das compras, observando períodos do mês, garantindo os produtos disponíveis e evitando perdas', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Terça e Quarta: Preparation para o dia da feira, providenciando cartazeamento "TERÇA E QUARTA VERDE"', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Sexta: Definir os itens que entrará na agenda de ofertas, olhando margem, preço atual e preço sugerido', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Foi realizado o envio da sugestão de ofertas para o Heitor?', periodicity: 'SEMANAL' },
  ],
  'Mercearia': [
    { description: 'ABASTECIMENTO: Itens que acabaram de chegar já estão na área de venda?', periodicity: 'DIÁRIO' },
    { description: 'PRECIFICAÇÃO: Verificação de todos os corredores da lista de alterados', periodicity: 'DIÁRIO' },
    { description: 'DIA: Lista dos itens que acabou de chegar (Verificar se já está na área de venda)', periodicity: 'DIÁRIO' },
    { description: 'PRECIFICAÇÃO: Todos os cartazes estão legíveis?', periodicity: 'DIÁRIO' },
    { description: 'PRECIFICAÇÃO: Na área de venda possui rupturas? ', periodicity: 'DIÁRIO' },
    { description: 'REPOSIÇÃO: Corredores and prateleiras limpos e organizados (paredão visual)', periodicity: 'DIÁRIO' },
    { description: 'VALIDADE: Pegar a lista dos produtos próximo e vencimento e suas quantidades, para traçar plano de ação sendo exposição e preço agressivo, buscando venda rápida', periodicity: 'DIÁRIO' },
    { description: 'GESTÃO: Distribuir tarefas entre repositores (foco em ofertas e tabloide)', periodicity: 'DIÁRIO' },
    { description: 'GESTÃO: Corredores desobstruídos, passagem livre para clientes. Gondolas abastecidas, pontos extras abastecidos. Precificação. Cartaz.', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Itens sem venda está na área de venda?', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Escalas de trabalho', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Acompanhar itens que mais vende e alinhar abastecimento, pontos extras', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Organizando junto aos respositores um uma BATIDA DE VALIDADE no seu setor, SENDO 2h por dia, para identificação de produtos vencidos ou próximo para fazer as devidas tratativas', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Analisar perdas (vencimento/avarias) - suporte do Cleber - SEMANAL', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Acompanhar as vendas do setor versus a meta, traçar planos de ação para buscar o atingimento', periodicity: 'SEMANAL' },
  ],
  'FLC (Frios e Laticínios)': [
    { description: 'OPERAÇÃO: Todas as geladeiras e área de venda estão abastecidas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: As geladeiras estão limpas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Todos os produtos possui etiquetas de preço?', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização das cameras frias?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do movimento dos retalhos dos queijos?', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Limpeza e organização da aréa de manipulação de fatiados e seus utensilios?', periodicity: 'DIÁRIO' },
    { description: 'VENDAS: Acompanhamento das vendas do setor, sendo do dia anterior versus a meta?', periodicity: 'DIÁRIO' },
    { description: 'VENDAS: Verificação da lista de ofertas?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento das perdas do setor?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Acompanhamento do balanço e análise das divergências?', periodicity: 'SEMANAL' },
    { description: 'OPERAÇÃO: Foi realizado a ronda de validade?', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Foi programado as escalas de trabalho da equipe?', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Quinta-feira - Entregar p/ Adriano lista dos produtos próximo do vencimento (proxima semana) e suas quantidades, para traçar plano de ação sendo exposição e preço agressivo, buscando venda rápida', periodicity: 'SEMANAL' },
  ],
  'Padaria-Confeitaria-Rotisseria': [
    { description: 'ABASTECIMENTO: Vitrines de doces, salgados e balcões de pães abastecidos e organizados?', periodicity: 'DIÁRIO' },
    { description: 'OPERAÇÃO: Todos os produtos fabricados possuem etiqueta de pesagem e validade interna correta?', periodicity: 'DIÁRIO' },
    { description: 'ROTISSERIA: Balcão térmico ligado e temperatura conferida para o início do serviço?', periodicity: 'DIÁRIO' },
    { description: 'LIMPEZA: Área de manipulação, formas, maquinários e utensílios limpos e higienizados?', periodicity: 'DIÁRIO' },
    { description: 'VALIDADE: Ronda diária de insumos e matérias-primas na câmara fria e estoque do setor?', periodicity: 'DIÁRIO' },
    { description: 'SEMANAL: Programação de produção para os itens de festival ou apostas do fim de semana?', periodicity: 'SEMANAL' },
    { description: 'GESTÃO: Escala de trabalho e folgas da equipe alinhadas?', periodicity: 'SEMANAL' },
  ]
};

// 🚀 INJEÇÃO AUTOMÁTICA DE TODAS AS TAREFAS NO AMBIENTE DE TESTE
TASK_DATA['TESTE_SISTEMA'] = [
  ...TASK_DATA['TESTE_SISTEMA'],
  ...TASK_DATA['Gerente'],
  ...TASK_DATA['SubGerente'],
  ...TASK_DATA['FLV'],
  ...TASK_DATA['Mercearia'],
  ...TASK_DATA['FLC (Frios e Laticínios)'],
  ...TASK_DATA['Padaria-Confeitaria-Rotisseria']
];

export default function Home({ isTesteRoute = false }: { isTesteRoute?: boolean }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const isTeste = isTesteRoute || pathname?.includes('/teste'); 

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [currentPeriodicity, setCurrentPeriodicity] = useState('DIÁRIO');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [senhasBanco, setSenhasBanco] = useState({});
  const [suppressHydration, setSuppressHydration] = useState(false);
  const [isLockedToday, setIsLockedToday] = useState(false);
  const [resolvingTask, setResolvingTask] = useState<any>(null);
  const [tratativaTexto, setTratativaTexto] = useState('');
  
  const [offlineCount, setOfflineCount] = useState(0);

  // 🚀 ESTADOS PARA O TOP 10 MAIORES VENDAS
  const [top10Padaria, setTop10Padaria] = useState<any[]>([]);
  const [top10Rotisseria, setTop10Rotisseria] = useState<any[]>([]);
  const [top10Confeitaria, setTop10Confeitaria] = useState<any[]>([]);
  const [isModalTop10Open, setIsModalTop10Open] = useState(false);
  const [activeTop10Category, setActiveTop10Category] = useState<'Padaria' | 'Rotisseria' | 'Confeitaria' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🚀 ESTADO PARA O BOTÃO SECRETO E HORÁRIO
  const [clickCount, setClickCount] = useState(0);
  const [foraDoHorario, setForaDoHorario] = useState(false);

  useEffect(() => { setSuppressHydration(true); }, []);

  // 🚀 CARREGAR TOP 10 DO LOCALSTORAGE
  useEffect(() => {
    if (department === 'Padaria-Confeitaria-Rotisseria' || department === 'TESTE_SISTEMA') {
      const savedPadaria = localStorage.getItem('top10_padaria');
      const savedRotisseria = localStorage.getItem('top10_rotisseria');
      const savedConfeitaria = localStorage.getItem('top10_confeitaria');
      if (savedPadaria) setTop10Padaria(JSON.parse(savedPadaria));
      if (savedRotisseria) setTop10Rotisseria(JSON.parse(savedRotisseria));
      if (savedConfeitaria) setTop10Confeitaria(JSON.parse(savedConfeitaria));
    }
  }, [department]);

  // 🚀 SALVAR TOP 10 NO LOCALSTORAGE
  const saveTop10Local = (category: string, data: any[]) => {
    if (category === 'Padaria') { setTop10Padaria(data); localStorage.setItem('top10_padaria', JSON.stringify(data)); }
    if (category === 'Rotisseria') { setTop10Rotisseria(data); localStorage.setItem('top10_rotisseria', JSON.stringify(data)); }
    if (category === 'Confeitaria') { setTop10Confeitaria(data); localStorage.setItem('top10_confeitaria', JSON.stringify(data)); }
  };

  // 🚀 LÓGICA DE FOTOS NO TOP 10
  const handleTop10Photo = async (e: any, category: string, id: string) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const updatePhoto = (photoBase64: string) => {
        const updateList = (list: any[]) => list.map(item => item.id === id ? { ...item, photo: photoBase64 } : item);
        if (category === 'Padaria') saveTop10Local(category, updateList(top10Padaria));
        if (category === 'Rotisseria') saveTop10Local(category, updateList(top10Rotisseria));
        if (category === 'Confeitaria') saveTop10Local(category, updateList(top10Confeitaria));
    };

    try {
        const imageCompression = (await import('browser-image-compression')).default;
        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1024, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => updatePhoto(reader.result as string);
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        const reader = new FileReader();
        reader.onloadend = () => updatePhoto(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  // 🚀 LÓGICA DE CAIXAS CLICÁVEIS DE HORÁRIOS (S/N) NO TOP 10
  const handleTop10Status = (category: string, id: string, time: string, status: string) => {
    const updateList = (list: any[]) => list.map(item => {
        if (item.id === id) {
            const newStatuses = { ...(item.statuses || {}) };
            newStatuses[time] = newStatuses[time] === status ? null : status; 
            return { ...item, statuses: newStatuses };
        }
        return item;
    });

    if (category === 'Padaria') saveTop10Local(category, updateList(top10Padaria));
    if (category === 'Rotisseria') saveTop10Local(category, updateList(top10Rotisseria));
    if (category === 'Confeitaria') saveTop10Local(category, updateList(top10Confeitaria));
  };

  const handleAddTop10 = (item: any) => {
    let currentList: any[] = [];
    if (activeTop10Category === 'Padaria') currentList = [...top10Padaria];
    if (activeTop10Category === 'Rotisseria') currentList = [...top10Rotisseria];
    if (activeTop10Category === 'Confeitaria') currentList = [...top10Confeitaria];

    if (currentList.length >= 10) {
      return alert("LIMITE ATINGIDO! Você só pode selecionar 10 itens para a Curva A.");
    }
    if (currentList.find(i => i.id === item.id)) {
      return alert("ESTE ITEM JÁ ESTÁ NA LISTA!");
    }
    
    // --- ATUALIZADO: DEFINIÇÃO DE HORÁRIOS APENAS PARA 10h e 15h ---
    const newItem = {
      ...item,
      statuses: { '10:00': null, '15:00': null },
      photo: null
    };
    currentList.push(newItem);
    saveTop10Local(activeTop10Category!, currentList);
  };

  const handleRemoveTop10 = (category: string, id: string) => {
    if (category === 'Padaria') saveTop10Local(category, top10Padaria.filter(i => i.id !== id));
    if (category === 'Rotisseria') saveTop10Local(category, top10Rotisseria.filter(i => i.id !== id));
    if (category === 'Confeitaria', top10Confeitaria.filter(i => i.id !== id));
  };

  const getFilteredProducts = () => {
    let list: any[] = [];
    if (activeTop10Category === 'Padaria') list = PRODUTOS_PADARIA;
    if (activeTop10Category === 'Rotisseria') list = PRODUTOS_ROTISSERIA;
    if (activeTop10Category === 'Confeitaria') list = PRODUTOS_CONFEITARIA;
    
    if (!searchTerm) return list;
    return list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const resetarAppDeTeste = () => {
    const confirm = window.confirm("🧹 Deseja apagar todas as tarefas preenchidas e resetar o aplicativo de teste?");
    if (confirm) {
      localStorage.clear();
      sessionStorage.clear();
      const request = indexedDB.deleteDatabase('VivianAuditoriaDB');
      request.onsuccess = () => { window.location.href = window.location.pathname + '?reset=' + new Date().getTime(); };
      request.onerror = () => { window.location.href = window.location.pathname + '?reset=' + new Date().getTime(); };
    }
  };

  useEffect(() => {
    const verificarHorario = () => {
      if (!department) return;
      const horaAtual = new Date().getHours();
      if (department === 'SubGerente') {
        setForaDoHorario(horaAtual < 11 || horaAtual >= 21);
      } else if (['Gerente', 'FLV', 'Mercearia', 'FLC (Frios e Laticínios)', 'Padaria-Confeitaria-Rotisseria'].includes(department)) {
        setForaDoHorario(horaAtual < 7 || horaAtual >= 18);
      } else {
        setForaDoHorario(false);
      }
    };
    verificarHorario();
    const intervalo = setInterval(verificarHorario, 60000); 
    return () => clearInterval(intervalo);
  }, [department]);

  useEffect(() => {
    const verificarViradaDeDia = () => {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const dataSalva = localStorage.getItem('dataUltimoChecklist');
      if (dataSalva !== dataAtual) {
        localStorage.clear();
        sessionStorage.clear();
        const request = indexedDB.deleteDatabase('VivianAuditoriaDB');
        request.onsuccess = () => { localStorage.setItem('dataUltimoChecklist', dataAtual); window.location.reload(); };
        request.onerror = () => { localStorage.setItem('dataUltimoChecklist', dataAtual); window.location.reload(); };
      }
    };
    verificarViradaDeDia();
  }, []);

  const handleSecretReset = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      const confirm = window.confirm("🕵️‍♂️ MODO DESENVOLVEDOR: Deseja forçar a atualização do aplicativo?\n\nFIQUE TRANQUILO(A): Suas fotos e textos já preenchidos NÃO serão perdidos. Eles estão seguros no cofre do celular e voltarão para a tela sozinhos!");
      if (confirm) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach(reg => reg.unregister());
            window.location.href = window.location.pathname + '?v=' + new Date().getTime();
          });
        } else {
          window.location.href = window.location.pathname + '?v=' + new Date().getTime();
        }
      }
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let reg of registrations) {
            reg.update(); 
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    reg.unregister().then(() => { window.location.reload(); });
                  }
                };
              }
            };
          }
        });
      };
      checkForUpdates();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdates();
      });
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (isAuthenticated && !isLockedToday) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, isLockedToday]);

  useEffect(() => {
    const authStatus = localStorage.getItem('user_auth');
    if (authStatus) {
      if (authStatus === 'teste_sistema') {
        setDepartment('TESTE_SISTEMA');
        setIsAuthenticated(true);
      } else {
        const savedDept = authStatus.charAt(0).toUpperCase() + authStatus.slice(1);
        const match = SETORES_LISTA.find(s => s.toLowerCase() === authStatus.toLowerCase());
        if (match || authStatus === 'gerente') {
          setDepartment(match || 'Gerente');
          setIsAuthenticated(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = async () => {
      try {
        // @ts-ignore
        const client = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        setSupabase(client);
        let { data } = await client.from('credenciais').select('setor, senha');
        if (data) {
          const creds: any = { 'TESTE_SISTEMA': 'teste123' };
          data.forEach((item: any) => { creds[item.setor] = item.senha; });
          setSenhasBanco(creds);
        }
      } catch (err) { console.error("Erro conexão."); }
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (isAuthenticated && department) {
      const today = new Date().toLocaleDateString();
      const lastSubmitDate = localStorage.getItem(`last_submit_date_${department}`);
      setIsLockedToday(lastSubmitDate === today);
      
      const loadTasks = async () => {
        try {
          const offlineData: any = await loadFromIndexedDB(`offline_sync_${department}`);
          if (offlineData && offlineData.length > 0) setOfflineCount(offlineData.length);

          const saved: any = await loadFromIndexedDB(`chk_vVivian_v9_${department}`);
          const allSectorTasks = TASK_DATA[department] || [];

          if (saved) { 
            const updatedSaved = saved.map((s: any) => {
               const model = allSectorTasks.find((t:any) => t.description === s.description);
               if (model?.subItems) {
                  const subs: any = s.subStatuses || {};
                  model.subItems.forEach((item: string) => {
                     if (!subs[item]) subs[item] = 'Aguardando';
                  });
                  return { ...s, subStatuses: subs };
               }
               return s;
            });
            setTasks(updatedSaved); 
          } else {
            setTasks(allSectorTasks.map((t: any) => {
              let initialSubStatuses: Record<string, string> | null = null;
              if (t.subItems) {
                initialSubStatuses = {};
                t.subItems.forEach((item: string) => (initialSubStatuses as Record<string, string>)[item] = 'Aguardando');
              }
              return { 
                ...t, 
                status: 'Aguardando', 
                observation: '', 
                photos: [], 
                frozen: false,
                subStatuses: initialSubStatuses,
                created_at: new Date().toISOString() 
              };
            }));
          }
        } catch (e) { console.error("Erro ao carregar do IndexedDB", e); }
      };
      loadTasks();
    }
  }, [isAuthenticated, department]);

  useEffect(() => {
    async function puxarPendenciasReais() {
      if (!supabase || !department || currentPeriodicity !== 'PENDÊNCIAS') return;
      const { data } = await supabase.from('respostas').select('*').eq('setor', department).eq('status', 'Não Conforme');
      if (data) {
        const pendenciasFormatadas = data.map((p: any) => ({
          description: p.tarefa,
          status: 'Não Conforme',
          observation: p.observacao,
          photos: p.foto_url ? String(p.foto_url).split(',').filter((link: string) => link.trim().length > 10) : [],
          created_at: p.created_at,
          frozen: false,
          periodicity: 'PENDÊNCIAS'
        }));
        setTasks(prev => {
          const tarefasAtuais = prev.filter(t => t.periodicity !== 'PENDÊNCIAS');
          return [...tarefasAtuais, ...pendenciasFormatadas];
        });
      }
    }
    puxarPendenciasReais();
  }, [currentPeriodicity, department, supabase]);

  const calcularSLA = (dataIso: string) => {
    const dataCriacao = new Date(dataIso);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - dataCriacao.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const saveState = async (newTasks: any[]) => {
    setTasks(newTasks);
    try { await saveToIndexedDB(`chk_vVivian_v9_${department}`, newTasks);
    } catch (e) { console.error("Erro ao salvar no IndexedDB", e); }
  };

  const finalizarResolucao = async () => {
    if (!supabase || !tratativaTexto || tratativaTexto.trim().length < 10) return alert("DESCREVA A TRATATIVA REALIZADA COM MAIS DETALHES!");
    setLoading(true);
    try {
      const { error } = await supabase.from('respostas').update({ status: 'Conforme', observacao_resolucao: tratativaTexto, resolvido_em: new Date().toISOString() }).eq('setor', department).eq('tarefa', resolvingTask.description).eq('status', 'Não Conforme').eq('created_at', resolvingTask.created_at);
      if (!error) {
        const realIdx = tasks.findIndex(t => t.description === resolvingTask.description && t.created_at === resolvingTask.created_at);
        const newTasks = [...tasks];
        if(realIdx !== -1) { newTasks[realIdx].status = 'Conforme'; newTasks[realIdx].frozen = true; saveState(newTasks); }
        alert("PENDÊNCIA RESOLVIDA COM SUCESSO!");
        setResolvingTask(null);
        setTratativaTexto('');
      } else { throw error; }
    } catch (err) { alert("ERRO AO ATUALIZAR BANCO."); } finally { setLoading(false); }
  };

  const handleSubStatusChange = (idx: number, subItem: string, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    newTasks[realIdx].subStatuses[subItem] = newTasks[realIdx].subStatuses[subItem] === clickedStatus ? 'Aguardando' : clickedStatus;
    const statuses = Object.values(newTasks[realIdx].subStatuses);
    if (statuses.includes('Não Conforme')) { newTasks[realIdx].status = 'Não Conforme';
    } else if (statuses.includes('Aguardando')) { newTasks[realIdx].status = 'Aguardando'; } else { newTasks[realIdx].status = 'Conforme'; }
    newTasks.forEach((task, tIdx) => {
      if (tIdx !== realIdx && !task.frozen && task.status !== 'Aguardando') {
        const canAutoFreeze = task.status === 'Conforme' || (task.status === 'Não Conforme' && task.observation?.trim().length >= 15 && task.photos?.length > 0);
        if (canAutoFreeze && !task.subStatuses) newTasks[tIdx].frozen = true;
      }
    });
    saveState(newTasks);
  };

  const handleStatusChange = (idx: number, clickedStatus: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    newTasks.forEach((task, tIdx) => {
      if (tIdx !== realIdx && !task.frozen && task.status !== 'Aguardando') {
        const canAutoFreeze = task.status === 'Conforme' || (task.status === 'Não Conforme' && task.observation?.trim().length >= 15 && task.photos?.length > 0);
        if (canAutoFreeze && !task.subStatuses) newTasks[tIdx].frozen = true;
      }
    });
    newTasks[realIdx].status = newTasks[realIdx].status === clickedStatus ? 'Aguardando' : clickedStatus;
    saveState(newTasks);
  };

  const updateTaskData = (idx: number, field: string, value: string) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    newTasks[realIdx][field] = value;
    saveState(newTasks);
  };

  const handleAddPhoto = (idx: number, photoBase64: any) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    if (!newTasks[realIdx].photos) newTasks[realIdx].photos = [];
    newTasks[realIdx].photos.push(photoBase64);
    saveState(newTasks);
  };

  const handleRemovePhoto = (taskIdx: number, photoIdx: number) => {
    const realIdx = tasks.indexOf(filteredTasks[taskIdx]);
    if (realIdx === -1 || tasks[realIdx].frozen || isLockedToday) return;
    const newTasks = [...tasks];
    newTasks[realIdx].photos.splice(photoIdx, 1);
    saveState(newTasks);
  };

  const freezeTask = (idx: number) => {
    const realIdx = tasks.indexOf(filteredTasks[idx]);
    if (realIdx === -1) return;
    const task = tasks[realIdx];
    
    if (task.subStatuses && Object.values(task.subStatuses).includes('Aguardando')) return alert("AVALIE TODOS OS BALCÕES ANTES DE FINALIZAR ESTA TAREFA!");
    if (task.status === 'Aguardando') return alert("SELECIONE O STATUS ANTES!");

    if (task.status === 'Não Conforme') {
        if (!task.photos || task.photos.length === 0) return alert("NÃO CONFORME EXIGE PELO MENOS UMA FOTO!");
        if (!task.observation || task.observation.trim().length < 15) return alert("A RÉPLICA PARA O RH ESTÁ MUITO CURTA! Detalhe melhor o problema (Mínimo 15 caracteres).");
    } 

    const newTasks = [...tasks];
    newTasks[realIdx].frozen = true;
    saveState(newTasks);
  };

  const syncOfflineData = async () => {
    if (!navigator.onLine) return alert("📵 Você ainda está sem internet! Tente novamente quando houver sinal.");
    
    if (isTeste) {
      await removeFromIndexedDB(`offline_sync_${department}`);
      setOfflineCount(0);
      return alert("🚀 TUDO SINCRONIZADO COM SUCESSO (AMBIENTE DE TESTE)!");
    }

    if (!supabase) return;
    setLoading(true);
    try {
      const offlineData: any = await loadFromIndexedDB(`offline_sync_${department}`) || [];
      for (const audit of offlineData) {
        const payloads = await Promise.all(audit.tasks.map(async (t: any) => {
          let linksDasFotos = [];
          if (t.photos && t.photos.length > 0) {
            for (let i = 0; i < t.photos.length; i++) {
              try {
                const res = await fetch(t.photos[i]);
                const blob = await res.blob();
                const fileName = `${department.replace(/\s/g, '')}_${Date.now()}_${i}.jpg`;
                const { data, error } = await supabase.storage.from('checklist-fotos').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
                if (data && !error) {
                  const { data: pub } = supabase.storage.from('checklist-fotos').getPublicUrl(fileName);
                  if (pub?.publicUrl) linksDasFotos.push(pub.publicUrl);
                }
              } catch (imgErr) { console.error("Falha ao subir foto offline."); }
            }
          }
          const fotoUrlFinal = linksDasFotos.filter(Boolean).join(',');
          let finalObservation = t.observation || '';
          if (t.subStatuses && t.status === 'Não Conforme') {
             const subDetails = Object.entries(t.subStatuses).map(([key, val]) => `${key}: ${val === 'Conforme' ? 'OK' : 'NC'}`).join(' | ');
             finalObservation = `[${subDetails}] - ${t.observation}`;
          }
          return { setor: department, tarefa: t.description, status: t.status, observacao: finalObservation, foto_url: fotoUrlFinal, created_at: t.created_at };
        }));
        // @ts-ignore
        await supabase.from('respostas').insert(payloads);
      }
      await removeFromIndexedDB(`offline_sync_${department}`);
      setOfflineCount(0);
      alert("🚀 TUDO SINCRONIZADO COM SUCESSO!");
    } catch (e) { alert("ERRO AO SINCRONIZAR FILA. TENTE NOVAMENTE."); } finally { setLoading(false); }
  };

  const submitChecklist = async () => {
    if (foraDoHorario) return alert("FORA DO HORÁRIO PERMITIDO PARA O SEU SETOR!");
    if (isLockedToday) return;

    if (currentPeriodicity === 'TOP 10') {
      const todosTop10 = [...top10Padaria, ...top10Rotisseria, ...top10Confeitaria];
      if (todosTop10.length === 0) return alert("Adicione produtos ao TOP 10 antes de salvar!");
      
      const faltamFotos = todosTop10.filter(item => !item.photo);
      if (faltamFotos.length > 0) {
          return alert(`⚠️ AÇÃO BLOQUEADA: Faltam fotos em ${faltamFotos.length} produto(s) do TOP 10! É obrigatório anexar foto para todos os itens da Curva A.`);
      }

      const faltamStatus = todosTop10.filter(item => {
        if (!item.statuses) return true;
        const marcacoes = Object.values(item.statuses); 
        return marcacoes.every(val => val === null); 
      });

      if (faltamStatus.length > 0) {
        return alert(`⚠️ AÇÃO BLOQUEADA: Você esqueceu de marcar o status (Sim ou Não) em ${faltamStatus.length} produto(s) do TOP 10! Você precisa marcar pelo menos um horário antes de finalizar.`);
      }

      if (isTeste) {
        return alert("✅ ACOMPANHAMENTO DO TOP 10 SALVO COM SUCESSO NO AMBIENTE DE TESTE!");
      }
      
      setLoading(true);
      try {
        const payloads = await Promise.all(todosTop10.map(async (t) => {
          let fotoUrlFinal = '';
          if (t.photo) {
            try {
              const res = await fetch(t.photo);
              const blob = await res.blob();
              const fileName = `TOP10_${department.replace(/\s/g, '')}_${t.id}_${Date.now()}.jpg`;
              const { data, error } = await supabase.storage.from('checklist-fotos').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
              if (data && !error) {
                const { data: pub } = supabase.storage.from('checklist-fotos').getPublicUrl(fileName);
                if (pub?.publicUrl) fotoUrlFinal = pub.publicUrl;
              }
            } catch (err) { console.error("Falha ao subir foto do TOP 10", err); }
          }
          const statusText = t.statuses ? Object.entries(t.statuses).map(([time, val]) => `${time} (${val || 'Sem Registo'})`).join(' | ') : '';
          return { setor: department, tarefa: `TOP 10: ${t.name}`, status: 'Conforme', observacao: `Acompanhamento: ${statusText}`, foto_url: fotoUrlFinal, created_at: new Date().toISOString() };
        }));

        const { error } = await supabase.from('respostas').insert(payloads);
        if (error) throw error;
        alert("✅ ACOMPANHAMENTO DO TOP 10 SALVO COM SUCESSO NO SERVIDOR!");
      } catch (error) {
        alert("❌ ERRO AO SALVAR TOP 10 NO SERVIDOR.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const currentPeriodTasks = tasks.filter(t => t.periodicity === currentPeriodicity);
    const unfrozenTasks = currentPeriodTasks.filter(t => !t.frozen);
    if (unfrozenTasks.length > 0) return alert(`FALTAM ${unfrozenTasks.length} TAREFAS PARA FINALIZAR NESTA AUDITORIA!`);

    if (isTeste) {
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`last_submit_date_${department}`, today);
      setIsLockedToday(true);
      const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
      setTasks(resetTasks);
      return alert("SINCRONIZADO COM SUCESSO (AMBIENTE DE TESTE)! BLOQUEADO ATÉ AMANHÃ.");
    }

    if (!navigator.onLine) {
      const isConfirmed = window.confirm("📵 Você está sem internet! Deseja salvar a auditoria na Fila Offline para sincronizar depois?");
      if (!isConfirmed) return;
      setLoading(true);
      try {
         const offlineData: any = await loadFromIndexedDB(`offline_sync_${department}`) || [];
         offlineData.push({ date: new Date().toISOString(), tasks: currentPeriodTasks });
         await saveToIndexedDB(`offline_sync_${department}`, offlineData);
         const today = new Date().toLocaleDateString();
         localStorage.setItem(`last_submit_date_${department}`, today);
         setIsLockedToday(true);
         setOfflineCount(offlineData.length);
         const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
         setTasks(resetTasks);
         await removeFromIndexedDB(`chk_vVivian_v9_${department}`);
         alert("💾 SALVO NO MODO OFFLINE!");
      } catch (e) { alert("ERRO AO SALVAR OFFLINE."); } finally { setLoading(false); }
      return;
    }

    setLoading(true);
    try {
      const payloads = await Promise.all(currentPeriodTasks.map(async (t) => {
        let linksDasFotos = [];
        if (t.photos && t.photos.length > 0) {
          for (let i = 0; i < t.photos.length; i++) {
            try {
              const res = await fetch(t.photos[i]);
              const blob = await res.blob();
              const fileName = `${department.replace(/\s/g, '')}_${Date.now()}_${i}.jpg`;
              const { data, error } = await supabase.storage.from('checklist-fotos').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
              if (data && !error) {
                const { data: pub } = supabase.storage.from('checklist-fotos').getPublicUrl(fileName);
                if (pub?.publicUrl) linksDasFotos.push(pub.publicUrl);
              }
            } catch (imgErr) { console.error("Falha foto."); }
          }
        }
        const fotoUrlFinal = linksDasFotos.filter(Boolean).join(',');
        let finalObservation = t.observation || '';
        if (t.subStatuses && t.status === 'Não Conforme') {
           const subDetails = Object.entries(t.subStatuses).map(([key, val]) => `${key}: ${val === 'Conforme' ? 'OK' : 'NC'}`).join(' | ');
           finalObservation = `[${subDetails}] - ${t.observation}`;
        }
        return { setor: department, tarefa: t.description, status: t.status, observacao: finalObservation, foto_url: fotoUrlFinal, created_at: t.created_at };
      }));

      await supabase.from('respostas').insert(payloads);
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`last_submit_date_${department}`, today);
      setIsLockedToday(true);
      alert("SINCRONIZADO COM SUCESSO! BLOQUEADO ATÉ AMANHÃ.");
      const resetTasks = tasks.map(t => t.periodicity === currentPeriodicity ? { ...t, status: 'Aguardando', observation: '', photos: [], frozen: false, subStatuses: t.subItems ? t.subItems.reduce((acc:any, i:string)=>({...acc, [i]: 'Aguardando'}), {}) : null } : t);
      setTasks(resetTasks);
      await removeFromIndexedDB(`chk_vVivian_v9_${department}`);
    } catch (err) { alert("ERRO DE CONEXÃO!"); } finally { setLoading(false); }
  };

  const filteredTasks = tasks.filter(t => currentPeriodicity === 'PENDÊNCIAS' ? t.status === 'Não Conforme' : t.periodicity === currentPeriodicity);
  const totalNCPendentes = tasks.filter(t => t.status === 'Não Conforme').length;

  const handleLogin = () => {
    // @ts-ignore
    const senhaCorreta = senhasBanco[department];
    if ((senhaCorreta && senhaCorreta === password) || (department === 'Padaria-Confeitaria-Rotisseria' && password === 'pcr123')) {
      localStorage.setItem('user_auth', department.toLowerCase());
      setIsAuthenticated(true);
      window.location.reload(); 
    } else { 
      alert('SENHA INCORRETA!'); 
    }
  };

  if (!suppressHydration) return null;

  if (!isAuthenticated) {
    if (isTeste) {
       return (
        <div className="min-h-screen bg-amber-500 flex items-center justify-center p-4 italic font-black text-slate-900 uppercase text-center">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-slate-900 text-slate-900">
            <div className="mb-10 flex flex-col items-center text-slate-900 font-black italic">
               <div className="h-24 mb-6 cursor-pointer" onClick={handleSecretReset}>
                 <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-slate-900 font-black italic" />
               </div>
               <h1 className="text-4xl tracking-tighter italic uppercase text-slate-900 font-black italic">MODO TESTE 🛠️</h1>
            </div>
            <div className="space-y-6 text-slate-900 font-black italic">
              <button onClick={() => setDepartment('TESTE_SISTEMA')} className={`w-full p-5 border-2 rounded-2xl font-bold uppercase text-xs transition-all ${department === 'TESTE_SISTEMA' ? 'bg-amber-500 text-black border-amber-500 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-100'}`}>
                {department === 'TESTE_SISTEMA' ? '✅ SETOR DE TESTE ATIVADO' : '👉 CLIQUE AQUI PARA ATIVAR O TESTE'}
              </button>
              <input type="password" placeholder="SENHA: teste123" className="w-full p-6 bg-slate-50 border-2 border-amber-500 rounded-2xl text-center text-2xl outline-none font-black text-slate-900 shadow-inner uppercase italic" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button onClick={handleLogin} className="w-full bg-black text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 text-xl italic uppercase font-black italic">ENTRAR NO TESTE</button>
              <button onClick={resetarAppDeTeste} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 text-sm italic uppercase mt-4">🧹 ZERAR DADOS DO APP</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 italic font-black text-slate-900 uppercase text-center">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-t-8 border-indigo-600 text-slate-900">
          <div className="mb-10 flex flex-col items-center text-slate-900 font-black italic">
             <div className="h-24 mb-6 cursor-pointer" onClick={handleSecretReset}>
                <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-slate-900 font-black italic" />
            </div>
             <h1 className="text-4xl tracking-tighter italic uppercase text-slate-900 font-black italic">ACESSO VIVIAN</h1>
          </div>
          <div className="space-y-6 text-slate-900 font-black italic">
            <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase text-slate-900 font-black italic" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">SELECIONE O SETOR</option>
              {SETORES_LISTA.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <input type="password" placeholder="SENHA" className="w-full p-6 bg-slate-50 border-2 border-indigo-500 rounded-2xl text-center text-2xl outline-none font-black text-slate-900 shadow-inner uppercase italic font-black italic" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-black text-white font-black py-6 rounded-2xl shadow-xl active:scale-95 text-xl italic uppercase font-black italic">ENTRAR</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-8 font-sans font-black italic text-slate-900 uppercase">
      <div className="max-w-5xl mx-auto shadow-2xl rounded-[3.5rem] overflow-hidden bg-white min-h-[90vh] flex flex-col border border-slate-200">
        <header className="bg-slate-900 p-6 md:p-8 text-white border-b border-slate-800 font-black italic">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 text-white font-black italic">
            <div className="flex items-center gap-4 h-12 text-white font-black italic">
              <div className="h-full cursor-pointer" onClick={handleSecretReset}>
                <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain text-white font-black italic" />
              </div>
              <div className="text-left leading-none border-l-2 border-indigo-500 pl-3 text-white font-black italic">
                <h1 className="text-xl tracking-tighter font-black italic text-white font-black italic">{department}</h1>
                <p className={`text-[8px] tracking-widest mt-1 font-black italic uppercase text-white font-black italic ${isTeste ? 'text-amber-400' : 'text-indigo-400'}`}>
                  {isTeste ? 'AMBIENTE DE TESTE' : 'SISTEMA VIVIAN'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 text-white font-black italic">
              {totalNCPendentes > 0 && (
                <div className="bg-amber-500 text-black px-4 py-1 rounded-lg animate-pulse flex flex-col items-center border-2 border-black font-black italic">
                  <p className="text-[7px] font-black italic">N.C. PENDENTES</p>
                  <p className="text-sm leading-none font-black italic">{totalNCPendentes}</p>
                </div>
              )}
              {isTeste && (
                 <button onClick={resetarAppDeTeste} className="bg-red-600 px-4 py-2 rounded-xl text-[9px] text-white transition-all font-black uppercase shadow-lg active:scale-95">🧹 Resetar Teste</button>
              )}
              {(department === 'Gerente' || department === 'TESTE_SISTEMA') && (
                <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] border border-indigo-500 font-black uppercase italic transition-all shadow-lg active:scale-95 font-black italic">📊 DASHBOARD</button>
              )}
              <button onClick={() => { localStorage.removeItem('user_auth'); window.location.href = isTeste ? '/teste' : '/'; }} className="bg-slate-800 px-5 py-2 rounded-xl text-[10px] text-slate-400 hover:text-white transition-all font-black italic uppercase border border-slate-700 text-slate-300 font-black italic">Sair</button>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-800 p-2 rounded-2xl max-w-md mx-auto shadow-inner overflow-x-auto no-scrollbar font-black italic text-white font-black italic">
            {['DIÁRIO', 'SEMANAL', 'MENSAL', 'PENDÊNCIAS', ...(department === 'Padaria-Confeitaria-Rotisseria' || department === 'TESTE_SISTEMA' ? ['TOP 10'] : [])].map(p => (
              <button key={p} onClick={() => setCurrentPeriodicity(p)} className={`flex-1 min-w-[80px] py-3 text-[10px] rounded-xl transition-all font-black italic ${currentPeriodicity === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </header>

        {offlineCount > 0 && (
          <div className="bg-amber-500 mx-6 mt-6 p-4 rounded-2xl flex justify-between items-center shadow-lg border-2 border-amber-600 font-black italic animate-in slide-in-from-top-4">
            <p className="text-black text-[10px] uppercase leading-tight">⚠️ SINAL DE INTERNET PERDIDO: <br/> <span className="text-sm">{offlineCount} AUDITORIA(S) NA FILA</span></p>
            <button onClick={syncOfflineData} disabled={loading} className="bg-black text-white px-5 py-3 rounded-xl text-[10px] uppercase shadow-md active:scale-95 transition-all font-black">SINCRONIZAR AGORA</button>
          </div>
        )}

        <main className="p-6 space-y-6 flex-1 bg-white overflow-y-auto font-black italic">
          
          {foraDoHorario && currentPeriodicity !== 'PENDÊNCIAS' ? (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-6xl mb-4 font-black italic">⏰</div>
               <h2 className="text-2xl italic uppercase font-black text-slate-900 font-black italic">FORA DO HORÁRIO</h2>
               <p className="text-slate-400 text-sm mt-2 font-bold uppercase italic font-black italic">SEU SETOR RESPONDE DAS {department === 'SubGerente' ? '11H ÀS 21H' : '07H ÀS 18H'}.</p>
            </div>
          ) : currentPeriodicity === 'TOP 10' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="text-center mb-6">
                 <h2 className="text-3xl text-indigo-700 font-black uppercase italic">🏆 TOP 10 VENDAS</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase italic mt-2">Construa a "Curva A" para monitoramento e produção</p>
               </div>

               {/* PADARIA */}
               <div className="bg-amber-50 rounded-[2rem] border-2 border-amber-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                 <div className="flex justify-between items-center mb-4 pl-4">
                   <h3 className="text-xl text-amber-800 font-black uppercase italic">🍞 PADARIA <span className="text-xs text-amber-500 bg-amber-100 px-2 py-1 rounded-lg ml-2">{top10Padaria.length}/10</span></h3>
                   <button onClick={() => { setActiveTop10Category('Padaria'); setIsModalTop10Open(true); }} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-md active:scale-95">＋ ADICIONAR ITEM</button>
                 </div>
                 <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {top10Padaria.map((item, i) => (
                     <div key={item.id} className="bg-white border border-amber-100 p-3 rounded-xl flex flex-col shadow-sm gap-2">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] text-slate-700 uppercase font-bold italic leading-tight pr-2">
                           <span className="text-amber-500 font-black mr-1">{i+1}.</span> {item.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <label className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer shadow-sm transition-all ${item.photo ? 'bg-green-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-400 hover:bg-slate-200'}`}>
                             <span className="text-sm">📸</span>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleTop10Photo(e, 'Padaria', item.id)} />
                           </label>
                           <button onClick={() => handleRemoveTop10('Padaria', item.id)} className="text-red-500 bg-red-50 w-8 h-8 rounded-lg font-black hover:bg-red-100 transition-all">X</button>
                         </div>
                       </div>
                       
                       {item.photo && (
                         <div className="w-full flex justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                           <img src={item.photo} alt="Foto" className="h-20 object-contain rounded-md" />
                         </div>
                       )}
                       <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                         {['10:00', '15:00'].map(time => (
                           <div key={time} className="flex flex-col items-center">
                             <span className="text-[8px] font-black text-slate-500 mb-1">{time}</span>
                             <div className="flex gap-1">
                               <button onClick={() => handleTop10Status('Padaria', item.id, time, 'S')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'S' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>S</button>
                               <button onClick={() => handleTop10Status('Padaria', item.id, time, 'N')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'N' ? 'bg-red-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>N</button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                   {top10Padaria.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item selecionado.</p>}
                 </div>
               </div>

               {/* ROTISSERIA */}
               <div className="bg-red-50 rounded-[2rem] border-2 border-red-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                 <div className="flex justify-between items-center mb-4 pl-4">
                   <h3 className="text-xl text-red-800 font-black uppercase italic">🍗 ROTISSERIA <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-lg ml-2">{top10Rotisseria.length}/10</span></h3>
                   <button onClick={() => { setActiveTop10Category('Rotisseria'); setIsModalTop10Open(true); }} className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-md active:scale-95">＋ ADICIONAR ITEM</button>
                 </div>
                 <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {top10Rotisseria.map((item, i) => (
                     <div key={item.id} className="bg-white border border-red-100 p-3 rounded-xl flex flex-col shadow-sm gap-2">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] text-slate-700 uppercase font-bold italic leading-tight pr-2">
                           <span className="text-red-500 font-black mr-1">{i+1}.</span> {item.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <label className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer shadow-sm transition-all ${item.photo ? 'bg-green-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-400 hover:bg-slate-200'}`}>
                             <span className="text-sm">📸</span>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleTop10Photo(e, 'Rotisseria', item.id)} />
                           </label>
                           <button onClick={() => handleRemoveTop10('Rotisseria', item.id)} className="text-red-500 bg-red-50 w-8 h-8 rounded-lg font-black hover:bg-red-100 transition-all">X</button>
                         </div>
                       </div>
                       
                       {item.photo && (
                         <div className="w-full flex justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                           <img src={item.photo} alt="Foto" className="h-20 object-contain rounded-md" />
                         </div>
                       )}
                       <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                         {['10:00', '15:00'].map(time => (
                           <div key={time} className="flex flex-col items-center">
                             <span className="text-[8px] font-black text-slate-500 mb-1">{time}</span>
                             <div className="flex gap-1">
                               <button onClick={() => handleTop10Status('Rotisseria', item.id, time, 'S')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'S' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>S</button>
                               <button onClick={() => handleTop10Status('Rotisseria', item.id, time, 'N')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'N' ? 'bg-red-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>N</button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                   {top10Rotisseria.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item selecionado.</p>}
                 </div>
               </div>

               {/* CONFEITARIA */}
               <div className="bg-pink-50 rounded-[2rem] border-2 border-pink-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-pink-500"></div>
                 <div className="flex justify-between items-center mb-4 pl-4">
                   <h3 className="text-xl text-pink-800 font-black uppercase italic">🍰 CONFEITARIA <span className="text-xs text-pink-500 bg-pink-100 px-2 py-1 rounded-lg ml-2">{top10Confeitaria.length}/10</span></h3>
                   <button onClick={() => { setActiveTop10Category('Confeitaria'); setIsModalTop10Open(true); }} className="bg-pink-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-md active:scale-95">＋ ADICIONAR ITEM</button>
                 </div>
                 <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {top10Confeitaria.map((item, i) => (
                     <div key={item.id} className="bg-white border border-pink-100 p-3 rounded-xl flex flex-col shadow-sm gap-2">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] text-slate-700 uppercase font-bold italic leading-tight pr-2">
                           <span className="text-pink-500 font-black mr-1">{i+1}.</span> {item.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <label className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer shadow-sm transition-all ${item.photo ? 'bg-green-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-400 hover:bg-slate-200'}`}>
                             <span className="text-sm">📸</span>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleTop10Photo(e, 'Confeitaria', item.id)} />
                           </label>
                           <button onClick={() => handleRemoveTop10('Confeitaria', item.id)} className="text-red-500 bg-red-50 w-8 h-8 rounded-lg font-black hover:bg-red-100 transition-all">X</button>
                         </div>
                       </div>
                       
                       {item.photo && (
                         <div className="w-full flex justify-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                           <img src={item.photo} alt="Foto" className="h-20 object-contain rounded-md" />
                         </div>
                       )}
                       <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                         {['10:00', '15:00'].map(time => (
                           <div key={time} className="flex flex-col items-center">
                             <span className="text-[8px] font-black text-slate-500 mb-1">{time}</span>
                             <div className="flex gap-1">
                               <button onClick={() => handleTop10Status('Confeitaria', item.id, time, 'S')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'S' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>S</button>
                               <button onClick={() => handleTop10Status('Confeitaria', item.id, time, 'N')} className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all ${item.statuses?.[time] === 'N' ? 'bg-red-500 text-white shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'}`}>N</button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                   {top10Confeitaria.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item selecionado.</p>}
                 </div>
               </div>
            </div>
          ) : isLockedToday && currentPeriodicity !== 'PENDÊNCIAS' ? (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-6xl mb-4 font-black italic">🔒</div>
               <h2 className="text-2xl italic uppercase font-black text-slate-900 font-black italic">AUDITORIA CONCLUÍDA</h2>
               <p className="text-slate-400 text-sm mt-2 font-bold uppercase italic font-black italic">SISTEMA LIBERADO NOVAMENTE AMANHÃ.</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const diasSLA = calcularSLA(task.created_at);
              return (
                <div key={idx} className={`p-6 rounded-[2.5rem] border-2 transition-all relative font-black italic ${task.frozen ? 'opacity-50 grayscale bg-slate-100 border-slate-200 text-slate-900 font-black italic' : task.status === 'Não Conforme' ? 'border-amber-400 bg-amber-50/50 text-slate-900 font-black italic' : task.status === 'Conforme' ? 'border-green-400 bg-green-50/30 text-slate-900 font-black italic' : 'border-slate-100 bg-slate-50 text-slate-900 font-black italic'}`}>
                  {task.frozen && <div className="absolute top-4 right-6 text-xl font-black italic">🔒</div>}
                  {!task.frozen && task.status === 'Não Conforme' && (
                    <div className={`absolute top-2 right-12 px-2 py-1 rounded-md text-[7px] font-black italic shadow-sm font-black italic ${diasSLA > 0 ? 'bg-red-600 text-white font-black italic' : 'bg-amber-500 text-black font-black italic'}`}>
                      SLA: {diasSLA === 0 ? 'HOJE' : `${diasSLA} DIAS`}
                    </div>
                  )}
                  <div className="space-y-6 text-slate-900 font-black italic">
                    <p className="text-lg leading-tight font-black italic uppercase text-slate-900 font-black italic">{task.description}</p>
                    {currentPeriodicity === 'PENDÊNCIAS' ? (
                      <div className="space-y-4 pt-4 border-t-2 border-amber-200 text-slate-900 font-black italic">
                         <div className="bg-amber-100 p-4 rounded-2xl border-l-4 border-amber-500 text-slate-900 font-black italic">
                            <p className="text-[7px] text-amber-700 font-black uppercase italic font-black italic">RÉPLICA ENVIADA AO RH NO DIA DA AUDITORIA:</p>
                            <p className="text-xs italic font-bold text-slate-900 font-black italic">"{task.observation}"</p>
                         </div>
                         <button onClick={() => setResolvingTask(task)} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-xl active:scale-95 text-sm transition-all text-white font-black italic">✓ RESOLVER ESTE PROBLEMA</button>
                      </div>
                    ) : task.subStatuses ? (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-3">Avalie cada balcão individualmente:</p>
                        {Object.keys(task.subStatuses).map(subItem => (
                          <div key={subItem} className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-700">{subItem}</span>
                            <div className="flex gap-2">
                              <button disabled={task.frozen} onClick={() => handleSubStatusChange(idx, subItem, 'Conforme')} className={`px-3 py-2 rounded-lg text-[8px] border-2 transition-all font-black ${task.subStatuses[subItem] === 'Conforme' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-slate-300 border-slate-100'}`}>CONFORME</button>
                              <button disabled={task.frozen} onClick={() => handleSubStatusChange(idx, subItem, 'Não Conforme')} className={`px-3 py-2 rounded-lg text-[8px] border-2 transition-all font-black ${task.subStatuses[subItem] === 'Não Conforme' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-300 border-slate-100'}`}>NÃO CONFORME</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 font-black italic">
                        <button disabled={task.frozen} onClick={() => handleStatusChange(idx, 'Conforme')} className={`flex-1 py-5 rounded-2xl text-[10px] border-2 transition-all shadow-sm font-black italic ${task.status === 'Conforme' ? 'bg-green-600 text-white border-green-600 shadow-md font-black italic' : 'bg-white text-slate-400 border-slate-100 font-black italic'}`}>CONFORME</button>
                        <button disabled={task.frozen} onClick={() => handleStatusChange(idx, 'Não Conforme')} className={`flex-1 py-5 rounded-2xl text-[10px] border-2 transition-all shadow-sm font-black italic ${task.status === 'Não Conforme' ? 'bg-red-600 text-white border-red-600 shadow-md font-black italic' : 'bg-white text-slate-400 border-slate-100 font-black italic'}`}>NÃO CONFORME</button>
                      </div>
                    )}
                    {task.status !== 'Aguardando' && currentPeriodicity !== 'PENDÊNCIAS' && (
                      <div className="space-y-4 pt-4 border-t border-slate-200 font-black italic">
                        {task.status === 'Não Conforme' && (
                          <>
                            <div className="bg-amber-100 p-5 rounded-[2rem] border-2 border-amber-300 w-full mb-2">
                              <p className="text-[10px] text-amber-800 font-black uppercase italic mb-2">🗣️ JUSTIFICATIVA / RÉPLICA PARA O RH:</p>
                              <textarea disabled={task.frozen} placeholder="Explique detalhadamente o motivo para o RH..." className="w-full p-4 rounded-2xl border border-amber-300 text-black font-bold outline-none text-sm uppercase italic shadow-inner bg-white min-h-[80px]" value={task.observation} onChange={(e) => updateTaskData(idx, 'observation', e.target.value)} />
                              {!task.frozen && <p className={`text-[8px] text-right mt-2 uppercase font-black ${task.observation?.length >= 15 ? 'text-green-600' : 'text-red-500'}`}>{task.observation?.length || 0}/15 CARACTERES EXIGIDOS</p>}
                            </div>
                            <div className="flex flex-wrap gap-3 items-center font-black italic">
                              {task.photos?.map((p: string, pIdx: number) => (
                                  <div key={pIdx} className="w-16 h-16 rounded-xl border-2 border-amber-300 overflow-hidden shadow-sm relative font-black italic">
                                      <img src={p} className="w-full h-full object-cover font-black italic" />
                                      {!task.frozen && <button onClick={() => handleRemovePhoto(idx, pIdx)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-lg shadow-md text-white font-black font-black italic">X</button>}
                                  </div>
                              ))}
                              {!task.frozen && (
                                  <label className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl cursor-pointer shadow-md active:scale-95 transition-all border-2 border-white text-white font-black font-black italic">
                                    +
                                    <input type="file" accept="image/*" capture="environment" className="hidden font-black italic" onChange={async (e: any) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      try {
                                        const imageCompression = (await import('browser-image-compression')).default;
                                        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1024, useWebWorker: true };
                                        const compressedFile = await imageCompression(file, options);
                                        const reader = new FileReader();
                                        reader.onloadend = () => handleAddPhoto(idx, reader.result);
                                        reader.readAsDataURL(compressedFile);
                                      } catch (error) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => handleAddPhoto(idx, reader.result);
                                        reader.readAsDataURL(file);
                                      }
                                    }} />
                                  </label>
                              )}
                            </div>
                          </>
                        )}
                        {!task.frozen && <button onClick={() => freezeTask(idx)} className="w-full bg-indigo-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 border-b-4 border-indigo-700 text-white font-black italic">✓ FINALIZAR ESTA TAREFA</button>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {currentPeriodicity === 'PENDÊNCIAS' && filteredTasks.length === 0 && (
            <div className="text-center py-20 text-slate-900 font-black italic">
               <div className="text-5xl mb-4 font-black italic">✨</div>
               <h2 className="text-xl italic font-black uppercase text-slate-900 font-black italic">Sem pendências ativas!</h2>
               <p className="text-slate-400 text-[10px] mt-2 italic font-bold uppercase font-black italic">SETOR OPERANDO EM CONFORMIDADE TOTAL.</p>
            </div>
          )}
        </main>

        {resolvingTask && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 text-slate-900 font-black italic">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl border-t-8 border-green-500 text-slate-900 font-black italic">
              <h2 className="text-2xl mb-2 italic font-black uppercase text-slate-900 text-slate-900 font-black italic">REGISTRAR SOLUÇÃO</h2>
              <p className="text-[9px] text-slate-400 mb-6 uppercase font-bold text-slate-400 leading-tight font-black italic">Tarefa: {resolvingTask.description}</p>
              <div className="space-y-4 text-left text-slate-900 font-black italic">
                <p className="text-[10px] text-green-600 font-black uppercase italic font-black italic">O QUE FOI FEITO PARA RESOLVER?</p>
                <textarea className="w-full p-5 rounded-[2rem] border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none h-32 uppercase shadow-inner italic font-black italic" placeholder="EX: REPOSIÇÃO EFETUADA..." value={tratativaTexto} onChange={(e) => setTratativaTexto(e.target.value)} />
                <div className="flex gap-2 pt-4 text-slate-900 font-black italic">
                   <button onClick={() => setResolvingTask(null)} className="flex-1 bg-slate-100 py-5 rounded-2xl text-[10px] text-slate-400 font-black uppercase font-black italic">CANCELAR</button>
                   <button onClick={finalizarResolucao} disabled={loading || !tratativaTexto} className={`flex-[2] py-5 rounded-2xl text-[10px] font-black text-white shadow-xl italic uppercase font-black italic ${loading || !tratativaTexto ? 'bg-slate-300 font-black italic' : 'bg-green-600 active:scale-95 font-black italic'} text-white font-black italic`}>{loading ? 'SALVANDO...' : '✓ CONFIRMAR RESOLUÇÃO'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 MODAL DO TOP 10 PARA BUSCAR PRODUTOS */}
        {isModalTop10Open && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-100 w-full max-w-2xl rounded-[3rem] shadow-2xl border-t-8 border-indigo-500 overflow-hidden flex flex-col h-[80vh]">
              <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase italic text-slate-900">Buscar Produto</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-1">Adicionando à lista: {activeTop10Category}</p>
                </div>
                <button onClick={() => { setIsModalTop10Open(false); setSearchTerm(''); }} className="bg-slate-100 text-slate-600 w-10 h-10 rounded-full font-black text-lg hover:bg-slate-200">X</button>
              </div>
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                <input 
                  type="text" 
                  placeholder="DIGITE O NOME DO PRODUTO..." 
                  className="w-full p-4 rounded-xl border-2 border-slate-200 uppercase text-xs font-black italic text-slate-900 outline-none focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-2">
                {getFilteredProducts().map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-indigo-300 transition-all">
                    <div>
                      <p className="text-[10px] text-indigo-500 font-black italic">CÓD: {item.id}</p>
                      <p className="text-xs text-slate-800 font-bold uppercase italic leading-tight">{item.name}</p>
                    </div>
                    <button onClick={() => handleAddTop10(item)} className="bg-indigo-600 text-white w-8 h-8 rounded-lg font-black shadow-md hover:scale-105 active:scale-95">+</button>
                  </div>
                ))}
                {getFilteredProducts().length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-bold uppercase italic text-xs">Nenhum produto encontrado.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🚀 BOTÃO DE FINALIZAR */}
        {!isLockedToday && !foraDoHorario && currentPeriodicity !== 'PENDÊNCIAS' && (
          <footer className="p-8 bg-slate-50 text-center border-t border-slate-200 rounded-b-[3.5rem] font-black italic">
            <button onClick={submitChecklist} disabled={loading} className={`w-full py-7 rounded-[2.5rem] shadow-xl text-xl transition-all active:scale-95 font-black italic uppercase border-b-8 font-black italic ${loading ? 'bg-slate-400 border-slate-500 font-black italic' : 'bg-black text-white border-slate-800 hover:bg-slate-900 font-black italic'}`}>{loading ? 'SINCRONIZANDO...' : currentPeriodicity === 'TOP 10' ? 'SALVAR ACOMPANHAMENTO TOP 10' : `FINALIZAR AUDITORIA`}</button>
          </footer>
        )}
      </div>
    </div>
  );
}