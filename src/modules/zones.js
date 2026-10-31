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
  // Lagos Mainland Central / Ikeja Axis
  lagos_mainland_central: {
    id: 'lagos_mainland_central',
    name: 'Lagos Mainland Central / Ikeja (Ikeja GRA, Maryland, Magodo, Gbagada)',
    shortName: 'Lagos Mainland Central / Ikeja',
    type: 'lagos',
    fee: 4000,
    keywords: ['ikeja', 'maryland', 'opebi', 'allen', 'ilupeju', 'anthony', 'ogudu', 'magodo', 'omole', 'gbagada', 'shonibare', 'alausa']
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

  // Interstate: Abuja Central
  abuja_central: {
    id: 'abuja_central',
    name: 'Abuja Central (Maitama, Wuse, Garki, Asokoro, Guzape, Jabi)',
    shortName: 'Abuja Central',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['maitama', 'wuse', 'wuse 2', 'wuse ii', 'garki', 'asokoro', 'guzape', 'jabi', 'utako', 'mabushi', 'central area', 'cbd abuja']
  },
  // Interstate: Abuja Outer / Satellite
  abuja_outer: {
    id: 'abuja_outer',
    name: 'Abuja Outer / Satellite (Gwarinpa, Apo, Lokogoma, Kubwa, Lugbe)',
    shortName: 'Abuja Outer / Satellite',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['abuja', 'fct', 'gwarinpa', 'life camp', 'apo', 'lokogoma', 'dawaki', 'kubwa', 'lugbe', 'airport road', 'karu', 'nyanya', 'bwari', 'mararaba', 'mpape', 'katampe']
  },
  // Interstate: Oyo / Ibadan
  ibadan: {
    id: 'ibadan',
    name: 'Oyo / Ibadan (Bodija, Oluyole, Jericho, Ring Road, Akobo)',
    shortName: 'Oyo / Ibadan',
    type: 'interstate',
    parkFee: 4000,
    doorstepFee: 6000,
    keywords: ['ibadan', 'oyo', 'bodija', 'oluyole', 'jericho', 'ring road', 'akobo', 'samonda', 'university of ibadan', 'dugbe', 'iyaganku', 'agodi', 'ogbomoso']
  },
  // Interstate: Ogun State
  ogun: {
    id: 'ogun',
    name: 'Ogun (Magboro, Arepo, Ibafo, Mowe, Ota, Abeokuta)',
    shortName: 'Ogun State',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['ogun', 'magboro', 'arepo', 'ibafo', 'mowe', 'ota', 'sagamu', 'shagamu', 'abeokuta', 'ijebu', 'ijebu ode']
  },
  // Interstate: Rivers / Port Harcourt
  ph: {
    id: 'ph',
    name: 'Rivers / Port Harcourt (Old/New GRA, Peter Odili, Woji, D/Line)',
    shortName: 'Rivers / Port Harcourt',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['port harcourt', 'portharcourt', 'rivers', 'peter odili', 'woji', 'd/line', 'trans-amadi', 'ada george', 'rumuokoro', 'rumuola', 'diobu', 'choba']
  },
  // Interstate: Edo & Delta
  edo_delta: {
    id: 'edo_delta',
    name: 'Edo & Delta (Benin City, Asaba, Warri)',
    shortName: 'Edo & Delta',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['benin', 'benin city', 'edo', 'asaba', 'warri', 'delta', 'effurun', 'ughelli', 'sapele']
  },
  // Interstate: South-East Hubs
  southeast: {
    id: 'southeast',
    name: 'South-East Hubs (Enugu, Owerri, Awka, Onitsha, Aba)',
    shortName: 'South-East Hubs',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['enugu', 'owerri', 'imo', 'awka', 'onitsha', 'anambra', 'aba', 'umuahia', 'abia', 'abakaliki', 'ebonyi', 'nnewi']
  },
  // Interstate: Northern Hubs
  northern_hubs: {
    id: 'northern_hubs',
    name: 'Northern Hubs (Kano, Kaduna, Jos, Ilorin)',
    shortName: 'Northern Hubs',
    type: 'interstate',
    parkFee: 5500,
    doorstepFee: 7000,
    keywords: ['kano', 'kaduna', 'jos', 'plateau', 'ilorin', 'kwara', 'zaria', 'katsina', 'sokoto']
  },
  // Interstate: All Other States Nationwide
  nationwide_other: {
    id: 'nationwide_other',
    name: 'Other States Nationwide (Uyo, Calabar, Bayelsa, etc.)',
    shortName: 'Other States Nationwide',
    type: 'interstate',
    parkFee: 4500,
    doorstepFee: 6000,
    keywords: ['uyo', 'akwa ibom', 'calabar', 'cross river', 'yenagoa', 'bayelsa', 'osogbo', 'osun', 'akure', 'ondo', 'ado-ekiti', 'ekiti', 'makurdi', 'benue', 'lokoja', 'kogi', 'minna', 'niger', 'lafia', 'nasarawa', 'bauchi', 'gombe', 'taraba', 'yobe', 'adamawa']
  }
};

export function autoDetectDeliveryZoneFromAddress(addressStr, cityStr) {
  const fullText = ` ${addressStr || ''} ${cityStr || ''} `.toLowerCase();
  for (const key of Object.keys(DELIVERY_ZONES)) {
    const zone = DELIVERY_ZONES[key];
    for (const kw of zone.keywords) {
      if (fullText.includes(kw)) {
        return zone.id;
      }
    }
  }
  if (fullText.includes('lagos') || fullText.includes('mainland')) {
    return 'lagos_mainland_central';
  }
  if (cityStr && !cityStr.toLowerCase().includes('lagos') && cityStr.trim().length > 2) {
    return 'nationwide_other';
  }
  return null;
}
