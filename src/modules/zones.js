// Delivery Zones Configuration & Auto-detection Engine for Nigeria
export const DELIVERY_ZONES = {
  // Lagos Island Core
  lagos_island_core: {
    id: 'lagos_island_core',
    name: 'Lagos Island Core (Lekki 1, Ikoyi, VI, Oniru, Banana Island)',
    shortName: 'Lagos Island Core',
    type: 'lagos',
    fee: 4500,
    keywords: ['lekki 1', 'lekki phase 1', 'ikoyi', 'victoria island', ' vi ', 'oniru', 'banana island', 'bourdillon', 'admiralty', 'maroko']
  },
  // Lagos Island Extended
  lagos_island_ext: {
    id: 'lagos_island_ext',
    name: 'Lagos Island Extended (Chevron, Ikate, Agungi, VGC, Ajah, Sangotedo)',
    shortName: 'Lagos Island Extended',
    type: 'lagos',
    fee: 5500,
    keywords: ['chevron', 'ikate', 'osapa', 'agungi', 'vgc', 'victoria garden', 'ajah', 'sangotedo', 'lekki phase 2', 'jakande', 'ilasan', 'badore', 'abraham adesanya']
  },
  // Lagos Island Far Axis
  lagos_island_far: {
    id: 'lagos_island_far',
    name: 'Lagos Island Far Axis (Awoyaya, Lakowe, Bogije, Epe)',
    shortName: 'Lagos Island Far Axis',
    type: 'lagos',
    fee: 6500,
    keywords: ['awoyaya', 'lakowe', 'bogije', 'eleko', 'epe', 'ibeju lekki', 'ibeju-lekki']
  },
  // Lagos Magodo / Omole / Shangisha Axis
  lagos_magodo: {
    id: 'lagos_magodo',
    name: 'Magodo / Omole / Shangisha Axis',
    shortName: 'Magodo / Omole / Shangisha',
    type: 'lagos',
    fee: 4500,
    keywords: ['magodo', 'magodo phase 1', 'magodo phase 2', 'magodo brooks', 'omole', 'omole phase 1', 'omole phase 2', 'shangisha', 'cmd road']
  },
  // Lagos Mainland Central / Ikeja Axis
  lagos_mainland_central: {
    id: 'lagos_mainland_central',
    name: 'Lagos Mainland Central / Ikeja (Ikeja GRA, Maryland, Gbagada)',
    shortName: 'Lagos Mainland Central / Ikeja',
    type: 'lagos',
    fee: 4000,
    keywords: ['ikeja', 'maryland', 'opebi', 'allen', 'ilupeju', 'anthony', 'ogudu', 'gbagada', 'shonibare', 'alausa']
  },
  // Lagos Mainland Near
  lagos_mainland_near: {
    id: 'lagos_mainland_near',
    name: 'Lagos Mainland Near (Yaba, Surulere, Shomolu, Ebute Metta)',
    shortName: 'Lagos Mainland Near',
    type: 'lagos',
    fee: 3500,
    keywords: ['yaba', 'surulere', 'shomolu', 'somolu', 'ebute metta', 'ebute-metta', 'bariga', 'akoka', 'onike', 'fadeyi', 'tejuosho', 'bode thomas', 'adeniran ogunsanya']
  },
  // Lagos Mainland West / Suburbs
  lagos_mainland_west: {
    id: 'lagos_mainland_west',
    name: 'Lagos Mainland West (Festac, Okota, Isolo, Agege, Alimosho, Berger)',
    shortName: 'Lagos Mainland West',
    type: 'lagos',
    fee: 4500,
    keywords: ['festac', 'amuwo', 'amuwo odofin', 'okota', 'isolo', 'oshodi', 'agege', 'alimosho', 'egbeda', 'ipaja', 'idimu', 'ojodu', 'berger', 'ijaiye', 'meiran', 'abule egba', 'ejigbo', 'ikotun']
  },
  // Lagos Mainland Far Outskirts
  lagos_mainland_far: {
    id: 'lagos_mainland_far',
    name: 'Lagos Mainland Outskirts (Ikorodu, Ojo, LASU, Badagry)',
    shortName: 'Lagos Mainland Outskirts',
    type: 'lagos',
    fee: 5000,
    keywords: ['ikorodu', 'ojo', 'satellite town', 'lasu', 'trade fair', 'badagry', 'agbara', 'alaba']
  },

  // Zone 6: Abuja Central
  abuja_central: {
    id: 'abuja_central',
    name: 'Zone 6: Abuja Central (Maitama, Wuse, Garki, Asokoro, Guzape, Jabi)',
    shortName: 'Abuja Central (Zone 6)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['maitama', 'wuse', 'wuse 2', 'wuse ii', 'garki', 'asokoro', 'guzape', 'jabi', 'utako', 'mabushi', 'central area', 'cbd abuja']
  },
  // Zone 6: Abuja Outer / Satellite
  abuja_outer: {
    id: 'abuja_outer',
    name: 'Zone 6: Abuja Outer / Satellite (Gwarinpa, Apo, Lokogoma, Kubwa, Lugbe)',
    shortName: 'Abuja Outer / Satellite (Zone 6)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['abuja', 'fct', 'gwarinpa', 'life camp', 'apo', 'lokogoma', 'dawaki', 'kubwa', 'lugbe', 'airport road', 'karu', 'nyanya', 'bwari', 'mararaba', 'mpape', 'katampe']
  },
  // Zone 2: South-West (Ibadan, Abeokuta, Ijebu Ode, Osogbo, Akure, Ado Ekiti)
  zone_2_southwest: {
    id: 'zone_2_southwest',
    name: 'Zone 2: South-West (Ibadan, Abeokuta, Ijebu Ode, Osogbo, Akure, Ado Ekiti)',
    shortName: 'Zone 2 (South-West)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4000,
    officeFee: 3500,
    doorstepFee: 5000,
    keywords: ['ibadan', 'oyo', 'bodija', 'oluyole', 'jericho', 'ring road', 'akobo', 'samonda', 'university of ibadan', 'dugbe', 'iyaganku', 'agodi', 'ogbomoso', 'abeokuta', 'ijebu ode', 'ijebu-ode', 'ijebu', 'osogbo', 'oshogbo', 'osun', 'akure', 'ondo', 'ado ekiti', 'ado-ekiti', 'ekiti']
  },
  // Zone 1: Ogun Border Towns (Lagos-Ogun border corridor)
  ogun_border: {
    id: 'ogun_border',
    name: 'Zone 1: Ogun Border Towns (Magboro, Arepo, Ibafo, Mowe, Ota, Sagamu)',
    shortName: 'Zone 1 (Ogun Border Towns)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['ogun', 'magboro', 'arepo', 'ibafo', 'mowe', 'ota', 'sagamu', 'shagamu']
  },
  // Zone 3: Enugu, Abakaliki, Calabar
  zone_3_east_south: {
    id: 'zone_3_east_south',
    name: 'Zone 3: Enugu, Abakaliki, Calabar',
    shortName: 'Zone 3 (Enugu / Abakaliki / Calabar)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['enugu', 'abakaliki', 'ebonyi', 'calabar', 'cross river']
  },
  // Zone 4: Port Harcourt, Owerri, Aba, Yenagoa, Uyo
  zone_4_south_south: {
    id: 'zone_4_south_south',
    name: 'Zone 4: Port Harcourt, Owerri, Aba, Yenagoa, Uyo',
    shortName: 'Zone 4 (PH / Owerri / Aba / Yenagoa / Uyo)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['port harcourt', 'portharcourt', 'rivers', 'peter odili', 'woji', 'd/line', 'trans-amadi', 'ada george', 'rumuokoro', 'rumuola', 'diobu', 'choba', 'owerri', 'imo', 'aba', 'abia', 'umuahia', 'yenagoa', 'bayelsa', 'uyo', 'akwa ibom']
  },
  // Zone 5: Benin, Asaba, Warri, Onitsha
  zone_5_edo_delta_anambra: {
    id: 'zone_5_edo_delta_anambra',
    name: 'Zone 5: Benin, Asaba, Warri, Onitsha',
    shortName: 'Zone 5 (Benin / Asaba / Warri / Onitsha)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['benin', 'benin city', 'edo', 'asaba', 'warri', 'delta', 'effurun', 'ughelli', 'sapele', 'onitsha', 'awka', 'anambra', 'nnewi']
  },
  // Zone 6: Ilorin, Lafia, Lokoja
  zone_6_north_central: {
    id: 'zone_6_north_central',
    name: 'Zone 6: Ilorin, Lafia, Lokoja',
    shortName: 'Zone 6 (Ilorin / Lafia / Lokoja)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 4500,
    officeFee: 4500,
    doorstepFee: 6000,
    keywords: ['ilorin', 'kwara', 'lafia', 'nasarawa', 'lokoja', 'kogi']
  },
  // Zone 7 (Kaduna, Kano)
  zone_7_pickup: {
    id: 'zone_7_pickup',
    name: 'Zone 7: Kaduna, Kano',
    shortName: 'Zone 7 (Kaduna / Kano)',
    type: 'interstate',
    officeAvailable: true,
    parkFee: 5500,
    officeFee: 8500,
    doorstepFee: 10000,
    keywords: ['kaduna', 'kano']
  },
  // Zone 7 (Northern & Remote Hubs)
  zone_7_doorstep: {
    id: 'zone_7_doorstep',
    name: 'Zone 7: Jos, Minna, Makurdi, Sokoto, Bauchi, Yola, Zaria, Nsukka, etc.',
    shortName: 'Zone 7',
    type: 'interstate',
    officeAvailable: false,
    parkFee: 4500,
    officeFee: null,
    doorstepFee: 10000,
    keywords: ['bauchi', 'birnin kebbi', 'kebbi', 'bonny', 'damaturu', 'yobe', 'dutse', 'jigawa', 'gombe', 'gusau', 'zamfara', 'jalingo', 'taraba', 'jos', 'plateau', 'katsina', 'makurdi', 'benue', 'maiduguri', 'borno', 'minna', 'niger', 'nsukka', 'sokoto', 'suleja', 'yola', 'adamawa', 'zaria']
  }
};

export function autoDetectDeliveryZoneFromAddress(addressStr, cityStr) {
  const fullText = ` ${addressStr || ''} ${cityStr || ''} `.toLowerCase();
  for (const key of Object.keys(DELIVERY_ZONES)) {
    const zone = DELIVERY_ZONES[key];
    for (const kw of zone.keywords) {
      const trimmedKw = kw.trim();
      if (!trimmedKw) continue;
      const escaped = trimmedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
      if (re.test(fullText)) {
        return zone.id;
      }
    }
  }
  if (fullText.includes('lagos') || fullText.includes('mainland')) {
    return 'lagos_mainland_central';
  }
  if (cityStr && !cityStr.toLowerCase().includes('lagos') && cityStr.trim().length > 2) {
    return 'zone_7_doorstep';
  }
  return null;
}
